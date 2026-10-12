import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { canonicalUrl } from '@/seo/metadata';
import { getIndexableRoutes } from '@/seo/routes';

export const revalidate = 3600;

/** Yalnızca yayında olan canonical adresler. lastmod gerçek içerik güncellemesi biliniyorsa yazılır. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await getIndexableRoutes();
  return routes.map((r) => ({ url: canonicalUrl(env.SITE_URL, r.path), ...(r.lastModified ? { lastModified: r.lastModified } : {}) }));
}
