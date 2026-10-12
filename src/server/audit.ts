import 'server-only';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';

export async function logAudit(
  userId: number | null,
  action: string,
  entity: string,
  entityId: string | number | null,
  summary: string,
  meta?: Record<string, unknown>,
): Promise<void> {
  await db.insert(auditLogs).values({ userId, action, entity, entityId: entityId === null ? null : String(entityId), summary, meta });
}
