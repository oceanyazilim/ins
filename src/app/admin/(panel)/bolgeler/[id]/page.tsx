import { asc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { neighborhoods, serviceAreas } from '@/db/schema';
import { saveAreaAction } from '@/features/admin/actions';
import { SubmitButton } from '@/features/admin/client';
import { areaPageIssues, faqsToText, sectionsToText } from '@/features/admin/parse';
import { Card, Checkbox, Flash, Input, PageHeader, Select, SerpPreview, Textarea, type SearchParams } from '@/features/admin/ui';
import { env } from '@/lib/env';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Bölge' };

export default async function AreaEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SearchParams }) {
  await requireUser('areas.manage');
  const id = Number((await params).id);
  const a = Number.isInteger(id) ? await db.query.serviceAreas.findFirst({ where: eq(serviceAreas.id, id), with: { neighborhoods: { orderBy: [asc(neighborhoods.sort)] } } }) : null;
  if (!a) notFound();
  const issues = areaPageIssues({ ...a, active: a.active });

  return (
    <>
      <PageHeader title={a.name} description={`/${a.slug}-ev-boyama`} back={{ href: '/admin/bolgeler', label: 'Hizmet Bölgeleri' }} />
      <Flash searchParams={searchParams} />
      <form action={saveAreaAction} className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <input type="hidden" name="id" value={a.id} />
        <div className="space-y-6">
          <Card title="Lokasyon sayfası içeriği" description="Sayfa yalnızca bu ilçeye özgü, gerçek ve faydalı içerik varsa yayınlanır. Başka bir ilçenin metnini ilçe adını değiştirerek kopyalamayın.">
            <div className="grid gap-4">
              <Input label="H1 başlığı" name="h1" defaultValue={a.h1} />
              <Textarea label="Giriş metni" name="lead" rows={3} defaultValue={a.lead} className="font-sans" />
              <Textarea label="Kart özeti" name="summary" rows={2} defaultValue={a.summary} className="font-sans" hint="Bölge listelerinde görünür." />
              <Textarea label="İçerik bölümleri (Markdown)" name="sections" rows={22} defaultValue={sectionsToText(a.sections)} hint="Her bölüm “## Başlık” satırıyla başlar." />
              <Textarea label="Sık sorulan sorular" name="faqs" rows={10} defaultValue={faqsToText(a.faqs)} hint="Bloklar boş satırla ayrılır; ilk satır soru, sonraki satırlar cevap." />
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Yayın">
            <div className="grid gap-4">
              <Checkbox label="Bölge aktif" name="active" defaultChecked={a.active} hint="Aktif değilse hiçbir yerde hizmet verildiği belirtilmez." />
              <Checkbox label="Lokasyon sayfası yayında" name="pagePublished" defaultChecked={a.pagePublished} hint="Kalite denetiminden geçerse yayınlanır ve site haritasına eklenir." />
              <Select label="Öncelik" name="tier" defaultValue={a.tier} options={[{ value: 'primary', label: 'Birincil' }, { value: 'secondary', label: 'İkincil' }]} />
              <Input label="Sıra" name="sort" type="number" defaultValue={a.sort} />
            </div>
            {issues.length > 0 && (
              <ul className="mt-4 list-disc space-y-1 rounded-(--radius-md) bg-amber-50 p-4 pl-8 text-xs text-warning">
                {issues.map((i) => <li key={i}>{i}</li>)}
              </ul>
            )}
          </Card>
          <Card title="Mahalleler" description="Her satıra bir mahalle veya semt. Yalnızca hizmet verdiğiniz yerleri yazın.">
            <Textarea label="Mahalle listesi" name="neighborhoods" rows={8} defaultValue={a.neighborhoods.map((n) => n.name).join('\n')} className="font-sans" />
          </Card>
          <Card title="SEO">
            <div className="grid gap-4">
              <Input label="Meta başlık" name="metaTitle" defaultValue={a.metaTitle ?? ''} />
              <Textarea label="Meta açıklama" name="metaDescription" rows={3} defaultValue={a.metaDescription ?? ''} className="font-sans" />
              <SerpPreview url={`${env.SITE_URL}/${a.slug}-ev-boyama`} title={a.metaTitle || `${a.name} Ev Boyama | Ocean İnşaat`} description={a.metaDescription || a.lead} />
            </div>
          </Card>
          <SubmitButton>Bölgeyi kaydet</SubmitButton>
        </div>
      </form>
    </>
  );
}
