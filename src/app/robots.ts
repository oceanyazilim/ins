import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

/**
 * robots.txt bir güvenlik mekanizması değildir: /admin ve /api oturum kontrolüyle korunur,
 * ayrıca X-Robots-Tag: noindex başlığı taşır. Buradaki kural yalnızca tarama bütçesi içindir.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: `${env.SITE_URL}/sitemap.xml`,
    host: env.SITE_URL,
  };
}
