import { asc, desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/db';
import { serviceAreas } from '@/db/schema';
import { createAreaAction } from '@/features/admin/actions';
import { SubmitButton } from '@/features/admin/client';
import { Card, Flash, Input, PageHeader, StatusPill, Table, type SearchParams } from '@/features/admin/ui';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Hizmet Bölgeleri' };

export default async function AreasPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser('areas.manage');
  const rows = await db.query.serviceAreas.findMany({ orderBy: [desc(serviceAreas.active), asc(serviceAreas.sort)], with: { neighborhoods: true } });
  return (
    <>
      <PageHeader title="Hizmet Bölgeleri" description="Yalnızca aktif bölgeler sitede, teklif formunda, menüde ve yapılandırılmış veride görünür. Lokasyon sayfası ayrıca yayınlanır." />
      <Flash searchParams={searchParams} />
      <Table head={['İlçe', 'Öncelik', 'Durum', 'Lokasyon sayfası', 'Mahalle', '']}>
        {rows.map((a) => (
          <tr key={a.id}>
            <td className="font-semibold text-navy-900">{a.name}{a.isHub && <span className="ml-2 text-xs font-normal text-muted">(merkez)</span>}</td>
            <td>{a.tier === 'primary' ? 'Birincil' : 'İkincil'}</td>
            <td><StatusPill tone={a.active ? 'green' : 'gray'}>{a.active ? 'Aktif' : 'Pasif'}</StatusPill></td>
            <td>{a.pagePublished ? <Link href={`/${a.slug}-ev-boyama`} target="_blank" className="text-ocean-700 underline underline-offset-4">Yayında ↗</Link> : <span className="text-muted">Kapalı</span>}</td>
            <td>{a.neighborhoods.length}</td>
            <td><Link href={`/admin/bolgeler/${a.id}`} className="font-semibold text-ocean-700 underline-offset-4 hover:underline">Düzenle</Link></td>
          </tr>
        ))}
      </Table>
      <Card title="Yeni ilçe ekle" description="İlçe pasif olarak eklenir. Hizmet kapsamı dışında tanımlı bölgeler eklenemez." className="mt-6 max-w-xl">
        <form action={createAreaAction} className="flex items-end gap-3">
          <Input label="İlçe adı" name="name" required wrapClass="flex-1" />
          <SubmitButton>Ekle</SubmitButton>
        </form>
      </Card>
    </>
  );
}
