import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonClass } from '@/components/ui/button';
import { db } from '@/db';
import { blogCategories, blogPosts, type PostStatus } from '@/db/schema';
import { first, Flash, PageHeader, StatusPill, Table, type SearchParams } from '@/features/admin/ui';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Blog' };

const POST_STATUS: Record<PostStatus, { label: string; tone: 'green' | 'amber' | 'gray' | 'red' }> = {
  draft: { label: 'Taslak', tone: 'gray' },
  review: { label: 'İncelemede', tone: 'amber' },
  published: { label: 'Yayında', tone: 'green' },
  archived: { label: 'Arşiv', tone: 'red' },
};

export default async function BlogAdminPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser('content.manage');
  const status = first((await searchParams).durum) as PostStatus | undefined;
  const rows = await db
    .select({ id: blogPosts.id, slug: blogPosts.slug, title: blogPosts.title, status: blogPosts.status, updatedAt: blogPosts.updatedAt, category: blogCategories.name })
    .from(blogPosts)
    .innerJoin(blogCategories, eq(blogCategories.id, blogPosts.categoryId))
    .where(status && status in POST_STATUS ? eq(blogPosts.status, status) : undefined)
    .orderBy(desc(blogPosts.updatedAt));
  return (
    <>
      <PageHeader
        title="Blog"
        description="Yazılar Taslak → İncelemede → Yayında akışıyla ilerler. İncelemedeki yazıları okuyup doğruladıktan sonra yayınlayın."
        actions={<Link href="/admin/blog/yeni" className={buttonClass('primary', 'sm')}>Yeni yazı</Link>}
      />
      <Flash searchParams={searchParams} />
      <ul className="mb-5 flex flex-wrap gap-2 text-sm font-semibold">
        {[['', 'Tümü'], ...Object.entries(POST_STATUS).map(([k, v]) => [k, v.label])].map(([k, label]) => (
          <li key={k}>
            <Link href={k ? `/admin/blog?durum=${k}` : '/admin/blog'} className={cn('block rounded-full border px-3.5 py-1.5', (status ?? '') === k ? 'border-navy-900 bg-navy-900 text-white' : 'border-line bg-white text-navy-900')}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <Table head={['Başlık', 'Kategori', 'Durum', 'Güncelleme', '']} empty={rows.length === 0}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>
              <span className="font-semibold text-navy-900">{r.title}</span>
              <span className="block font-mono text-xs text-muted">/blog/{r.slug}</span>
            </td>
            <td>{r.category}</td>
            <td><StatusPill tone={POST_STATUS[r.status].tone}>{POST_STATUS[r.status].label}</StatusPill></td>
            <td className="whitespace-nowrap text-muted">{formatDateTime(r.updatedAt)}</td>
            <td><Link href={`/admin/blog/${r.id}`} className="font-semibold text-ocean-700 underline-offset-4 hover:underline">Düzenle</Link></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
