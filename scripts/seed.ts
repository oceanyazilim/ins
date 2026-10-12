/**
 * İlk kurulum verisi. Tekrar çalıştırılabilir: var olan kayıtların üzerine YAZMAZ
 * (panelden yapılan değişiklikler korunur). `--reset` ile bütün içerik tabloları boşaltılıp yeniden kurulur.
 */
import fs from 'node:fs';
import path from 'node:path';
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import sharp from 'sharp';
import * as s from '../src/db/schema';
import { defaultSettings, EXCLUDED_AREA_SLUGS } from '../src/config/site';
import { estimateReadMinutes } from '../src/lib/markdown';
import { seedAreas } from '../content/seed/areas';
import { seedFaqs } from '../content/seed/faqs';
import { defaultScopeItems, defaultScopeNote, seedPackages } from '../content/seed/packages';
import * as tax from '../content/seed/taxonomy';

const url = process.env.DATABASE_URL ?? 'postgres://ocean:ocean@localhost:54329/ocean';
const client = postgres(url, { max: 1, onnotice: () => {} });
const db = drizzle(client, { schema: s });
const reset = process.argv.includes('--reset');

type Legacy = {
  services: (Record<string, unknown> & { slug: string; title: string })[];
  projects: (Record<string, string | string[]> & { slug: string })[];
  posts: { slug: string; title: string; metaTitle: string; metaDescription: string; category: string; date: string; readTime: string; body: string }[];
};
const legacy: Legacy = JSON.parse(fs.readFileSync('content/legacy/legacy.json', 'utf8'));

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
function parseTrDate(v: string): Date {
  const [d, m, y] = v.trim().split(' ');
  return new Date(Date.UTC(Number(y), MONTHS.indexOf(m!), Number(d), 9));
}

/** İçerikte elle yazılmış paket fiyatlarını merkezi fiyat yer tutucusuna çevirir. */
function tokenizePrices(text: string): string {
  let out = text;
  for (const p of seedPackages) {
    const formatted = p.price.toLocaleString('tr-TR');
    out = out.replaceAll(`${formatted} TL`, `{{fiyat:${p.roomType}}}`).replaceAll(`${formatted} TL`, `{{fiyat:${p.roomType}}}`);
  }
  return out;
}

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const m = raw.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error('Frontmatter bulunamadı');
  const data: Record<string, string> = {};
  for (const line of m[1]!.split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return { data, body: m[2]!.trim() };
}

async function main() {
  if (reset) {
    await db.execute(sql`TRUNCATE service_categories, services, painting_packages, package_price_history, service_areas, neighborhoods, projects, project_images, comparisons, blog_categories, blog_authors, blog_posts, faqs, site_settings RESTART IDENTITY CASCADE`);
  }

  /* Ayarlar */
  for (const [key, value] of Object.entries(defaultSettings)) {
    await db.insert(s.siteSettings).values({ key, value }).onConflictDoNothing();
  }

  /* Hizmet kategorileri ve hizmetler */
  for (const [i, c] of tax.serviceCategories.entries()) {
    await db.insert(s.serviceCategories).values({ ...c, sort: i }).onConflictDoNothing();
  }
  const cats = Object.fromEntries((await db.select().from(s.serviceCategories)).map((c) => [c.slug, c.id]));
  const sortOf = (slug: string) => {
    const i = tax.serviceOrder.indexOf(slug);
    return i === -1 ? 100 : i;
  };

  const newServiceDir = 'content/services';
  const newServices = fs.existsSync(newServiceDir)
    ? fs.readdirSync(newServiceDir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(newServiceDir, f), 'utf8')))
    : [];
  const allServices = [
    ...newServices,
    ...legacy.services
      .filter((x) => !tax.droppedLegacyServices.includes(x.slug))
      .map((x) => ({ ...x, category: tax.legacyServiceCategory[x.slug] ?? 'yapi-muhendislik', body: '', related: [] })),
  ];
  for (const x of allServices) {
    const img = tax.serviceImages[x.slug];
    if (!cats[x.category]) throw new Error(`Bilinmeyen hizmet kategorisi: ${x.category} (${x.slug})`);
    await db
      .insert(s.services)
      .values({
        slug: x.slug,
        categoryId: cats[x.category]!,
        title: x.title,
        tagline: x.tagline ?? '',
        overview: x.overview ?? '',
        intro: tokenizePrices(x.intro ?? ''),
        body: tokenizePrices(x.body ?? ''),
        scope: x.scope ?? [],
        steps: x.steps ?? [],
        materials: x.materials ?? [],
        benefits: x.benefits ?? [],
        projectTypes: x.projectTypes ?? [],
        faqs: (x.faqs ?? []).map((f: s.QA) => ({ q: f.q, a: tokenizePrices(f.a) })),
        related: x.related ?? [],
        image: img?.src ?? null,
        imageAlt: img?.alt ?? null,
        metaTitle: x.metaTitle ?? null,
        metaDescription: x.metaDescription ?? null,
        sort: sortOf(x.slug),
      })
      .onConflictDoNothing();
  }

  /* Boya paketleri */
  for (const [i, p] of seedPackages.entries()) {
    const [row] = await db
      .insert(s.paintingPackages)
      .values({ ...p, currency: 'TRY', scopeItems: defaultScopeItems, scopeNote: defaultScopeNote, sort: i })
      .onConflictDoNothing()
      .returning();
    if (row) await db.insert(s.packagePriceHistory).values({ packageId: row.id, oldPrice: null, newPrice: row.price });
  }

  /* Hizmet bölgeleri */
  for (const [i, a] of seedAreas.entries()) {
    if (EXCLUDED_AREA_SLUGS.includes(a.slug)) throw new Error(`Hariç tutulan bölge seed verisinde: ${a.slug}`);
    const { neighborhoods, ...area } = a;
    const [row] = await db.insert(s.serviceAreas).values({ ...area, sort: i }).onConflictDoNothing().returning();
    if (row && neighborhoods) {
      await db.insert(s.neighborhoods).values(neighborhoods.map((name, j) => ({ areaId: row.id, name, sort: j })));
    }
  }

  /* SSS */
  const [{ n: faqCount } = { n: 0 }] = await db.select({ n: sql<number>`count(*)::int` }).from(s.faqs);
  if (faqCount === 0) {
    for (const [scope, items] of Object.entries(seedFaqs)) {
      await db.insert(s.faqs).values(items.map((f, i) => ({ scope, question: f.q, answer: f.a, sort: i })));
    }
  }

  /* Projeler (mevcut siteden) */
  for (const [i, slug] of tax.projectOrder.entries()) {
    const p = legacy.projects.find((x) => x.slug === slug);
    if (!p) continue;
    const [row] = await db
      .insert(s.projects)
      .values({
        slug,
        title: p.title as string,
        kind: 'insaat',
        category: p.category as string,
        projectType: p.type as string,
        status: p.status as string,
        region: p.region as string,
        summary: p.summary as string,
        about: p.about as string,
        role: p.role as string,
        roleTags: p.roleTags as string[],
        relatedServices: p.relatedServices as string[],
        metaTitle: p.metaTitle as string,
        metaDescription: p.metaDescription as string,
        featured: i < 5,
        sort: i,
      })
      .onConflictDoNothing()
      .returning();
    if (!row) continue;
    const folder = tax.projectImageFolders[slug]!;
    const dir = path.join('public/images/projects', folder);
    const files = fs.readdirSync(dir).sort();
    const alts = p.alts as string[];
    for (const [j, f] of files.entries()) {
      const meta = await sharp(path.join(dir, f)).metadata();
      await db.insert(s.projectImages).values({
        projectId: row.id,
        src: `/images/projects/${folder}/${f}`,
        alt: alts[j] ?? `${p.title} — uygulama görüntüsü ${j + 1}`,
        width: meta.width ?? 1024,
        height: meta.height ?? 768,
        sort: j,
      });
    }
  }

  /* Öncesi / sonrası: eski sitedeki çift doğrulanana kadar yayınlanmaz */
  const [{ n: cmpCount } = { n: 0 }] = await db.select({ n: sql<number>`count(*)::int` }).from(s.comparisons);
  if (cmpCount === 0) {
    await db.insert(s.comparisons).values({
      title: 'Dış cephe — öncesi ve sonrası',
      caption: 'Eski siteden aktarıldı. Aynı yapıya ait olduğu doğrulandıktan sonra yayınlayın.',
      beforeSrc: '/images/before-after/facade-before.jpeg',
      afterSrc: '/images/before-after/facade-after.jpeg',
      kind: 'insaat',
      published: false,
    });
  }

  /* Blog */
  for (const [i, c] of tax.blogCategories.entries()) await db.insert(s.blogCategories).values({ ...c, sort: i }).onConflictDoNothing();
  await db
    .insert(s.blogAuthors)
    .values({ slug: 'ocean-insaat', name: 'Ocean İnşaat', bio: 'Ocean İnşaat ekibi tarafından hazırlanan rehber içerikler.' })
    .onConflictDoNothing();
  const bcats = Object.fromEntries((await db.select().from(s.blogCategories)).map((c) => [c.slug, c.id]));
  const [author] = await db.select().from(s.blogAuthors).where(eq(s.blogAuthors.slug, 'ocean-insaat'));

  for (const p of legacy.posts) {
    const cat = tax.legacyPostCategory[p.slug] ?? 'insaat-ve-yapi';
    const cover = tax.blogCovers[cat];
    await db
      .insert(s.blogPosts)
      .values({
        slug: p.slug,
        title: p.title,
        excerpt: p.metaDescription,
        body: p.body,
        categoryId: bcats[cat]!,
        authorId: author!.id,
        cover: cover?.src ?? null,
        coverAlt: cover?.alt ?? null,
        readMinutes: parseInt(p.readTime, 10) || 5,
        status: 'published',
        publishedAt: parseTrDate(p.date),
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
      })
      .onConflictDoNothing();
  }

  const blogDir = 'content/blog';
  const now = Date.now();
  const files = fs.existsSync(blogDir) ? fs.readdirSync(blogDir).filter((f) => f.endsWith('.md')).sort() : [];
  for (const f of files) {
    const { data, body } = parseFrontmatter(fs.readFileSync(path.join(blogDir, f), 'utf8'));
    const slug = data.slug || f.replace(/\.md$/, '');
    if (!bcats[data.category!]) throw new Error(`Bilinmeyen blog kategorisi: ${data.category} (${f})`);
    const publishIdx = tax.initiallyPublishedPosts.indexOf(slug);
    const cover = tax.postCovers[slug] ?? tax.blogCovers[data.category!];
    const text = tokenizePrices(body);
    await db
      .insert(s.blogPosts)
      .values({
        slug,
        title: data.title!,
        excerpt: data.excerpt ?? '',
        body: text,
        categoryId: bcats[data.category!]!,
        authorId: author!.id,
        cover: cover?.src ?? null,
        coverAlt: cover?.alt ?? null,
        related: (data.related ?? '').split(',').map((x) => x.trim()).filter(Boolean),
        readMinutes: estimateReadMinutes(text),
        status: publishIdx > -1 ? 'published' : 'review',
        // Yayınlananlar sıralı görünsün diye birer dakika arayla tarihlenir.
        publishedAt: publishIdx > -1 ? new Date(now - publishIdx * 60_000) : null,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
      })
      .onConflictDoNothing();
  }

  const counts = await db.execute(sql`
    SELECT (SELECT count(*) FROM services) AS services, (SELECT count(*) FROM painting_packages) AS packages,
           (SELECT count(*) FROM service_areas WHERE active) AS active_areas, (SELECT count(*) FROM projects) AS projects,
           (SELECT count(*) FROM blog_posts WHERE status = 'published') AS published_posts,
           (SELECT count(*) FROM blog_posts WHERE status = 'review') AS review_posts, (SELECT count(*) FROM faqs) AS faqs`);
  console.log('Seed tamamlandı:', counts[0]);
  await client.end();
}

main().catch(async (e) => {
  console.error(e);
  await client.end();
  process.exit(1);
});
