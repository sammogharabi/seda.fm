// Lightweight beta signup collection for UAT.
// - Writes to localStorage under key "beta_waitlist".
// - Can be swapped later to a backend or Supabase.

export type BetaSignupRecord = {
  email: string;
  ts: string; // ISO timestamp
  ua?: string; // user agent
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    ref?: string;
  };
};

const STORAGE_KEY = 'beta_waitlist';
const UTM_KEY = 'beta_utm';

function getUTM() {
  try {
    const raw = localStorage.getItem(UTM_KEY);
    if (!raw) return undefined;
    const u = JSON.parse(raw);
    return {
      source: u.utm_source || u.source,
      medium: u.utm_medium || u.medium,
      campaign: u.utm_campaign || u.campaign,
      term: u.utm_term || u.term,
      content: u.utm_content || u.content,
      ref: u.ref || u.referrer,
    } as BetaSignupRecord['utm'];
  } catch {
    return undefined;
  }
}

/** Try to load Supabase client dynamically only if env vars are present. */
function canUseSupabase(): boolean {
  try {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    return Boolean(url && key);
  } catch {
    return false;
  }
}

async function submitToSupabase(email: string, ua?: string) {
  const { supabase } = await import('../config/supabase');
  const payload = { email: email.trim().toLowerCase(), ua, ts: new Date().toISOString() };
  // Upsert on email to avoid duplicates
  const { error } = await supabase.from('beta_signups').upsert(payload, { onConflict: 'email' });
  if (error) throw new Error(error.message || 'Supabase insert failed');
  return { ok: true as const, stored: 'supabase' as const };
}

export async function submitBetaSignup(
  email: string,
  captchaToken?: string,
  provider?: 'hcaptcha' | 'recaptcha'
): Promise<{ ok: true; stored: 'local' | 'supabase' | 'api' } | { ok: false; error: string }> {
  try {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes('@')) {
      return { ok: false, error: 'Invalid email' };
    }

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;

    // If CAPTCHA site key is present, prefer secured API route
    try {
      const siteKey = (import.meta as any).env?.VITE_CAPTCHA_SITE_KEY as string | undefined;
      if (siteKey) {
        const res = await fetch('/api/beta-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalized, token: captchaToken, ua, provider: provider || 'recaptcha', utm: getUTM() }),
        });
        if (res.ok) return { ok: true, stored: 'api' };
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `API error ${res.status}`);
      }
    } catch (e) {
      // Fall through to Supabase/local
    }

    // Try hCaptcha if configured and reCAPTCHA was not used
    try {
      const hSiteKey = (import.meta as any).env?.VITE_HCAPTCHA_SITE_KEY as string | undefined;
      if (hSiteKey) {
        const res = await fetch('/api/beta-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalized, token: captchaToken, ua, provider: 'hcaptcha', utm: getUTM() }),
        });
        if (res.ok) return { ok: true, stored: 'api' };
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `API error ${res.status}`);
      }
    } catch (e) {
      // Fall through to Supabase/local
    }

    // Prefer Supabase if configured, fallback to local
    if (canUseSupabase()) {
      try {
        return await submitToSupabase(normalized, ua);
      } catch (e) {
        // Fall through to local storage on failure
      }
    }

    const record: BetaSignupRecord = { email: normalized, ts: new Date().toISOString(), ua, utm: getUTM() };
    let list: BetaSignupRecord[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) list = JSON.parse(raw);
    } catch {}
    if (!list.find((r) => r.email === record.email)) {
      list.push(record);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
    return { ok: true, stored: 'local' };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Unknown error' };
  }
}

export async function getBetaSignups(): Promise<BetaSignupRecord[]> {
  // Try Supabase first if configured
  if (canUseSupabase()) {
    try {
      const { supabase } = await import('../config/supabase');
      const { data, error } = await supabase
        .from('beta_signups')
        .select('email, ts, ua')
        .order('ts', { ascending: false });
      if (error) throw error;
      // Ensure dedupe by email keeping latest ts
      const map = new Map<string, BetaSignupRecord>();
      data?.forEach((r: any) => {
        const existing = map.get(r.email);
        if (!existing || new Date(r.ts) > new Date(existing.ts)) {
          map.set(r.email, { email: r.email, ts: r.ts, ua: r.ua ?? undefined });
        }
      });
      return Array.from(map.values());
    } catch {
      // Fall back to local
    }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: BetaSignupRecord[] = raw ? JSON.parse(raw) : [];
    // Sort desc by ts
    return list.sort((a, b) => (a.ts < b.ts ? 1 : -1));
  } catch {
    return [];
  }
}
