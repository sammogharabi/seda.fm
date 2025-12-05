import { Redis } from '@upstash/redis';

export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

export async function rateLimit(redis: ReturnType<typeof getRedis>, key: string, limit: number, windowSec: number) {
  if (!redis) return true;
  try {
    const count = (await (redis as any).incr(key)) as number;
    if (count === 1) {
      await (redis as any).expire(key, windowSec);
    }
    return count <= limit;
  } catch {
    // On Redis errors, be permissive to avoid false 429s
    return true;
  }
}

