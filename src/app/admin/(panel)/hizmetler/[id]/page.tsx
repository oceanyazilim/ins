import { asc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { serviceCategories, services } from '@/db/schema';
import { saveServiceAction } from '@/features/admin/actions';
import { SubmitButton } from '@/features/admin/client';
import { faqsToText, listToLines, stepsToText } from '@/features/admin/parse';
import { Card, Flash, Input, PageHeader, Select, SerpPreview, Textarea, type SearchParams } from '@/features/admin/ui';
import { env } from '@/lib/env';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Hizmet' };

export default async function ServiceEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SearchParams }) {
  await requireUser('content.manage');
  const { id } = await params;
  const isNew = id === 'yeni';
  const [s] = isNew ? [] : await db.select().from(services).where(eq(services.id, Number(id) || 0)).limit(1);
  if (!isNew && !s) notFound();
  const cats = await db.select().from(serviceCategories).orderBy(asc(serviceCategories.sort));

  return (
    <>
      <PageHeader title={s?.title ?? 'Yeni hizmet'} description={s ? `/hizmetler/${s.slug}` : undefined} back={{ href: '/admin/hizmetler', label: 'Hizmetler' }} />
      <Flash searchParams={searchParams} />
      <form action={saveServiceAction} className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        {s && <input type="hidden" name="id" value={s.id} />}
        <div className="space-y-6">
          <Card title="Temel bilgiler">
            <div className="grid gap-4">
              <Input label="Başlık" name="title" defaultValue={s?.title} required />
              <Input label="Alt başlık" name="tagline" defaultValue={s?.tagline} />
              <Textarea label="Genel bakış" name="overview" rows={2} defaultValue={s?.overview} className="font-sans" />
              <Textarea label="Giriş (paragraflar boş satırla ayrılır)" name="intro" rows={5} defaultValue={s?.intro} className="font-sans" />
              <Textarea label="Gövde (Markdown)" name="body" rows={14} defaultValue={s?.body} hint="Fiyat yazmayın; gerekiyorsa {{fiyat:2+1}} yer tutucusunu kullanın." />
            </div>
          </Card>
          <Card title="Listeler" description="Her satıra bir madde.">
            <div className="grid gap-4 md:grid-cols-2">
              <Textarea label="Hizmet kapsamı" name="scope" rows={7} defaultValue={listToLines(s?.scope ?? [])} className="font-sans" />
              <Textarea label="Aşamalar (Başlık | Açıklama)" name="steps" rows={7} defaultValue={stepsToText(s?.steps ?? [])} className="font-sans" />
              <Textarea label="Malzeme ve yöntemler" name="materials" rows={5} defaultValue={listToLines(s?.materials ?? [])} className="font-sans" />
              <Textarea label="Faydalar" name="benefits" rows={5} defaultValue={listToLines(s?.benefits ?? [])} className="font-sans" />
              <Textarea label="Uygun olduğu yerler" name="projectTypes" rows={4} defaultValue={listToLines(s?.projectTypes ?? [])} className="font-sans" />
              <Textarea label="İlgili sayfalar (yollar)" name="related" rows={4} defaultValue={listToLines(s?.related ?? [])} hint="Örn. /hizmetler/boya-badana" />
            </div>
            <div className="mt-4">
              <Textarea label="Sık sorulan sorular" name="faqs" rows={10} defaultValue={faqsToText(s?.faqs ?? [])} hint="Bloklar boş satırla ayrılır; ilk satır soru." className="font-sans" />
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Yayın">
            <div className="grid gap-4">
              <Select label="Durum" name="status" defaultValue={s?.status ?? 'draft'} options={[{ value: 'published', label: 'Yayında' }, { value: 'draft', label: 'Taslak' }]} />
              <Select label="Kategori" name="categoryId" defaultValue={s?.categoryId ?? cats[0]?.id} options={cats.map((c) => ({ value: c.id, label: c.name }))} />
              <Input label="Adres (slug)" name="slug" defaultValue={s?.slug} hint={s ? 'Yayındaki bir adresi değiştirirseniz eski adres için yönlendirme ekleyin.' : 'Boş bırakılırsa başlıktan üretilir.'} />
              <Input label="Sıra" name="sort" type="number" defaultValue={s?.sort ?? 100} />
            </div>
          </Card>
          <Card title="Görsel" description="Medya kütüphanesinden kopyaladığınız adresi yapıştırın.">
            <div className="grid gap-4">
              <Input label="Görsel adresi" name="image" defaultValue={s?.image ?? ''} placeholder="/media/… veya /images/…" />
              <Input label="Alternatif metin" name="imageAlt" defaultValue={s?.imageAlt ?? ''} />
            </div>
          </Card>
          <Card title="SEO">
            <div className="grid gap-4">
              <Input label="Meta başlık" name="metaTitle" defaultValue={s?.metaTitle ?? ''} />
              <Textarea label="Meta açıklama" name="metaDescription" rows={3} defaultValue={s?.metaDescription ?? ''} className="font-sans" />
              {s && <SerpPreview url={`${env.SITE_URL}/hizmetler/${s.slug}`} title={`${s.metaTitle || s.title} | Ocean İnşaat`} description={s.metaDescription || s.overview} />}
            </div>
          </Card>
          <SubmitButton>Hizmeti kaydet</SubmitButton>
        </div>
      </form>
    </>
  );
}
