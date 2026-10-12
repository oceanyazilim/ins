import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import legacy from '@content/legacy/legacy.json';
import { CtaSection, FaqSection, PageHero } from '@/components/sections/blocks';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section } from '@/components/ui/primitives';
import { JsonLdScript, pageMetadata, SITE_URL } from '@/seo';
import { breadcrumbSchema } from '@/seo/schema';
import { redirectOrNotFound } from '@/server/redirects';

/**
 * Mevcut sitedeki kurumsal inşaat lokasyon sayfaları (URL'leri korunur).
 * Bu sayfalar inşaat ve taahhüt hizmetlerine yöneliktir; ev boyama hizmet bölgeleri
 * ayrıca yönetilir (/hizmet-bolgeleri) ve burada ev boyama hizmeti vaat edilmez.
 */
type Konum = (typeof legacy.konum)[number];
type Props = { params: Promise<{ slug: string }> };

const find = (slug: string): Konum | undefined => legacy.konum.find((k) => k.slug === slug);

export const dynamicParams = true;
export function generateStaticParams() {
  return legacy.konum.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const k = find((await params).slug);
  if (!k) return {};
  return pageMetadata({ path: `/konum/${k.slug}`, title: k.metaTitle, description: `${k.title}: ${k.metaDescription}` });
}

export default async function KonumPage({ params }: Props) {
  const { slug } = await params;
  const k = find(slug);
  if (!k) return redirectOrNotFound(`/konum/${slug}`);
  const crumbs = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Kurumsal', path: '/kurumsal' },
    { name: k.title, path: `/konum/${k.slug}` },
  ];
  return (
    <>
      <PageHero
        crumbs={crumbs}
        eyebrow={`Kurumsal inşaat · ${k.eyebrow}`}
        title={k.title}
        lead={k.tagline}
        actions={
          <ButtonLink href="/iletisim" size="lg">
            Projeniz için bize ulaşın <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        }
      />
      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div data-reveal>
            <h2 className="text-h2 font-bold">{k.heading}</h2>
            <p className="mt-6 text-lead text-muted">{k.intro}</p>
            <div className="mt-12 grid gap-x-10 border-t border-line sm:grid-cols-2">
              {k.reasons.map((r, i) => (
                <div key={r.title} data-reveal style={{ '--reveal-index': i % 2 } as CSSProperties} className="border-b border-line py-7">
                  <h3 className="font-display text-xl font-bold text-navy-900">{r.title}</h3>
                  <p className="mt-2 text-muted">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <aside data-reveal className="rounded-(--radius-xl) bg-soft p-7 lg:sticky lg:top-28 lg:self-start">
            <h2 className="font-display text-lg font-bold text-navy-900">Bölgesel odak</h2>
            <ul className="mt-4 divide-y divide-line-strong">
              {k.focus.map((f) => (
                <li key={f} className="py-3 font-medium text-navy-900">
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/hizmetler#kurumsal-insaat" className="link-arrow mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900">
              Kurumsal inşaat hizmetleri <ArrowRight aria-hidden className="size-4" />
            </Link>
          </aside>
        </Container>
      </Section>
      <FaqSection items={k.faqs} title={`${k.title} hakkında`} tone="soft" />
      <CtaSection title="Projeniz için bize ulaşın." text="İnşaat, renovasyon, dış cephe veya kat karşılığı projeniz için ekibimiz ihtiyaçlarınızı değerlendirsin." quoteHref="/iletisim" />
      <JsonLdScript data={breadcrumbSchema(SITE_URL, crumbs)} />
    </>
  );
}
