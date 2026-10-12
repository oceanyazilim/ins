import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { leadAttachments } from '@/db/schema';
import { can } from '@/lib/permissions';
import { getCurrentUser } from '@/server/auth';
import { readStored } from '@/server/storage';

export const dynamic = 'force-dynamic';

/** Teklif fotoğrafları herkese açık değildir; yalnızca oturum açmış yetkili kullanıcıya sunulur. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'leads.view')) return new Response('Yetkisiz', { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return new Response('Bulunamadı', { status: 404 });
  const [row] = await db.select().from(leadAttachments).where(eq(leadAttachments.id, id)).limit(1);
  const data = row ? await readStored(row.storageKey) : null;
  if (!row || !data) return new Response('Bulunamadı', { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: { 'Content-Type': row.mime, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Disposition': 'inline' },
  });
}
