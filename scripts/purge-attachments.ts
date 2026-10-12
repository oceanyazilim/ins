/**
 * Saklama politikası: sonuçlanmış (kazanıldı / kaybedildi / tamamlandı) taleplerin fotoğraflarını,
 * son güncellemeden RETENTION_DAYS gün sonra kalıcı olarak siler. Günlük zamanlanmış görev olarak çalıştırın:
 *   RETENTION_DAYS=90 npm run attachments:purge
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { and, eq, inArray, lt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { leadAttachments, leads } from '../src/db/schema';

const days = Number(process.env.RETENTION_DAYS ?? 90);
const root = path.resolve(process.env.STORAGE_DIR ?? './storage');

async function main() {
  const client = postgres(process.env.DATABASE_URL ?? 'postgres://ocean:ocean@localhost:54329/ocean', { max: 1 });
  const db = drizzle(client);
  const cutoff = new Date(Date.now() - days * 86_400_000);
  const rows = await db
    .select({ id: leadAttachments.id, key: leadAttachments.storageKey })
    .from(leadAttachments)
    .innerJoin(leads, eq(leads.id, leadAttachments.leadId))
    .where(and(inArray(leads.status, ['won', 'lost', 'completed']), lt(leads.updatedAt, cutoff)));
  for (const r of rows) {
    if (/^leads\/\d{4}\/\d{2}\/[a-f0-9]{32}\.webp$/.test(r.key)) await fs.unlink(path.join(root, r.key)).catch(() => {});
    await db.delete(leadAttachments).where(eq(leadAttachments.id, r.id));
  }
  await client.end();
  console.log(`${rows.length} fotoğraf silindi (saklama süresi: ${days} gün).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
