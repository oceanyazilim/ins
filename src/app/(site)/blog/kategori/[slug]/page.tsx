import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogIndex } from '@/components/sections/blog-index';
import { pageMetadata } from '@/seo';
import { getBlogCategories, getPosts } from '@/server/data';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getBlogCategories()).filter((c) => c.posts > 0).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = (await getBlogCategories()).find((x) => x.slug === slug);
  if (!c) return {};
  // Yazısı olmayan kategori arşivi dizine eklenmez.
  return pageMetadata({ path: `/blog/kategori/${c.slug}`, title: `${c.name} Yazıları`, description: c.description, noindex: c.posts === 0 });
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params;
  const c = (await getBlogCategories()).find((x) => x.slug === slug);
  if (!c) notFound();
  const { items } = await getPosts({ categorySlug: slug, limit: 60 });
  return (
    <BlogIndex
      crumbs={[
        { name: 'Ana Sayfa', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: c.name, path: `/blog/kategori/${c.slug}` },
      ]}
      title={c.name}
      lead={c.description}
      posts={items}
      activeCategory={c.slug}
    />
  );
}
