import 'server-only';
import legacy from '@content/legacy/legacy.json';
import { legalPages } from '@content/legal';
import { areaPath, getAllSeoEntries, getAreaPages, getBlogCategories, getPackages, getPosts, getProjects, getServiceCategories, POSTS_PER_PAGE } from '@/server/data';

export type IndexableRoute = { path: string; lastModified?: Date; group: 'sayfa' | 'hizmet' | 'paket' | 'lokasyon' | 'proje' | 'blog' | 'kurumsal' | 'hukuki' };

/**
 * Yayında olan, dizine eklenebilir bütün canonical yolların tek kaynağı.
 * sitemap.xml ve SEO denetimi (scripts/seo-audit.ts) bu listeyi kullanır; yönetim paneli,
 * taslaklar, pasif bölgeler ve noindex işaretli sayfalar listeye girmez.
 */
export async function getIndexableRoutes(): Promise<IndexableRoute[]> {
  const [packages, areas, categories, projects, posts, blogCats, overrides] = await Promise.all([
    getPackages(),
    getAreaPages(),
    getServiceCategories(),
    getProjects(),
    getPosts({ limit: 1000 }),
    getBlogCategories(),
    getAllSeoEntries(),
  ]);
  const latest = (dates: Date[]) => (dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined);
  const pkgUpdated = latest(packages.map((p) => p.updatedAt));
  const postsUpdated = latest(posts.items.map((p) => p.updatedAt));
  const blogPages = Math.ceil(posts.total / POSTS_PER_PAGE);

  const routes: IndexableRoute[] = [
    { path: '/', group: 'sayfa', lastModified: pkgUpdated },
    { path: '/ev-boyama', group: 'sayfa', lastModified: pkgUpdated },
    { path: '/boya-fiyatlari', group: 'sayfa', lastModified: pkgUpdated },
    { path: '/teklif-al', group: 'sayfa' },
    { path: '/hizmetler', group: 'sayfa' },
    { path: '/projeler', group: 'sayfa', lastModified: latest(projects.map((p) => p.updatedAt)) },
    { path: '/blog', group: 'sayfa', lastModified: postsUpdated },
    { path: '/hizmet-bolgeleri', group: 'sayfa', lastModified: latest(areas.map((a) => a.updatedAt)) },
    { path: '/iletisim', group: 'sayfa' },
    { path: '/kurumsal', group: 'kurumsal' },
    { path: '/surec', group: 'kurumsal' },
    { path: '/kat-karsiligi', group: 'kurumsal' },
    ...packages.map((p) => ({ path: `/ev-boyama/${p.slug}`, group: 'paket' as const, lastModified: p.updatedAt })),
    ...areas.map((a) => ({ path: areaPath(a.slug), group: 'lokasyon' as const, lastModified: a.updatedAt })),
    ...categories.flatMap((c) => c.services.map((s) => ({ path: `/hizmetler/${s.slug}`, group: 'hizmet' as const, lastModified: s.updatedAt }))),
    ...projects.map((p) => ({ path: `/projeler/${p.slug}`, group: 'proje' as const, lastModified: p.updatedAt })),
    ...posts.items.map((p) => ({ path: `/blog/${p.slug}`, group: 'blog' as const, lastModified: p.updatedAt })),
    ...blogCats.filter((c) => c.posts > 0).map((c) => ({ path: `/blog/kategori/${c.slug}`, group: 'blog' as const })),
    ...Array.from({ length: Math.max(0, blogPages - 1) }, (_, i) => ({ path: `/blog/sayfa/${i + 2}`, group: 'blog' as const })),
    ...legacy.konum.map((k) => ({ path: `/konum/${k.slug}`, group: 'kurumsal' as const })),
    ...legalPages.map((l) => ({ path: `/${l.slug}`, group: 'hukuki' as const, lastModified: new Date(l.updated) })),
  ];

  const excluded = new Set(overrides.filter((o) => o.noindex || o.excludeFromSitemap).map((o) => o.path));
  return routes.filter((r) => !excluded.has(r.path));
}
