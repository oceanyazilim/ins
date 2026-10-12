/**
 * Yönetici hesabı oluşturur veya parolasını günceller.
 * Kullanım: ADMIN_EMAIL=... ADMIN_PASSWORD=... [ADMIN_NAME=...] [ADMIN_ROLE=admin|editor] npm run admin:create
 * Parola kaynak koda veya veritabanına düz metin olarak yazılmaz.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../src/db/schema';
import { hashPassword } from '../src/lib/password';

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? '';
  const role = process.env.ADMIN_ROLE === 'editor' ? 'editor' : 'admin';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('ADMIN_EMAIL geçerli bir e-posta olmalı.');
  if (password.length < 12) throw new Error('ADMIN_PASSWORD en az 12 karakter olmalı.');

  const client = postgres(process.env.DATABASE_URL ?? 'postgres://ocean:ocean@localhost:54329/ocean', { max: 1 });
  const db = drizzle(client);
  const passwordHash = await hashPassword(password);
  await db
    .insert(users)
    .values({ email, name: process.env.ADMIN_NAME || 'Yönetici', passwordHash, role })
    .onConflictDoUpdate({ target: users.email, set: { passwordHash, role, active: true } });
  await client.end();
  console.log(`Hesap hazır: ${email} (${role})`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
