/**
 * Yerel geliştirme için gömülü PostgreSQL (kurulum gerektirmez).
 * Veriler .data/pg altında kalıcıdır. Üretimde yönetilen bir PostgreSQL kullanın.
 */
import EmbeddedPostgres from 'embedded-postgres';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('.data/pg');
const port = Number(process.env.DEV_DB_PORT ?? 54329);

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: dir,
    user: 'ocean',
    password: 'ocean',
    port,
    persistent: true,
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
    onLog: () => {},
    onError: (e) => console.error(e),
  });
  const fresh = !fs.existsSync(path.join(dir, 'PG_VERSION'));
  if (fresh) await pg.initialise();
  await pg.start();
  if (fresh) await pg.createDatabase('ocean');
  console.log(`PostgreSQL hazır: postgres://ocean:ocean@localhost:${port}/ocean`);
  const stop = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
