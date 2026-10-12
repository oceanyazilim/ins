import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';

export const dynamic = 'force-dynamic';

/** Yük dengeleyici ve izleme araçları için sağlık denetimi. */
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ status: 'ok', db: 'up', time: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: 'error', db: 'down' }, { status: 503 });
  }
}
