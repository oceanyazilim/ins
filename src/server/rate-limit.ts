import 'server-only';
import { createHmac } from 'node:crypto';
import { lt, sql } from 'drizzle-orm';
import { db } from '@/db';
import { rateLimits } from '@/db/schema';
import { appSecret } from '@/lib/env';

/** IP adresleri ham olarak saklanmaz; anahtarlı özetle tutulur. */
export const hashIp = (ip: string) => createHmac('sha256', appSecret()).update(ip).digest('hex');

/**
 * Sabit pencereli sayaç. İzin verilen deneme sayısı aşıldıysa false döner.
 * Veritabanında tutulduğu için birden fazla sunucu örneğinde de tutarlıdır.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const windowStart = new Date(Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000);
  const [row] = await db
    .insert(rateLimits)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({ target: [rateLimits.key, rateLimits.windowStart], set: { count: sql`${rateLimits.count} + 1` } })
    .returning({ count: rateLimits.count });
  if (Math.random() < 0.02) {
    await db.delete(rateLimits).where(lt(rateLimits.windowStart, new Date(Date.now() - 24 * 3600_000)));
  }
  return (row?.count ?? 1) <= limit;
}
