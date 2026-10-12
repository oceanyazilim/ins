import 'server-only';
import { and, asc, count, desc, eq, ne, sql } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/db';
import {
  blogAuthors,
  blogCategories,
  blogPosts,
  comparisons,
  faqs,
  neighborhoods,
  paintingPackages,
  projectImages,
  projects,
  redirectRules,
  seoEntries,
  serviceAreas,
  serviceCategories,
  services,
  siteSettings,
} from '@/db/schema';
import { defaultSettings, EXCLUDED_AREA_SLUGS, type SiteSettings } from '@/config/site';

/* Bütün sorgular istek başına React cache ile tekilleştirilir. Sayfalar ISR ile önbelleklenir;
   yönetim panelindeki değişiklikler revalidatePath('/', 'layout') ile tüm siteyi yeniler. */

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await db.select().from(siteSettings);
  const merged = structuredClone(defaultSettings) as Record<string, unknown>;
  for (const r of rows) if (r.key in merged) merged[r.key] = r.value;
  return merged as SiteSettings;
});

/* ---------------- Fiyat paketleri: tek merkezi kaynak ---------------- */

export const getPackages = cache(async () =>
  db.select().from(paintingPackages).where(eq(paintingPackages.active, true)).orderBy(asc(paintingPackages.sort), asc(paintingPackages.price)),
);

export const getPackageBySlug = cache(async (slug: string) => {
  const [row] = await db.select().from(paintingPackages).where(and(eq(paintingPackages.slug, slug), eq(paintingPackages.active, true))).limit(1);
  return row ?? null;
});

export type PackageSummary = { id: number; slug: string; roomType: string; name: string; price: number; currency: string; summary: string; vatNote: string };
export const toPackageSummary = (p: Awaited<ReturnType<typeof getPackages>>[number]): PackageSummary => ({
  id: p.id, slug: p.slug, roomType: p.roomType, name: p.name, price: p.price, currency: p.currency, summary: p.summary, vatNote: p.vatNote,
});

/* ---------------- Hizmet bölgeleri ---------------- */

/** Yalnızca aktif ve hariç tutulmayan bölgeler; sıralama: merkez → birincil → ikincil. */
export const getActiveAreas = cache(async () => {
  const rows = await db.query.serviceAreas.findMany({
    where: eq(serviceAreas.active, true),
    orderBy: [desc(serviceAreas.isHub), asc(serviceAreas.tier), asc(serviceAreas.sort)],
    with: { neighborhoods: { where: eq(neighborhoods.active, true), orderBy: [asc(neighborhoods.sort), asc(neighborhoods.name)] } },
  });
  return rows.filter((a) => !EXCLUDED_AREA_SLUGS.includes(a.slug));
});

export const getAreaPages = cache(async () => (await getActiveAreas()).filter((a) => a.pagePublished));

export const getAreaBySlug = cache(async (slug: string) => (await getAreaPages()).find((a) => a.slug === slug) ?? null);

export const areaPath = (slug: string) => `/${slug}-ev-boyama`;

/* ---------------- Hizmetler ---------------- */

export const getServiceCategories = cache(async () =>
  db.query.serviceCategories.findMany({
    orderBy: [asc(serviceCategories.sort)],
    with: { services: { where: eq(services.status, 'published'), orderBy: [asc(services.sort), asc(services.title)] } },
  }),
);

export const getService = cache(async (slug: string) => {
  const row = await db.query.services.findFirst({ where: and(eq(services.slug, slug), eq(services.status, 'published')), with: { category: true } });
  return row ?? null;
});

export const getServicesBySlugs = cache(async (slugs: string[]) => {
  const all = (await getServiceCategories()).flatMap((c) => c.services);
  return slugs.map((s) => all.find((x) => x.slug === s)).filter((x): x is NonNullable<typeof x> => Boolean(x));
});

/* ---------------- Projeler ---------------- */

export const getProjects = cache(async () =>
  db.query.projects.findMany({
    where: eq(projects.publishStatus, 'published'),
    orderBy: [asc(projects.sort), desc(projects.createdAt)],
    with: { images: { orderBy: [asc(projectImages.sort)] } },
  }),
);

export const getProject = cache(async (slug: string) => (await getProjects()).find((p) => p.slug === slug) ?? null);

export const getComparisons = cache(async () =>
  db.select().from(comparisons).where(eq(comparisons.published, true)).orderBy(asc(comparisons.sort)),
);

/* ---------------- Blog ---------------- */

export const POSTS_PER_PAGE = 9;

const postSelect = {
  id: blogPosts.id,
  slug: blogPosts.slug,
  title: blogPosts.title,
  excerpt: blogPosts.excerpt,
  cover: blogPosts.cover,
  coverAlt: blogPosts.coverAlt,
  readMinutes: blogPosts.readMinutes,
  publishedAt: blogPosts.publishedAt,
  updatedAt: blogPosts.updatedAt,
  categorySlug: blogCategories.slug,
  categoryName: blogCategories.name,
};

export const getBlogCategories = cache(async () => {
  const rows = await db
    .select({ id: blogCategories.id, slug: blogCategories.slug, name: blogCategories.name, description: blogCategories.description, posts: count(blogPosts.id) })
    .from(blogCategories)
    .leftJoin(blogPosts, and(eq(blogPosts.categoryId, blogCategories.id), eq(blogPosts.status, 'published')))
    .groupBy(blogCategories.id)
    .orderBy(asc(blogCategories.sort));
  return rows;
});

export const getPosts = cache(async (opts: { categorySlug?: string; page?: number; limit?: number } = {}) => {
  const limit = opts.limit ?? POSTS_PER_PAGE;
  const page = Math.max(1, opts.page ?? 1);
  const where = and(eq(blogPosts.status, 'published'), opts.categorySlug ? eq(blogCategories.slug, opts.categorySlug) : undefined);
  const [items, [total]] = await Promise.all([
    db
      .select(postSelect)
      .from(blogPosts)
      .innerJoin(blogCategories, eq(blogCategories.id, blogPosts.categoryId))
      .where(where)
      .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.id))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ n: count() }).from(blogPosts).innerJoin(blogCategories, eq(blogCategories.id, blogPosts.categoryId)).where(where),
  ]);
  return { items, total: total?.n ?? 0, pages: Math.max(1, Math.ceil((total?.n ?? 0) / limit)), page };
});

export const getPost = cache(async (slug: string) => {
  const [row] = await db
    .select({ post: blogPosts, category: blogCategories, author: blogAuthors })
    .from(blogPosts)
    .innerJoin(blogCategories, eq(blogCategories.id, blogPosts.categoryId))
    .innerJoin(blogAuthors, eq(blogAuthors.id, blogPosts.authorId))
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, 'published')))
    .limit(1);
  return row ?? null;
});

export const getRelatedPosts = cache(async (postId: number, categoryId: number, limit = 3) =>
  db
    .select(postSelect)
    .from(blogPosts)
    .innerJoin(blogCategories, eq(blogCategories.id, blogPosts.categoryId))
    .where(and(eq(blogPosts.status, 'published'), ne(blogPosts.id, postId)))
    .orderBy(sql`(${blogPosts.categoryId} = ${categoryId}) desc`, desc(blogPosts.publishedAt))
    .limit(limit),
);

/** Belirli kategorilerden en güncel yazılar (ana sayfa ve hizmet sayfalarındaki rehber modülleri). */
export const getPostsByCategories = cache(async (slugs: string[], limit = 3) => {
  const rows = await db
    .select(postSelect)
    .from(blogPosts)
    .innerJoin(blogCategories, eq(blogCategories.id, blogPosts.categoryId))
    .where(eq(blogPosts.status, 'published'))
    .orderBy(desc(blogPosts.publishedAt));
  const preferred = rows.filter((r) => slugs.includes(r.categorySlug));
  return [...preferred, ...rows.filter((r) => !slugs.includes(r.categorySlug))].slice(0, limit);
});

/* ---------------- SSS / SEO / Yönlendirme ---------------- */

export const getFaqs = cache(async (scope: string) =>
  db.select().from(faqs).where(and(eq(faqs.scope, scope), eq(faqs.active, true))).orderBy(asc(faqs.sort), asc(faqs.id)),
);

export const getSeoEntry = cache(async (path: string) => {
  const [row] = await db.select().from(seoEntries).where(eq(seoEntries.path, path)).limit(1);
  return row ?? null;
});

export const getAllSeoEntries = cache(async () => db.select().from(seoEntries));

/** Yönetim panelinden tanımlanan yönlendirmeyi bulur. Zincir oluşmaması kayıt sırasında denetlenir. */
export async function findRedirect(path: string) {
  const normalized = path.length > 1 ? path.replace(/\/+$/, '') : path;
  const [row] = await db.select().from(redirectRules).where(and(eq(redirectRules.source, normalized), eq(redirectRules.active, true))).limit(1);
  if (!row) return null;
  await db.update(redirectRules).set({ hits: sql`${redirectRules.hits} + 1` }).where(eq(redirectRules.id, row.id));
  return row;
}
