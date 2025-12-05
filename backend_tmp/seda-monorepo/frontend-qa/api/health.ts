import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getRedis } from './_lib/redisClient';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const result: any = { ok: true, checks: {} };

  // CAPTCHA configuration (server-side secrets only)
  const hcaptchaSecret = process.env.HCAPTCHA_SECRET ? true : false;
  const recaptchaSecret = process.env.RECAPTCHA_SECRET ? true : false;
  result.checks.captcha = {
    provider: hcaptchaSecret ? 'hcaptcha' : recaptchaSecret ? 'recaptcha' : null,
    hasSecret: hcaptchaSecret || recaptchaSecret,
  };

  // Resend (email)
  const resendConfigured = !!process.env.RESEND_API_KEY;
  result.checks.resend = { configured: resendConfigured };

  // Redis (Upstash)
  let redisConfigured = false;
  let redisReachable = false;
  try {
    const redis = getRedis();
    redisConfigured = !!redis;
    if (redis) {
      const pong = await (redis as any).ping?.();
      redisReachable = pong === 'PONG' || pong === 'Ok' || pong === 'OK' || typeof pong === 'string';
    }
  } catch {
    redisReachable = false;
  }
  result.checks.redis = { configured: redisConfigured, reachable: redisReachable };

  // Supabase
  let supaConfigured = false;
  let supaReachable = false;
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    supaConfigured = !!(supabaseUrl && serviceRole);
    if (supaConfigured) {
      const supabase = createClient(supabaseUrl!, serviceRole!, { auth: { persistSession: false } });
      // Lightweight head select to ensure connectivity
      const { error } = await supabase.from('beta_signups').select('id', { head: true, count: 'exact' });
      supaReachable = !error;
    }
  } catch {
    supaReachable = false;
  }
  result.checks.supabase = { configured: supaConfigured, reachable: supaReachable };

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(result);
}

