import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt, lt } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { db } from '@/db';
import { sessions, users } from '@/db/schema';
import { env } from '@/lib/env';
import { can, type Permission, type Role } from '@/lib/permissions';

const COOKIE = 'ocean_admin';
const SESSION_HOURS = 12;

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600_000);
  const ua = (await headers()).get('user-agent')?.slice(0, 300) ?? null;
  await db.insert(sessions).values({ id: sha256(token), userId, expiresAt, userAgent: ua });
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, sha256(token)));
  jar.delete(COOKIE);
}

export type CurrentUser = { id: number; email: string; name: string; role: Role };

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, sha256(token)), gt(sessions.expiresAt, new Date()), eq(users.active, true)))
    .limit(1);
  return row ?? null;
});

/** Sayfalarda ve server action'larda kullanılır; yetki yoksa giriş sayfasına yönlendirir. */
export async function requireUser(permission?: Permission): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/giris');
  if (permission && !can(user.role, permission)) redirect('/admin?yetki=yok');
  return user;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'local';
}
