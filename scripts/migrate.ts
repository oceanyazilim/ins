import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const url = process.env.DATABASE_URL ?? 'postgres://ocean:ocean@localhost:54329/ocean';

async function main() {
  const sql = postgres(url, { max: 1, onnotice: () => {} });
  await migrate(drizzle(sql), { migrationsFolder: './drizzle' });
  await sql.end();
  console.log('Migration tamamlandı.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
