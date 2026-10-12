import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/lib/env';
import * as schema from './schema';

const globalForDb = globalThis as unknown as { __oceanSql?: ReturnType<typeof postgres> };

const client =
  globalForDb.__oceanSql ??
  postgres(env.DATABASE_URL, {
    max: env.NODE_ENV === 'production' ? 10 : 5,
    idle_timeout: 20,
    onnotice: () => {},
  });
if (env.NODE_ENV !== 'production') globalForDb.__oceanSql = client;

export const db = drizzle(client, { schema });
export { schema };
export type Db = typeof db;
