import { asc } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/db';
import { paintingPackages } from '@/db/schema';
import { Flash, PageHeader, StatusPill, Table, type SearchParams } from '@/features/admin/ui';
import { formatDate, formatDateTime, formatPrice } from '@/lib/format';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Boya Fiyatları' };

export default async function PricesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser('pricing.manage');
  const rows = await db.select().from(paintingPackages).orderBy(asc(paintingPackages.sort));
  return (
    <>
      <PageHeader title="Boya Fiyatları" description="Sitedeki bütün fiyatlar (ana sayfa, fiyat sayfası, paket sayfaları, teklif formu, SSS ve yapılandırılmış veri) bu tablodan beslenir." />
      <Flash searchParams={searchParams} />
      <Table head={['Paket', 'Daire tipi', 'Fiyat', 'Geçerlilik', 'Durum', 'Güncelleme', '']}>
        {rows.map((p) => (
          <tr key={p.id}>
            <td className="font-semibold text-navy-900">{p.name}</td>
            <td>{p.roomType}</td>
            <td className="font-display font-bold text-navy-900">{formatPrice(p.price, p.currency)}</td>
            <td>{p.validUntil ? formatDate(p.validUntil) : '—'}</td>
            <td><StatusPill tone={p.active ? 'green' : 'gray'}>{p.active ? 'Aktif' : 'Pasif'}</StatusPill></td>
            <td className="text-muted">{formatDateTime(p.updatedAt)}</td>
            <td><Link href={`/admin/fiyatlar/${p.id}`} className="font-semibold text-ocean-700 underline-offset-4 hover:underline">Düzenle</Link></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
