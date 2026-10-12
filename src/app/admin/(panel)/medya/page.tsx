import { desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import Image from 'next/image';
import { db } from '@/db';
import { mediaAssets } from '@/db/schema';
import { updateMediaAction, uploadMediaAction } from '@/features/admin/actions';
import { ConfirmButton, SubmitButton } from '@/features/admin/client';
import { Card, Flash, Input, PageHeader, Select, type SearchParams } from '@/features/admin/ui';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Medya' };

const CATEGORIES = ['genel', 'boya', 'tadilat', 'proje', 'blog', 'oncesi-sonrasi'].map((c) => ({ value: c, label: c }));

export default async function MediaPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser('media.manage');
  const rows = await db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)).limit(120);
  return (
    <>
      <PageHeader title="Medya Kütüphanesi" description="Yüklenen görseller WebP’ye dönüştürülür, en fazla 2400 px genişliğe indirilir ve konum (EXIF) verisi temizlenir. Yalnızca kullanım hakkına sahip olduğunuz görselleri yükleyin." />
      <Flash searchParams={searchParams} />
      <Card title="Görsel yükle" className="mb-6">
        <form action={uploadMediaAction} className="grid items-end gap-4 md:grid-cols-[1.5fr_1.5fr_1fr_auto]">
          <Input label="Dosyalar" name="files" type="file" multiple accept="image/jpeg,image/png,image/webp" required className="py-1.5" hint="JPEG, PNG veya WebP; her biri en çok 8 MB" />
          <Input label="Alternatif metin" name="alt" required hint="Görseli göremeyen biri için kısa açıklama" />
          <Select label="Kategori" name="category" options={CATEGORIES} />
          <SubmitButton>Yükle</SubmitButton>
        </form>
      </Card>
      {rows.length === 0 ? <p className="text-sm text-muted">Henüz görsel yüklenmedi.</p> : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((m) => (
            <li key={m.id} className="rounded-(--radius-lg) border border-line bg-white p-3">
              <Image src={m.url} alt={m.alt} width={320} height={240} className="aspect-[4/3] w-full rounded object-cover" />
              <p className="mt-2 text-xs text-muted">{m.width}×{m.height} · {Math.round(m.size / 1024)} KB · {m.category}</p>
              <input readOnly value={m.url} aria-label="Görsel adresi" className="field mt-2 min-h-8 py-1 font-mono text-xs" />
              <form action={updateMediaAction} className="mt-2 grid gap-2">
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="category" value={m.category} />
                <label className="sr-only" htmlFor={`alt-${m.id}`}>Alternatif metin</label>
                <input id={`alt-${m.id}`} name="alt" defaultValue={m.alt} className="field min-h-8 py-1 text-xs" />
                <div className="flex items-center justify-between">
                  <ConfirmButton title="Görsel silinsin mi?" text="Bu görseli kullanan sayfalarda görsel kırılır.">Sil</ConfirmButton>
                  <SubmitButton variant="outline">Kaydet</SubmitButton>
                </div>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
