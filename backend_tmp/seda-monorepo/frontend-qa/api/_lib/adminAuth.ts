import crypto from 'crypto';
import type { VercelRequest } from '@vercel/node';

const COOKIE_NAME = 'admin_auth';

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function sign(data: string, secret: string) {
  const h = crypto.createHmac('sha256', secret);
  h.update(data);
  return b64url(h.digest());
}

export function createAdminToken(secret: string, ttlSeconds = 60 * 60 * 24) {
  const now = Math.floor(Date.now() / 1000);
  const payload = { iat: now, exp: now + ttlSeconds, v: 1 };
  const payloadStr = JSON.stringify(payload);
  const sig = sign(payloadStr, secret);
  return `${b64url(payloadStr)}.${sig}`;
}

export function verifyAdminToken(token: string | undefined, secret: string) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, sig] = parts;
  const payloadStr = Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
  try {
    const parsed = JSON.parse(payloadStr) as { iat: number; exp: number; v: number };
    const expected = sign(payloadStr, secret);
    if (expected !== sig) return false;
    if (typeof parsed.exp !== 'number' || parsed.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

export function parseCookies(req: VercelRequest): Record<string, string> {
  const header = req.headers.cookie || '';
  const out: Record<string, string> = {};
  header.split(';').forEach((p) => {
    const [k, ...rest] = p.split('=');
    if (!k) return;
    const key = k.trim();
    const value = rest.join('=').trim();
    if (!key) return;
    out[decodeURIComponent(key)] = decodeURIComponent(value);
  });
  return out;
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}

