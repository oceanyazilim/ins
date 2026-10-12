import type { Metadata } from 'next';

export type SeoOverride = {
  title?: string | null;
  description?: string | null;
  canonical?: string | null;
  ogImage?: string | null;
  noindex?: boolean | null;
} | null;

export type SeoInput = {
  /** Sorgu parametresiz, başında / olan yol. Canonical bu yoldan üretilir. */
  path: string;
  title: string;
  description: string;
  /** true ise başlığın sonuna marka eklenmez (başlık zaten markayı içeriyorsa). */
  absoluteTitle?: boolean;
  image?: string | null;
  type?: 'website' | 'article';
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
};

export const BRAND = 'Ocean İnşaat';

export function canonicalUrl(base: string, path: string): string {
  const clean = path.split(/[?#]/)[0]!.replace(/\/+$/, '');
  return clean === '' ? base : `${base}${clean}`;
}

export const fullTitle = (title: string, absolute?: boolean) => (absolute || title.includes(BRAND) ? title : `${title} | ${BRAND}`);

/**
 * Saf metadata üreticisi: merkezi şablon + (varsa) yönetim panelinden girilen sayfa bazlı geçersiz kılma.
 * Canonical her zaman mutlak, tek ana domainde ve sorgu parametresizdir.
 */
export function composeMetadata(base: string, input: SeoInput, override: SeoOverride = null): Metadata {
  const title = override?.title?.trim() ? override.title.trim() : fullTitle(input.title, input.absoluteTitle);
  const description = override?.description?.trim() || input.description;
  const canonical = override?.canonical?.trim() || canonicalUrl(base, input.path);
  const noindex = Boolean(override?.noindex ?? input.noindex);
  const image = override?.ogImage?.trim() || input.image || '/images/og-default.jpg';
  const imageUrl = image.startsWith('http') ? image : `${base}${image}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
    openGraph: {
      type: input.type ?? 'website',
      locale: 'tr_TR',
      siteName: BRAND,
      url: canonical,
      title,
      description,
      images: [{ url: imageUrl }],
      ...(input.type === 'article' ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
  };
}
