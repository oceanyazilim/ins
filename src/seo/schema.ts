import type { SiteSettings } from '@/config/site';
import { formatPhone } from '@/lib/format';

/**
 * Merkezi, saf (yan etkisiz) JSON-LD üreticileri. Girdi olarak yalnızca sayfada görünen
 * gerçek veriler verilir; puan, yorum veya doğrulanmamış iddia üretilmez.
 */
export type JsonLd = Record<string, unknown>;

export type SchemaPackage = { slug: string; name: string; price: number; currency: string; summary?: string; validUntil?: string | null };

const abs = (base: string, path: string) => (path.startsWith('http') ? path : `${base}${path === '/' ? '' : path}`);

export const businessId = (base: string) => `${base}/#isletme`;

export function businessSchema(base: string, s: SiteSettings, areaNames: string[]): JsonLd {
  const sameAs = Object.values(s.social).filter(Boolean);
  const address: JsonLd = {
    '@type': 'PostalAddress',
    addressLocality: s.address.district,
    addressRegion: s.address.city,
    addressCountry: s.address.country,
  };
  // Gerçek ve yayınlanabilir bir müşteri kabul adresi tanımlanmadıkça sokak adresi eklenmez.
  if (s.address.showStreet && s.address.street) address.streetAddress = s.address.street;

  return {
    '@context': 'https://schema.org',
    '@type': ['GeneralContractor', 'HousePainter'],
    '@id': businessId(base),
    name: s.company.name,
    legalName: s.company.legalName,
    url: base,
    logo: abs(base, '/logo/ocean-insaat-logo-black.svg'),
    image: abs(base, '/images/og-default.jpg'),
    description: s.company.description,
    ...(s.company.foundingYear ? { foundingDate: String(s.company.foundingYear) } : {}),
    telephone: formatPhone(s.contact.phone),
    email: s.contact.emails[0],
    address,
    areaServed: areaNames.map((name) => ({ '@type': 'AdministrativeArea', name: `${name}, İstanbul` })),
    openingHoursSpecification: s.hours
      .filter((h) => h.opens && h.closes)
      .map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.dayCodes, opens: h.opens, closes: h.closes })),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteSchema(base: string, s: SiteSettings): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    name: s.company.name,
    url: base,
    inLanguage: 'tr-TR',
    publisher: { '@id': businessId(base) },
  };
}

export function offerSchema(base: string, p: SchemaPackage): JsonLd {
  return {
    '@type': 'Offer',
    name: p.name,
    url: abs(base, `/ev-boyama/${p.slug}`),
    price: p.price,
    priceCurrency: p.currency,
    ...(p.validUntil ? { priceValidUntil: p.validUntil } : {}),
    seller: { '@id': businessId(base) },
  };
}

export function serviceSchema(
  base: string,
  input: { path: string; name: string; description: string; serviceType?: string; areaNames?: string[]; packages?: SchemaPackage[] },
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${abs(base, input.path)}#hizmet`,
    name: input.name,
    description: input.description,
    serviceType: input.serviceType ?? input.name,
    url: abs(base, input.path),
    provider: { '@id': businessId(base) },
    ...(input.areaNames?.length ? { areaServed: input.areaNames.map((n) => ({ '@type': 'AdministrativeArea', name: `${n}, İstanbul` })) } : {}),
    ...(input.packages?.length ? { offers: input.packages.map((p) => offerSchema(base, p)) } : {}),
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(base: string, crumbs: Crumb[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(base, c.path) })),
  };
}

export function articleSchema(
  base: string,
  input: { path: string; title: string; description: string; publishedAt: Date; updatedAt: Date; authorName: string; image?: string | null },
  s: SiteSettings,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    mainEntityOfPage: abs(base, input.path),
    author: { '@type': 'Organization', name: input.authorName, url: base },
    publisher: { '@type': 'Organization', name: s.company.name, logo: { '@type': 'ImageObject', url: abs(base, '/logo/ocean-insaat-logo-black.svg') } },
    ...(input.image ? { image: abs(base, input.image) } : {}),
    inLanguage: 'tr-TR',
  };
}

/** <script> içine güvenle gömülebilecek JSON metni. */
export const serializeJsonLd = (data: JsonLd | JsonLd[]) => JSON.stringify(data).replace(/</g, '\\u003c');
