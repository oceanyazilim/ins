/**
 * Test veritabanını (ocean_test) sıfırdan kurar: şema, migration, seed ve test yöneticisi.
 * Geliştirme veritabanına dokunmaz. Gömülü PostgreSQL'in çalışıyor olması gerekir (npm run db:start).
 */
import { execSync } from 'node:child_process';
import postgres from 'postgres';

export const TEST_DB_URL = process.env.TEST_DATABASE_URL ?? 'postgres://ocean:ocean@localhost:54329/ocean_test';
export const TEST_ADMIN = { email: 'e2e-admin@test.local', password: 'E2E-Parola-Test-2026!' };

export async function resetTestDb() {
  const url = new URL(TEST_DB_URL);
  const dbName = url.pathname.slice(1);
  if (!/test/.test(dbName)) throw new Error(`Güvenlik: test veritabanı adında "test" geçmeli (${dbName}).`);
  const adminUrl = new URL(TEST_DB_URL);
  adminUrl.pathname = '/postgres';
  const admin = postgres(adminUrl.toString(), { max: 1, onnotice: () => {} });
  const exists = await admin`select 1 from pg_database where datname = ${dbName}`;
  if (exists.length === 0) await admin.unsafe(`create database "${dbName}"`);
  await admin.end();

  const sql = postgres(TEST_DB_URL, { max: 1, onnotice: () => {} });
  await sql.unsafe('drop schema if exists public cascade; create schema public; drop schema if exists drizzle cascade;');
  await sql.end();

  const env = { ...process.env, DATABASE_URL: TEST_DB_URL, ADMIN_EMAIL: TEST_ADMIN.email, ADMIN_PASSWORD: TEST_ADMIN.password, ADMIN_NAME: 'E2E Yönetici' };
  for (const script of ['scripts/migrate.ts', 'scripts/seed.ts', 'scripts/create-admin.ts']) {
    execSync(`npx tsx ${script}`, { env, stdio: 'pipe' });
  }
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/test-db.ts')) {
  resetTestDb()
    .then(() => console.log('Test veritabanı hazır:', TEST_DB_URL))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
