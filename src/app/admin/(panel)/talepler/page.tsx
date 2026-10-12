import { and, asc, count, desc, eq, ilike, isNotNull, or, type SQL } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonClass } from '@/components/ui/button';
import { db } from '@/db';
import { leads, type LeadStatus } from '@/db/schema';
import { first, Flash, LEAD_TONES, PageHeader, StatusPill, Table, type SearchParams } from '@/features/admin/ui';
import { labelOf, LEAD_STATUSES, SERVICE_TYPES } from '@/features/quote/options';
import { formatDateTime, formatPhone, formatPrice } from '@/lib/format';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Talepler' };
const PER_PAGE = 25;

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser('leads.view');
  const sp = await searchParams;
  const q = first(sp.q)?.trim() ?? '';
  const status = first(sp.durum) ?? '';
  const service = first(sp.hizmet) ?? '';
  const district = first(sp.ilce) ?? '';
  const sort = first(sp.sirala) ?? 'yeni';
  const page = Math.max(1, Number(first(sp.sayfa)) || 1);

  const filters: (SQL | undefined)[] = [
    q ? or(ilike(leads.name, `%${q}%`), ilike(leads.phone, `%${q.replace(/\D/g, '') || q}%`), ilike(leads.ref, `%${q}%`), ilike(leads.email, `%${q}%`)) : undefined,
    LEAD_STATUSES.some((s) => s.value === status) ? eq(leads.status, status as LeadStatus) : undefined,
    service ? eq(leads.serviceType, service) : undefined,
    district ? eq(leads.district, district) : undefined,
  ];
  const where = and(...filters);
  const order = sort === 'eski' ? asc(leads.createdAt) : sort === 'ad' ? asc(leads.name) : sort === 'durum' ? asc(leads.status) : desc(leads.createdAt);

  const [rows, [total], districts] = await Promise.all([
    db.select().from(leads).where(where).orderBy(order).limit(PER_PAGE).offset((page - 1) * PER_PAGE),
    db.select({ n: count() }).from(leads).where(where),
    db.selectDistinct({ d: leads.district }).from(leads).where(isNotNull(leads.district)).orderBy(asc(leads.district)),
  ]);
  const pages = Math.max(1, Math.ceil((total?.n ?? 0) / PER_PAGE));
  const qs = (over: Record<string, string | number>) => {
    const p = new URLSearchParams({ ...(q && { q }), ...(status && { durum: status }), ...(service && { hizmet: service }), ...(district && { ilce: district }), ...(sort !== 'yeni' && { sirala: sort }) });
    for (const [k, v] of Object.entries(over)) p.set(k, String(v));
    return `?${p}`;
  };

  return (
    <>
      <PageHeader title="Talepler" description={`${total?.n ?? 0} kayıt`} />
      <Flash searchParams={searchParams} />

      <form className="mb-5 grid gap-3 rounded-(--radius-lg) border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]" role="search">
        <label className="sr-only" htmlFor="f-q">Ara</label>
        <input id="f-q" name="q" defaultValue={q} placeholder="Ad, telefon, e-posta, talep no" className="field min-h-10 py-2 text-sm" />
        <label className="sr-only" htmlFor="f-durum">Durum</label>
        <select id="f-durum" name="durum" defaultValue={status} className="field min-h-10 py-2 text-sm">
          <option value="">Tüm durumlar</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="f-hizmet">Hizmet</label>
        <select id="f-hizmet" name="hizmet" defaultValue={service} className="field min-h-10 py-2 text-sm">
          <option value="">Tüm hizmetler</option>
          {SERVICE_TYPES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
          <option value="iletisim">İletişim formu</option>
        </select>
        <label className="sr-only" htmlFor="f-ilce">İlçe</label>
        <select id="f-ilce" name="ilce" defaultValue={district} className="field min-h-10 py-2 text-sm">
          <option value="">Tüm ilçeler</option>
          {districts.map((d) => (
            <option key={d.d} value={d.d ?? ''}>{d.d}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="f-sirala">Sıralama</label>
        <select id="f-sirala" name="sirala" defaultValue={sort} className="field min-h-10 py-2 text-sm">
          <option value="yeni">Önce en yeni</option>
          <option value="eski">Önce en eski</option>
          <option value="ad">Ada göre</option>
          <option value="durum">Duruma göre</option>
        </select>
        <button type="submit" className={buttonClass('primary', 'sm')}>Filtrele</button>
      </form>

      <Table head={['Talep no', 'İsim', 'Telefon', 'Hizmet', 'Daire', 'İlçe', 'Tarih', 'Durum', '']} empty={rows.length === 0}>
        {rows.map((l) => (
          <tr key={l.id} data-testid="lead-row">
            <td className="whitespace-nowrap font-mono text-xs font-semibold text-navy-900">{l.ref}</td>
            <td className="font-semibold text-navy-900">{l.name}</td>
            <td className="whitespace-nowrap">{l.anonymizedAt ? '—' : <a href={`tel:${l.phone}`} className="underline-offset-4 hover:underline">{formatPhone(l.phone)}</a>}</td>
            <td>{l.serviceType === 'iletisim' ? 'İletişim formu' : labelOf(SERVICE_TYPES, l.serviceType)}</td>
            <td className="whitespace-nowrap">
              {l.roomType ?? '—'}
              {l.listedPrice ? <span className="block text-xs text-muted">{formatPrice(l.listedPrice)}</span> : null}
            </td>
            <td>{l.district ?? '—'}</td>
            <td className="whitespace-nowrap text-muted">{formatDateTime(l.createdAt)}</td>
            <td><StatusPill tone={LEAD_TONES[l.status] ?? 'gray'}>{labelOf(LEAD_STATUSES, l.status)}</StatusPill></td>
            <td><Link href={`/admin/talepler/${l.id}`} className="font-semibold text-ocean-700 underline-offset-4 hover:underline">Aç</Link></td>
          </tr>
        ))}
      </Table>

      {pages > 1 && (
        <nav aria-label="Sayfalama" className="mt-5 flex items-center justify-between text-sm">
          {page > 1 ? <Link href={qs({ sayfa: page - 1 })} className="font-semibold text-ocean-700">← Önceki</Link> : <span />}
          <span className="text-muted">Sayfa {page} / {pages}</span>
          {page < pages ? <Link href={qs({ sayfa: page + 1 })} className="font-semibold text-ocean-700">Sonraki →</Link> : <span />}
        </nav>
      )}
    </>
  );
}
