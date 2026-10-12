import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ReadingProgress } from '@/components/interactive/gallery';
import { CtaSection } from '@/components/sections/blocks';
import { renderContent } from '@/server/content';
import { BlogCard } from '@/components/sections/cards';
import { ButtonLink } from '@/components/ui/button';
import { Breadcrumbs, Container, Section, SectionHeader } from '@/components/ui/primitives';
import { formatDate } from '@/lib/format';
import { JsonLdScript, pageMetadata, SITE_URL } from '@/seo';
import { articleSchema, breadcrumbSchema } from '@/seo/schema';
import { getPost, getPosts, getRelatedPosts, getSettings } from '@/server/data';
import { redirectOrNotFound } from '@/server/redirects';

type Props = { params: Promise<{ slug: string }> };

/** Yazı sonunda gösterilen ticari sayfa bağlantılarının görünen adları. */
const COMMERCIAL_LABELS: Record<string, string> = {
  '/ev-boyama': 'Ev Boyama Hizmeti',
  '/boya-fiyatlari': 'Boya Fiyatları',
  '/teklif-al': 'Teklif Al',
  '/ev-boyama/1-1-daire-boyama': '1+1 Daire Boyama',
  '/ev-boyama/2-1-daire-boyama': '2+1 Daire Boyama',
  '/ev-boyama/3-1-daire-boyama': '3+1 Daire Boyama',
  '/sancaktepe-ev-boyama': 'Sancaktepe Ev Boyama',
  '/hizmet-bolgeleri': 'Hizmet Bölgeleri',
  '/hizmetler/ic-cephe-boyama': 'İç Cephe Boyama',
  '/hizmetler/boya-badana': 'Boya Badana',
  '/hizmetler/dekoratif-boya': 'Dekoratif Boya',
  '/hizmetler/duvar-onarimi': 'Duvar Onarımı',
  '/hizmetler/alci-siva': 'Alçı ve Sıva',
  '/hizmetler/ev-tadilati': 'Komple Ev Tadilatı',
  '/hizmetler/mutfak-tadilati': 'Mutfak Tadilatı',
  '/hizmetler/banyo-tadilati': 'Banyo Tadilatı',
  '/hizmetler/alcipan-asma-tavan': 'Alçıpan ve Asma Tavan',
  '/hizmetler/ev-dekorasyonu': 'Ev Dekorasyonu',
  '/hizmetler/elektrik-tesisati': 'Elektrik Tesisatı',
  '/hizmetler/sihhi-tesisat': 'Sıhhi Tesisat',
  '/hizmetler/seramik-fayans': 'Seramik ve Fayans',
  '/hizmetler/parke-zemin': 'Parke ve Zemin',
};

export async function generateStaticParams() {
  return (await getPosts({ limit: 200 })).items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const row = await getPost(slug);
  if (!row) return {};
  const { post } = row;
  return pageMetadata({
    path: `/blog/${post.slug}`,
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    image: post.cover,
    type: 'article',
    publishedTime: post.publishedAt?.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const row = await getPost(slug);
  if (!row) return redirectOrNotFound(`/blog/${slug}`);
  const { post, category, author } = row;
  const [related, settings] = await Promise.all([getRelatedPosts(post.id, post.categoryId), getSettings()]);
  const { html, toc } = await renderContent(post.body);
  const path = `/blog/${post.slug}`;
  const crumbs = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: category.name, path: `/blog/kategori/${category.slug}` },
    { name: post.title, path },
  ];
  const published = post.publishedAt ?? post.createdAt;
  // Yayın tarihinden belirgin biçimde sonra güncellendiyse güncelleme tarihi gösterilir.
  const showUpdated = post.updatedAt.getTime() - published.getTime() > 2 * 86_400_000;
  const commercial = (post.related.length ? post.related : ['/ev-boyama', '/boya-fiyatlari']).filter((p) => COMMERCIAL_LABELS[p]);
  const h2s = toc.filter((t) => t.level === 2);

  return (
    <>
      <ReadingProgress targetId="yazi" />
      <div className="bg-soft">
        <Container className="py-10 md:py-14">
          <Breadcrumbs items={crumbs.slice(0, 3)} />
          <p className="mt-8 text-sm text-muted">
            <Link href={`/blog/kategori/${category.slug}`} className="font-semibold text-ocean-700 underline-offset-4 hover:underline">
              {category.name}
            </Link>{' '}
            · <time dateTime={published.toISOString()}>{formatDate(published)}</time>
            {showUpdated && (
              <>
                {' '}
                · Güncelleme: <time dateTime={post.updatedAt.toISOString()}>{formatDate(post.updatedAt)}</time>
              </>
            )}{' '}
            · {post.readMinutes} dk okuma
          </p>
          <h1 className="mt-4 max-w-4xl text-h1 font-extrabold">{post.title}</h1>
          {post.excerpt && <p className="mt-5 max-w-3xl text-lead text-muted">{post.excerpt}</p>}
          <p className="mt-6 text-sm text-muted">
            Yazar: <span className="font-semibold text-navy-900">{author.name}</span>
          </p>
        </Container>
      </div>

      <Container className="grid gap-12 py-12 lg:grid-cols-[1fr_17rem] lg:gap-16 lg:py-16">
        <article id="yazi" className="min-w-0 max-w-(--container-prose)">
          {post.cover && (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-(--radius-xl) bg-soft">
              <Image src={post.cover} alt={post.coverAlt ?? ''} fill priority sizes="(min-width: 1024px) 704px, 100vw" className="object-cover" />
            </div>
          )}
          <div className="prose-ocean" dangerouslySetInnerHTML={{ __html: html }} />

          {commercial.length > 0 && (
            <aside aria-label="İlgili hizmetler" className="mt-14 rounded-(--radius-xl) border border-line p-7">
              <h2 className="font-display text-lg font-bold text-navy-900">İlgili hizmetler</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {commercial.map((p) => (
                  <li key={p}>
                    <Link href={p} className="link-arrow inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:border-navy-900">
                      {COMMERCIAL_LABELS[p]} <ArrowRight aria-hidden className="size-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </article>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          {h2s.length > 1 && (
            <nav aria-label="İçindekiler" className="hidden lg:block">
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-muted">İçindekiler</h2>
              <ol className="mt-4 space-y-2.5 border-l border-line text-[0.9375rem]">
                {h2s.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="-ml-px block border-l border-transparent pl-4 text-muted transition-colors hover:border-navy-900 hover:text-navy-900">
                      {t.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="rounded-(--radius-xl) bg-navy-900 p-7 text-white lg:mt-10">
            <p className="font-display text-xl font-bold">Daireniz için teklif alın</p>
            <p className="mt-2 text-sm text-white/75">Daire tipinizi ve konumunuzu paylaşın, size özel teklifinizi hazırlayalım.</p>
            <ButtonLink href="/teklif-al" variant="light" className="mt-5 w-full">
              Teklif Al
            </ButtonLink>
          </div>
        </aside>
      </Container>

      {related.length > 0 && (
        <Section tone="soft" labelledBy="ilgili-yazilar">
          <Container>
            <SectionHeader id="ilgili-yazilar" eyebrow="Okumaya devam edin" title="İlgili yazılar" />
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <BlogCard key={p.slug} post={p} index={i} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CtaSection />
      <JsonLdScript
        data={[
          articleSchema(
            SITE_URL,
            { path, title: post.title, description: post.metaDescription || post.excerpt, publishedAt: published, updatedAt: post.updatedAt, authorName: author.name, image: post.cover },
            settings,
          ),
          breadcrumbSchema(SITE_URL, crumbs),
        ]}
      />
    </>
  );
}
