import 'server-only';
import type { Metadata } from 'next';
import { env } from '@/lib/env';
import { getSeoEntry } from '@/server/data';
import { composeMetadata, type SeoInput } from './metadata';
import { serializeJsonLd, type JsonLd } from './schema';

export const SITE_URL = env.SITE_URL;

/** generateMetadata içinde kullanılır; yönetim panelindeki SEO geçersiz kılmalarını uygular. */
export async function pageMetadata(input: SeoInput): Promise<Metadata> {
  return composeMetadata(SITE_URL, input, await getSeoEntry(input.path));
}

export function JsonLdScript({ data }: { data: JsonLd | JsonLd[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
