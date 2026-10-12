import type { Metadata } from 'next';
import { BlogIndex } from '@/components/sections/blog-index';
import { pageMetadata } from '@/seo';
import { getPosts } from '@/server/data';

const BLOG_LEAD = 'Ev boyama, renk seçimi, tadilat planlama ve yapı konularında işinize yarayacak rehberler.';

export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata({ path: '/blog', title: 'Blog: Ev Boyama ve Tadilat Rehberleri', description: 'Ev boyama fiyatları, hazırlık, renk seçimi ve tadilat planlama hakkında Ocean İnşaat rehber yazıları.' });

export default async function BlogPage() {
  const { items, pages } = await getPosts({ page: 1 });
  return (
    <BlogIndex
      crumbs={[
        { name: 'Ana Sayfa', path: '/' },
        { name: 'Blog', path: '/blog' },
      ]}
      title="Rehber ve yazılar"
      lead={BLOG_LEAD}
      posts={items}
      page={1}
      pages={pages}
    />
  );
}
