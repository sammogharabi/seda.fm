import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { parseCookies, verifyAdminToken, getAdminCookieName } from './_lib/adminAuth';

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

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(data);
}
