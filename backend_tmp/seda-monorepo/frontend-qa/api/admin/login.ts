import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createAdminToken, getAdminCookieName } from '../_lib/adminAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const adminKey = process.env.ADMIN_API_KEY;
  const cookieSecret = process.env.ADMIN_COOKIE_SECRET || process.env.ADMIN_API_KEY;
  if (!adminKey || !cookieSecret) {
    res.status(500).json({ error: 'Missing ADMIN_API_KEY/ADMIN_COOKIE_SECRET' });
    return;
  }
  const { key } = (req.body || {}) as { key?: string };
  if (!key || key !== adminKey) {
    res.status(401).json({ error: 'Invalid key' });
    return;
  }
  const token = createAdminToken(cookieSecret);
  const name = getAdminCookieName();
  const cookie = `${name}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24}; ${process.env.VERCEL ? 'Secure; ' : ''}`;
  res.setHeader('Set-Cookie', cookie);
  res.status(200).json({ ok: true });
}

