import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import dns from 'dns';
import { getRedis, rateLimit as rateLimitRedis } from './_lib/redisClient';

async function verifyCaptcha(token: string | undefined, remoteIp: string | undefined, provider?: 'hcaptcha' | 'recaptcha') {
  if (!token) return { ok: false as const, error: 'Missing captcha token' };
  const hSecret = process.env.HCAPTCHA_SECRET;
  const rSecret = process.env.RECAPTCHA_SECRET;
  const prefer = provider || (hSecret ? 'hcaptcha' : 'recaptcha');
  try {
    if (prefer === 'hcaptcha') {
      if (!hSecret) return { ok: false as const, error: 'Missing HCAPTCHA_SECRET' };
      const params = new URLSearchParams();
      params.append('secret', hSecret);
      params.append('response', token);
      if (remoteIp) params.append('remoteip', remoteIp);
      const res = await fetch('https://hcaptcha.com/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const data = (await res.json()) as any;
      if (!data.success) return { ok: false as const, error: 'Captcha verification failed' };
      return { ok: true as const };
    } else {
      if (!rSecret) return { ok: false as const, error: 'Missing RECAPTCHA_SECRET' };
      const params = new URLSearchParams();
      params.append('secret', rSecret);
      params.append('response', token);
      if (remoteIp) params.append('remoteip', remoteIp);
      const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const data = (await res.json()) as any;
      if (!data.success) return { ok: false as const, error: 'Captcha verification failed' };
      if (typeof data.score === 'number' && data.score < 0.3) {
        return { ok: false as const, error: 'Captcha score too low' };
      }
      return { ok: true as const };
    }
  } catch (e: any) {
    return { ok: false as const, error: e?.message || 'Captcha verify error' };
  }
}

// Simple in-memory rate limiting (best-effort). Not persistent across cold starts.
const buckets = new Map<string, { count: number; reset: number }>();
function rateLimit(ip: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.reset) {
    buckets.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const ip = String((req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '');
  const redis = getRedis();
  const ipKey = ip.split(',')[0]?.trim() || ip;
  if (redis) {
    const ok = await rateLimitRedis(redis, `rl:ip:${ipKey}`, 10, 60);
    if (!ok) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }
  } else {
    if (!rateLimit(ip)) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }
  }

  const { email, token, ua, provider, utm } = (req.body || {}) as { email?: string; token?: string; ua?: string; provider?: 'hcaptcha' | 'recaptcha'; utm?: any };
  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Invalid email' });
    return;
  }

  // Per-IP+email limiter (3 per 10 minutes)
  const perKey = `${ipKey}|${email.trim().toLowerCase()}`;
  if (redis) {
    const ok2 = await rateLimitRedis(redis, `rl:ipemail:${perKey}`, 3, 10 * 60);
    if (!ok2) {
      res.status(429).json({ error: 'Too many submissions for this email' });
      return;
    }
  } else {
    if (!rateLimit(perKey, 3, 10 * 60_000)) {
      res.status(429).json({ error: 'Too many submissions for this email' });
      return;
    }
  }

  // Basic UA sanity check to reduce scripted clients
  const uaStr = String(ua || '').toLowerCase();
  const badAgents = ['curl', 'python-requests', 'httpclient', 'wget'];
  if (!uaStr || badAgents.some((b) => uaStr.includes(b))) {
    res.status(400).json({ error: 'Suspicious client' });
    return;
  }

  const captcha = await verifyCaptcha(token, ip.split(',')[0]?.trim(), provider);
  if (!captcha.ok) {
    res.status(400).json({ error: captcha.error });
    return;
  }

  // Additional MX validation to reduce throwaway emails
  try {
    const domain = String(email.split('@')[1] || '').toLowerCase();
    const disposable = new Set([
      'mailinator.com','yopmail.com','guerrillamail.com','10minutemail.com','tempmail.com','trashmail.com','sharklasers.com','fakeinbox.com'
    ]);
    if (disposable.has(domain)) {
      res.status(400).json({ error: 'Please use a real email domain' });
      return;
    }
    const mx = await dns.promises.resolveMx(domain).catch(() => [] as dns.MxRecord[]);
    if (!mx || mx.length === 0) {
      // fallback to A record check
      const a = await dns.promises.resolve4(domain).catch(() => [] as string[]);
      if (!a || a.length === 0) {
        res.status(400).json({ error: 'Email domain has no valid MX/A records' });
        return;
      }
    }
  } catch {
    // If DNS fails unexpectedly, continue to avoid false negatives
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    res.status(500).json({ error: 'Missing Supabase server env vars' });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
  let uaCombined = ua || '';
  try {
    if (utm && typeof utm === 'object') {
      const parts: string[] = [];
      if (utm.source) parts.push(`utm_source=${utm.source}`);
      if (utm.medium) parts.push(`utm_medium=${utm.medium}`);
      if (utm.campaign) parts.push(`utm_campaign=${utm.campaign}`);
      if (utm.term) parts.push(`utm_term=${utm.term}`);
      if (utm.content) parts.push(`utm_content=${utm.content}`);
      if (utm.ref) parts.push(`ref=${utm.ref}`);
      if (parts.length) uaCombined = `${uaCombined}${uaCombined ? ' ' : ''}${parts.join(' ')}`;
    }
  } catch {}
  const payload = { email: email.trim().toLowerCase(), ts: new Date().toISOString(), ua: uaCombined } as { email: string; ts: string; ua?: string };

  const { error } = await supabase.from('beta_signups').upsert(payload, { onConflict: 'email' });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // Best-effort thank-you email via Resend (optional)
  (async () => {
    try {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      const FROM_EMAIL = process.env.FROM_EMAIL || 'sedafm <no-reply@seda.fm>';
      if (!RESEND_API_KEY) return;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: email,
          subject: 'Thanks for joining the sedā.fm beta waitlist',
          text: `You're on the list! We'll email you when beta access opens.\n\n— sedā.fm`,
        }),
      });
    } catch {}
  })();

  res.status(200).json({ ok: true });
}
