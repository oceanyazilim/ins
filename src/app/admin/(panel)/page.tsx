import { count, desc, eq, gte, sql } from 'drizzle-orm';
import Link from 'next/link';
import { db } from '@/db';
import { auditLogs, blogPosts, leads, users } from '@/db/schema';
import { Card, Flash, LEAD_TONES, PageHeader, StatusPill, type SearchParams } from '@/features/admin/ui';
import { labelOf, LEAD_STATUSES, SERVICE_TYPES } from '@/features/quote/options';
import { formatDateTime } from '@/lib/format';
import { requireUser } from '@/server/auth';

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

function Bars({ rows, total }: { rows: { label: string; n: number }[]; total: number }) {
  if (rows.length === 0) return <p className="text-sm text-muted">Henüz veri yok.</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex justify-between text-sm">
            <span className="text-navy-900">{r.label}</span>
            <span className="font-semibold tabular-nums text-navy-900">{r.n}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-soft">
            <div className="h-full rounded-full bg-ocean-600" style={{ width: `${total ? Math.max(4, (r.n / total) * 100) : 0}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser();
  const since = daysAgo(30);
  const week = sql<string>`to_char(date_trunc('week', ${leads.createdAt}), 'DD.MM')`;
  const [byStatus, byService, byDistrict, weekly, recent, activity, review] = await Promise.all([
    db.select({ status: leads.status, n: count() }).from(leads).groupBy(leads.status),
    db.select({ label: leads.serviceType, n: count() }).from(leads).groupBy(leads.serviceType).orderBy(desc(count())),
    db.select({ label: leads.district, n: count() }).from(leads).where(sql`${leads.district} is not null`).groupBy(leads.district).orderBy(desc(count())).limit(8),
    db.select({ label: week, n: count() }).from(leads).where(gte(leads.createdAt, daysAgo(56))).groupBy(sql`date_trunc('week', ${leads.createdAt})`).orderBy(sql`date_trunc('week', ${leads.createdAt})`),
    db.select().from(leads).orderBy(desc(leads.createdAt)).limit(6),
    db.select({ log: auditLogs, user: users.name }).from(auditLogs).leftJoin(users, eq(users.id, auditLogs.userId)).orderBy(desc(auditLogs.createdAt)).limit(8),
    db.select({ n: count() }).from(blogPosts).where(eq(blogPosts.status, 'review')),
  ]);
  const [last30] = await db.select({ n: count() }).from(leads).where(gte(leads.createdAt, since));
  const n = (st: string[]) => byStatus.filter((r) => st.includes(r.status)).reduce((a, r) => a + r.n, 0);
  const total = byStatus.reduce((a, r) => a + r.n, 0);
  const stats = [
    ['Toplam talep', total],
    ['Yeni', n(['new'])],
    ['Bekleyen', n(['contacted', 'survey_pending', 'quote_sent'])],
    ['Tamamlanan', n(['won', 'completed'])],
    ['Son 30 gün', last30?.n ?? 0],
  ] as const;
  const maxWeek = Math.max(1, ...weekly.map((w) => w.n));

  return (
    <>
      <PageHeader title="Genel Bakış" description="Teklif taleplerinin ve son işlemlerin özeti." />
      <Flash searchParams={searchParams} />

      <dl className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-(--radius-lg) border border-line bg-white p-5">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
            <dd className="mt-2 font-display text-3xl font-extrabold tabular-nums text-navy-900">{value}</dd>
          </div>
        ))}
      </dl>

      {(review[0]?.n ?? 0) > 0 && (
        <p className="mt-4 rounded-(--radius-md) border border-amber-200 bg-amber-50 p-4 text-sm text-warning">
          İnceleme bekleyen {review[0]!.n} blog yazısı var.{' '}
          <Link href="/admin/blog?durum=review" className="font-semibold underline underline-offset-4">
            Yazıları incele
          </Link>
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Hizmete göre talepler">
          <Bars rows={byService.map((r) => ({ label: r.label === 'iletisim' ? 'İletişim formu' : labelOf(SERVICE_TYPES, r.label), n: r.n }))} total={total} />
        </Card>
        <Card title="İlçeye göre talepler">
          <Bars rows={byDistrict.map((r) => ({ label: r.label ?? '—', n: r.n }))} total={total} />
        </Card>
        <Card title="Haftalık talepler" description="Son 8 hafta">
          {weekly.length === 0 ? (
            <p className="text-sm text-muted">Henüz veri yok.</p>
          ) : (
            <ol className="flex h-36 items-end gap-2" aria-label="Haftalık talep sayıları">
              {weekly.map((w) => (
                <li key={w.label} className="flex flex-1 flex-col items-center gap-1 text-xs text-muted">
                  <span className="font-semibold text-navy-900">{w.n}</span>
                  <span className="w-full rounded-t bg-ocean-600" style={{ height: `${(w.n / maxWeek) * 5.5}rem` }} />
                  {w.label}
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Son talepler">
          {recent.length === 0 ? (
            <p className="text-sm text-muted">Henüz talep yok.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/talepler/${l.id}`} className="flex items-center justify-between gap-4 py-3 hover:bg-soft">
                    <span>
                      <span className="block text-sm font-semibold text-navy-900">
                        {l.name} · {l.serviceType === 'iletisim' ? 'İletişim' : labelOf(SERVICE_TYPES, l.serviceType)}
                      </span>
                      <span className="block text-xs text-muted">
                        {l.ref} · {formatDateTime(l.createdAt)}
                      </span>
                    </span>
                    <StatusPill tone={LEAD_TONES[l.status] ?? 'gray'}>{labelOf(LEAD_STATUSES, l.status)}</StatusPill>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Son işlemler">
          <ul className="divide-y divide-line">
            {activity.map(({ log, user }) => (
              <li key={log.id} className="py-3 text-sm">
                <p className="text-navy-900">{log.summary}</p>
                <p className="text-xs text-muted">
                  {user ?? 'Sistem'} · {formatDateTime(log.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
