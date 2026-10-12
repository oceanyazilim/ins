import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CtaSection, PageHero } from '@/components/sections/blocks';
import { BlogCard, type BlogCardData } from '@/components/sections/cards';
import { Container, EmptyState, Section, type Crumb } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { JsonLdScript, SITE_URL } from '@/seo';
import { breadcrumbSchema } from '@/seo/schema';
import { getBlogCategories } from '@/server/data';

export async function BlogIndex({
  crumbs,
  title,
  lead,
  posts,
  activeCategory,
  page = 1,
  pages = 1,
}: {
  crumbs: Crumb[];
  title: string;
  lead: string;
  posts: BlogCardData[];
  activeCategory?: string;
  page?: number;
  pages?: number;
}) {
  const categories = (await getBlogCategories()).filter((c) => c.posts > 0);
  const pageHref = (n: number) => (n === 1 ? '/blog' : `/blog/sayfa/${n}`);

  return (
    <>
      <PageHero crumbs={crumbs} eyebrow="Blog" title={title} lead={lead} />

      <nav aria-label="Blog kategorileri" className="border-b border-line bg-white">
        <Container>
          <ul className="flex gap-2 overflow-x-auto py-4 text-sm font-semibold">
            {[{ slug: '', name: 'Tümü' }, ...categories].map((c) => {
              const active = (c.slug || undefined) === activeCategory;
              return (
                <li key={c.slug || 'tum'} className="shrink-0">
                  <Link
                    href={c.slug ? `/blog/kategori/${c.slug}` : '/blog'}
                    aria-current={active ? 'page' : undefined}
                    className={cn('block rounded-full border px-4 py-2 transition-colors', active ? 'border-navy-900 bg-navy-900 text-white' : 'border-line text-navy-900 hover:border-navy-900')}
                  >
                    {c.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </nav>

      <Section>
        <Container>
          {posts.length === 0 ? (
            <EmptyState title="Bu kategoride henüz yazı yok" text="Yeni içerikler yayınlandığında burada görünecek." />
          ) : (
            <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <BlogCard key={p.slug} post={p} index={i % 3} />
              ))}
            </div>
          )}

          {/* Taranabilir bağlantılarla sayfalama (sonsuz kaydırma yok) */}
          {pages > 1 && (
            <nav aria-label="Sayfalama" className="mt-16 flex items-center justify-between border-t border-line pt-8">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} rel="prev" className="inline-flex items-center gap-2 font-semibold text-navy-900 underline-offset-4 hover:underline">
                  <ArrowLeft aria-hidden className="size-4" /> Önceki
                </Link>
              ) : (
                <span />
              )}
              <ol className="flex gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <li key={n}>
                    <Link
                      href={pageHref(n)}
                      aria-current={n === page ? 'page' : undefined}
                      aria-label={`Sayfa ${n}`}
                      className={cn('grid size-10 place-items-center rounded-full text-sm font-semibold', n === page ? 'bg-navy-900 text-white' : 'text-navy-900 hover:bg-soft')}
                    >
                      {n}
                    </Link>
                  </li>
                ))}
              </ol>
              {page < pages ? (
                <Link href={pageHref(page + 1)} rel="next" className="inline-flex items-center gap-2 font-semibold text-navy-900 underline-offset-4 hover:underline">
                  Sonraki <ArrowRight aria-hidden className="size-4" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </Container>
      </Section>

      <CtaSection title="Okuduklarınızı evinize uygulayalım." text="Daire tipinizi ve konumunuzu paylaşın, size özel teklifinizi hazırlayalım." />
      <JsonLdScript data={breadcrumbSchema(SITE_URL, crumbs)} />
    </>
  );
}
