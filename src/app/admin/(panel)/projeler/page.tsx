import { asc, desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { buttonClass } from '@/components/ui/button';
import { db } from '@/db';
import { comparisons, projects } from '@/db/schema';
import { saveComparisonAction, toggleComparisonAction } from '@/features/admin/actions';
import { ConfirmButton, SubmitButton } from '@/features/admin/client';
import { Card, Flash, Input, PageHeader, Select, StatusPill, Table, type SearchParams } from '@/features/admin/ui';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Projeler' };

export default async function ProjectsAdminPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser('content.manage');
  const [rows, cmps] = await Promise.all([
    db.query.projects.findMany({ orderBy: [asc(projects.sort), desc(projects.createdAt)], with: { images: true } }),
    db.select().from(comparisons).orderBy(asc(comparisons.sort), desc(comparisons.createdAt)),
  ]);
  return (
    <>
      <PageHeader title="Projeler" description="İnşaat portföyü ve boya / tadilat işleri. Yalnızca gerçek ve kullanım izni olan işleri ekleyin." actions={<Link href="/admin/projeler/yeni" className={buttonClass('primary', 'sm')}>Yeni proje</Link>} />
      <Flash searchParams={searchParams} />
      <Table head={['Proje', 'Tür', 'Bölge', 'Görsel', 'Durum', '']} empty={rows.length === 0}>
        {rows.map((p) => (
          <tr key={p.id}>
            <td>
              <span className="font-semibold text-navy-900">{p.title}</span>
              <span className="block font-mono text-xs text-muted">/projeler/{p.slug}</span>
            </td>
            <td>{p.kind === 'boya' ? 'Boya / tadilat' : 'İnşaat'}</td>
            <td>{p.region}</td>
            <td>{p.images.length}</td>
            <td><StatusPill tone={p.publishStatus === 'published' ? 'green' : 'gray'}>{p.publishStatus === 'published' ? 'Yayında' : 'Taslak'}</StatusPill></td>
            <td><Link href={`/admin/projeler/${p.id}`} className="font-semibold text-ocean-700 underline-offset-4 hover:underline">Düzenle</Link></td>
          </tr>
        ))}
      </Table>

      <h2 className="mb-4 mt-12 font-display text-xl font-extrabold text-navy-900">Öncesi / Sonrası karşılaştırmaları</h2>
      <p className="mb-5 max-w-3xl text-sm text-muted">
        Karşılaştırmalar taslak olarak eklenir. İki görselin aynı işin gerçek öncesi ve sonrası olduğunu doğruladıktan sonra yayınlayın; yayındaki boya karşılaştırmaları ana
        sayfada ve ev boyama sayfasında otomatik olarak görünür.
      </p>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <ul className="space-y-4">
          {cmps.length === 0 && <li className="text-sm text-muted">Henüz karşılaştırma yok.</li>}
          {cmps.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-4 rounded-(--radius-lg) border border-line bg-white p-4">
              <div className="flex gap-2">
                <Image src={c.beforeSrc} alt="Öncesi" width={120} height={90} className="h-[4.5rem] w-24 rounded object-cover" />
                <Image src={c.afterSrc} alt="Sonrası" width={120} height={90} className="h-[4.5rem] w-24 rounded object-cover" />
              </div>
              <div className="min-w-40 flex-1">
                <p className="font-semibold text-navy-900">{c.title}</p>
                <p className="text-xs text-muted">{c.caption}</p>
                <div className="mt-1 flex gap-2">
                  <StatusPill tone={c.published ? 'green' : 'gray'}>{c.published ? 'Yayında' : 'Taslak'}</StatusPill>
                  <StatusPill tone="blue">{c.kind === 'boya' ? 'Boya' : 'İnşaat'}</StatusPill>
                </div>
              </div>
              <form action={toggleComparisonAction} className="flex items-center gap-4">
                <input type="hidden" name="id" value={c.id} />
                <SubmitButton variant="outline" name="intent" value="toggle">{c.published ? 'Yayından kaldır' : 'Yayınla'}</SubmitButton>
                <ConfirmButton title="Karşılaştırma silinsin mi?" text="Görseller de silinir.">Sil</ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
        <Card title="Yeni karşılaştırma">
          <form action={saveComparisonAction} className="grid gap-4">
            <Input label="Başlık" name="title" required placeholder="Örn. Sancaktepe 2+1 daire — salon" />
            <Input label="Açıklama" name="caption" />
            <Select label="Tür" name="kind" options={[{ value: 'boya', label: 'Boya / tadilat' }, { value: 'insaat', label: 'İnşaat' }]} />
            <Input label="Öncesi görseli" name="before" type="file" accept="image/jpeg,image/png,image/webp" required className="py-1.5" />
            <Input label="Sonrası görseli" name="after" type="file" accept="image/jpeg,image/png,image/webp" required className="py-1.5" />
            <SubmitButton>Taslak olarak ekle</SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
