import { asc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { projectImages, projects } from '@/db/schema';
import { deleteProjectImageAction, saveProjectAction } from '@/features/admin/actions';
import { ConfirmButton, SubmitButton } from '@/features/admin/client';
import { listToLines } from '@/features/admin/parse';
import { Card, Checkbox, Flash, Input, PageHeader, Select, Textarea, type SearchParams } from '@/features/admin/ui';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Proje' };

export default async function ProjectEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SearchParams }) {
  await requireUser('content.manage');
  const { id } = await params;
  const isNew = id === 'yeni';
  const p = isNew ? undefined : await db.query.projects.findFirst({ where: eq(projects.id, Number(id) || 0), with: { images: { orderBy: [asc(projectImages.sort)] } } });
  if (!isNew && !p) notFound();

  return (
    <>
      <PageHeader title={p?.title ?? 'Yeni proje'} description={p ? `/projeler/${p.slug}` : undefined} back={{ href: '/admin/projeler', label: 'Projeler' }} />
      <Flash searchParams={searchParams} />
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <form action={saveProjectAction} className="space-y-6">
          {p && <input type="hidden" name="id" value={p.id} />}
          <Card title="Proje bilgileri">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Başlık" name="title" defaultValue={p?.title} required wrapClass="sm:col-span-2" />
              <Select label="Portföy" name="kind" defaultValue={p?.kind ?? 'boya'} options={[{ value: 'boya', label: 'Boya / tadilat' }, { value: 'insaat', label: 'İnşaat' }]} hint="Boya projeleri ev boyama sayfasında otomatik görünür." />
              <Select label="Yayın durumu" name="publishStatus" defaultValue={p?.publishStatus ?? 'draft'} options={[{ value: 'published', label: 'Yayında' }, { value: 'draft', label: 'Taslak' }]} />
              <Input label="Kategori" name="category" defaultValue={p?.category} placeholder="Örn. Ev Boyama" />
              <Input label="Proje türü" name="projectType" defaultValue={p?.projectType} placeholder="Örn. 2+1 daire boyama" />
              <Input label="Bölge" name="region" defaultValue={p?.region} placeholder="Örn. Sancaktepe / İstanbul" />
              <Input label="Durum" name="status" defaultValue={p?.status} placeholder="Örn. Tamamlandı" />
              <Textarea label="Kısa özet" name="summary" rows={2} defaultValue={p?.summary} className="font-sans" wrapClass="sm:col-span-2" />
              <Textarea label="Proje hakkında" name="about" rows={7} defaultValue={p?.about} className="font-sans" wrapClass="sm:col-span-2" />
              <Textarea label="Ocean İnşaat’ın rolü" name="role" rows={2} defaultValue={p?.role} className="font-sans" wrapClass="sm:col-span-2" />
              <Textarea label="Rol etiketleri (satır satır)" name="roleTags" rows={3} defaultValue={listToLines(p?.roleTags ?? [])} className="font-sans" />
              <Textarea label="İlgili hizmet başlıkları" name="relatedServices" rows={3} defaultValue={listToLines(p?.relatedServices ?? [])} className="font-sans" />
              <Input label="Adres (slug)" name="slug" defaultValue={p?.slug} hint="Boşsa başlıktan üretilir." />
              <Input label="Sıra" name="sort" type="number" defaultValue={p?.sort ?? 50} />
              <Input label="Meta başlık" name="metaTitle" defaultValue={p?.metaTitle ?? ''} wrapClass="sm:col-span-2" />
              <Textarea label="Meta açıklama" name="metaDescription" rows={2} defaultValue={p?.metaDescription ?? ''} className="font-sans" wrapClass="sm:col-span-2" />
            </div>
            <div className="mt-4">
              <Checkbox label="Ana sayfada öne çıkar" name="featured" defaultChecked={p?.featured} />
            </div>
          </Card>
          <Card title="Görsel ekle" description="JPEG, PNG veya WebP; her biri en çok 8 MB. Görseller yeniden kodlanır ve konum bilgisi temizlenir.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Görseller" name="images" type="file" multiple accept="image/jpeg,image/png,image/webp" className="py-1.5" />
              <Input label="Alternatif metin" name="imagesAlt" placeholder="Görselleri tanımlayan kısa açıklama" />
            </div>
          </Card>
          <SubmitButton>Projeyi kaydet</SubmitButton>
        </form>

        <Card title={`Mevcut görseller (${p?.images.length ?? 0})`}>
          {!p?.images.length ? <p className="text-sm text-muted">Henüz görsel yok.</p> : (
            <ul className="grid grid-cols-2 gap-3">
              {p.images.map((img) => (
                <li key={img.id}>
                  <Image src={img.src} alt={img.alt} width={240} height={180} className="aspect-[4/3] w-full rounded object-cover" />
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{img.alt}</p>
                  <form action={deleteProjectImageAction}>
                    <input type="hidden" name="id" value={img.id} />
                    <ConfirmButton title="Görsel silinsin mi?" text="Bu işlem geri alınamaz.">Sil</ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
