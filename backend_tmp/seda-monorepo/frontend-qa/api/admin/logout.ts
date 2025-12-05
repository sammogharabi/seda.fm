import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminCookieName } from '../_lib/adminAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const name = getAdminCookieName();
  const cookie = `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${process.env.VERCEL ? 'Secure; ' : ''}`;
  res.setHeader('Set-Cookie', cookie);
  res.status(200).json({ ok: true });
}

