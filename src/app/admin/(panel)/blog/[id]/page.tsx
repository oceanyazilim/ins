import { asc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { blogCategories, blogPosts } from '@/db/schema';
import { savePostAction } from '@/features/admin/actions';
import { SubmitButton } from '@/features/admin/client';
import { listToLines } from '@/features/admin/parse';
import { Card, Flash, Input, PageHeader, Select, SerpPreview, Textarea, type SearchParams } from '@/features/admin/ui';
import { env } from '@/lib/env';
import { renderMarkdown } from '@/lib/markdown';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Yazı' };

export default async function PostEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SearchParams }) {
  await requireUser('content.manage');
  const { id } = await params;
  const isNew = id === 'yeni';
  const [p] = isNew ? [] : await db.select().from(blogPosts).where(eq(blogPosts.id, Number(id) || 0)).limit(1);
  if (!isNew && !p) notFound();
  const cats = await db.select().from(blogCategories).orderBy(asc(blogCategories.sort));

  return (
    <>
      <PageHeader title={p?.title ?? 'Yeni yazı'} description={p ? `/blog/${p.slug}` : undefined} back={{ href: '/admin/blog', label: 'Blog' }} />
      <Flash searchParams={searchParams} />
      <form action={savePostAction} className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        {p && <input type="hidden" name="id" value={p.id} />}
        <div className="space-y-6">
          <Card title="İçerik">
            <div className="grid gap-4">
              <Input label="Başlık" name="title" defaultValue={p?.title} required />
              <Textarea label="Özet" name="excerpt" rows={2} defaultValue={p?.excerpt} className="font-sans" />
              <Textarea
                label="Gövde (Markdown)"
                name="body"
                rows={28}
                defaultValue={p?.body}
                hint="Başlıklar için ##, alt başlıklar için ### kullanın. Paket fiyatını elle yazmayın: {{fiyat:1+1}}, {{fiyat:2+1}}, {{fiyat:3+1}}. Hizmet bölgeleri için {{bolgeler}}."
              />
            </div>
          </Card>
          {p && (
            <Card title="Önizleme">
              <div className="prose-ocean max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.body).html }} />
            </Card>
          )}
        </div>
        <div className="space-y-6">
          <Card title="Yayın" description="Yayınlamadan önce içeriğin doğruluğunu ve fiyat/hizmet bölgesi ifadelerini kontrol edin.">
            <div className="grid gap-4">
              <Select
                label="Durum"
                name="status"
                defaultValue={p?.status ?? 'draft'}
                options={[{ value: 'draft', label: 'Taslak' }, { value: 'review', label: 'İncelemede' }, { value: 'published', label: 'Yayında' }, { value: 'archived', label: 'Arşiv' }]}
              />
              <Select label="Kategori" name="categoryId" defaultValue={p?.categoryId ?? cats[0]?.id} options={cats.map((c) => ({ value: c.id, label: c.name }))} />
              <Input label="Adres (slug)" name="slug" defaultValue={p?.slug} hint={p ? 'Yayındaki bir adresi değiştirirseniz yönlendirme ekleyin.' : 'Boş bırakılırsa başlıktan üretilir.'} />
            </div>
          </Card>
          <Card title="Kapak görseli">
            <div className="grid gap-4">
              <Input label="Görsel adresi" name="cover" defaultValue={p?.cover ?? ''} placeholder="/media/… veya /images/…" />
              <Input label="Alternatif metin" name="coverAlt" defaultValue={p?.coverAlt ?? ''} />
            </div>
          </Card>
          <Card title="İlgili ticari sayfalar" description="Yazının sonunda gösterilir. Her satıra bir yol.">
            <Textarea label="Yollar" name="related" rows={4} defaultValue={listToLines(p?.related ?? [])} />
          </Card>
          <Card title="SEO">
            <div className="grid gap-4">
              <Input label="Meta başlık" name="metaTitle" defaultValue={p?.metaTitle ?? ''} />
              <Textarea label="Meta açıklama" name="metaDescription" rows={3} defaultValue={p?.metaDescription ?? ''} className="font-sans" />
              {p && <SerpPreview url={`${env.SITE_URL}/blog/${p.slug}`} title={`${p.metaTitle || p.title} | Ocean İnşaat`} description={p.metaDescription || p.excerpt} />}
            </div>
          </Card>
          <SubmitButton>Yazıyı kaydet</SubmitButton>
        </div>
      </form>
    </>
  );
}
