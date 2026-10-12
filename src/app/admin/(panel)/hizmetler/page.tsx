import { asc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonClass } from '@/components/ui/button';
import { db } from '@/db';
import { serviceCategories, services } from '@/db/schema';
import { Flash, PageHeader, StatusPill, Table, type SearchParams } from '@/features/admin/ui';
import { formatDateTime } from '@/lib/format';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Hizmetler' };

export default async function ServicesAdminPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser('content.manage');
  const rows = await db
    .select({ id: services.id, slug: services.slug, title: services.title, status: services.status, updatedAt: services.updatedAt, category: serviceCategories.name })
    .from(services)
    .innerJoin(serviceCategories, eq(serviceCategories.id, services.categoryId))
    .orderBy(asc(serviceCategories.sort), asc(services.sort), asc(services.title));
  return (
    <>
      <PageHeader title="Hizmetler" description={`${rows.length} hizmet sayfası`} actions={<Link href="/admin/hizmetler/yeni" className={buttonClass('primary', 'sm')}>Yeni hizmet</Link>} />
      <Flash searchParams={searchParams} />
      <Table head={['Hizmet', 'Kategori', 'Adres', 'Durum', 'Güncelleme', '']}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="font-semibold text-navy-900">{r.title}</td>
            <td>{r.category}</td>
            <td className="font-mono text-xs text-muted">/hizmetler/{r.slug}</td>
            <td><StatusPill tone={r.status === 'published' ? 'green' : 'gray'}>{r.status === 'published' ? 'Yayında' : 'Taslak'}</StatusPill></td>
            <td className="whitespace-nowrap text-muted">{formatDateTime(r.updatedAt)}</td>
            <td><Link href={`/admin/hizmetler/${r.id}`} className="font-semibold text-ocean-700 underline-offset-4 hover:underline">Düzenle</Link></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
