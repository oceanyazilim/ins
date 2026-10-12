import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { BlogIndex } from '@/components/sections/blog-index';
import { pageMetadata } from '@/seo';
import { getPosts } from '@/server/data';

type Props = { params: Promise<{ page: string }> };

const parse = (v: string) => (/^\d+$/.test(v) ? Number(v) : NaN);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = parse((await params).page);
  if (!Number.isFinite(n) || n < 2) return {};
  return pageMetadata({ path: `/blog/sayfa/${n}`, title: `Blog — Sayfa ${n}`, description: `Ocean İnşaat blog yazıları, sayfa ${n}.` });
}

export default async function BlogPagedPage({ params }: Props) {
  const n = parse((await params).page);
  if (!Number.isFinite(n) || n < 1) notFound();
  if (n === 1) permanentRedirect('/blog');
  const { items, pages } = await getPosts({ page: n });
  if (n > pages) notFound();
  return (
    <BlogIndex
      crumbs={[
        { name: 'Ana Sayfa', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: `Sayfa ${n}`, path: `/blog/sayfa/${n}` },
      ]}
      title={`Rehber ve yazılar — Sayfa ${n}`}
      lead="Ev boyama, renk seçimi, tadilat planlama ve yapı konularında işinize yarayacak rehberler."
      posts={items}
      page={n}
      pages={pages}
    />
  );
}
