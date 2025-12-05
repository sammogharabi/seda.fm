import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { parseCookies, verifyAdminToken, getAdminCookieName } from './_lib/adminAuth';

function parseUTMFromUA(ua?: string): { source?: string; medium?: string; campaign?: string } {
  if (!ua) return {};
  const out: any = {};
  const re = /(utm_source|utm_medium|utm_campaign)=([^\s]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(ua))) {
    const key = m[1].replace('utm_', '');
    out[key] = decodeURIComponent(m[2]);
  }
  return out;
}

function toCSV(rows: { email: string; ts: string; ua?: string }[]) {
  const header = ['Email Address', 'Signup Timestamp', 'UTM Source', 'UTM Medium', 'UTM Campaign'];
  const lines = [header.join(',')];
  for (const r of rows) {
    const email = '"' + (r.email?.replaceAll('"', '""') || '') + '"';
    const ts = '"' + (r.ts?.replaceAll('"', '""') || '') + '"';
    const utm = parseUTMFromUA(r.ua);
    const src = '"' + ((utm.source || '').replaceAll('"', '""')) + '"';
    const med = '"' + ((utm.medium || '').replaceAll('"', '""')) + '"';
    const camp = '"' + ((utm.campaign || '').replaceAll('"', '""')) + '"';
    lines.push([email, ts, src, med, camp].join(','));
  }
  return lines.join('\n');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const adminKey = process.env.ADMIN_API_KEY;
  const cookieSecret = process.env.ADMIN_COOKIE_SECRET || process.env.ADMIN_API_KEY || '';
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : undefined;
  const cookies = parseCookies(req);
  const cookieName = getAdminCookieName();
  const cookieToken = cookies[cookieName];
  const cookieValid = cookieToken ? verifyAdminToken(cookieToken, cookieSecret) : false;
  if (!adminKey || (!cookieValid && token !== adminKey)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    res.status(500).json({ error: 'Missing Supabase server env vars' });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from('beta_signups')
    .select('email, ts, ua')
    .order('ts', { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const csv = toCSV((data as any[]) || []);
  const filename = `seda-beta-signups-${new Date().toISOString().slice(0,10)}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(csv);
}
