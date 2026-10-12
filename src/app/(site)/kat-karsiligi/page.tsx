import { ArrowRight, Check } from 'lucide-react';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { katKarsiligi as k } from '@content/corporate';
import { CtaSection, FaqSection, PageHero } from '@/components/sections/blocks';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section, SectionHeader } from '@/components/ui/primitives';
import { JsonLdScript, pageMetadata, SITE_URL } from '@/seo';
import { breadcrumbSchema, serviceSchema } from '@/seo/schema';

const PATH = '/kat-karsiligi';
const DESCRIPTION = 'Ocean İnşaat ile kat karşılığı inşaat: arsa ve imar analizi, fizibilite, noter onaylı sözleşme, inşaat ve tapu devrine kadar sürecin adımları.';
const crumbs = [
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Kat Karşılığı İnşaat', path: PATH },
];

export const generateMetadata = (): Promise<Metadata> => pageMetadata({ path: PATH, title: 'Kat Karşılığı İnşaat Süreci', description: DESCRIPTION });

const idx = (i: number) => ({ '--reveal-index': i }) as CSSProperties;

export default function KatKarsiligiPage() {
  return (
    <>
      <PageHero
        crumbs={crumbs}
        eyebrow="Kat karşılığı"
        title={k.h1}
        lead={k.lead}
        image={{ src: '/images/projects/kadikoy-merdivenkoy-okay-apartmani/kadikoy-merdivenkoy-okay-apartmani-01.jpeg', alt: 'Tamamlanmış çok katlı konut projesinin dış cephe görünümü' }}
        actions={
          <ButtonLink href="/iletisim" size="lg">
            Arsanızı değerlendirelim <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        }
      />

      <Section labelledBy="kk-yaklasim">
        <Container>
          <SectionHeader id="kk-yaklasim" eyebrow="Kat karşılığı süreci" title={k.heading} lead={k.intro} />
          <div className="grid gap-x-12 border-t border-line sm:grid-cols-2 lg:grid-cols-3">
            {k.pillars.map(([t, d], i) => (
              <div key={t} data-reveal style={idx(i % 3)} className="border-b border-line py-8">
                <h3 className="font-display text-xl font-bold text-navy-900">{t}</h3>
                <p className="mt-2 text-muted">{d}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="soft" labelledBy="kk-adimlar">
        <Container>
          <SectionHeader id="kk-adimlar" eyebrow="Süreç adımları" title="Görüşmeden tapu devrine" />
          <ol className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {k.steps.map(([t, d], i) => (
              <li key={t} data-reveal style={idx(i % 4)} className="border-t-2 border-navy-900 pt-5">
                <span className="font-display text-sm font-bold text-ocean-600">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-navy-900">{t}</h3>
                <p className="mt-2 text-[0.9375rem] text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section labelledBy="kk-neden">
        <Container className="grid gap-12 md:grid-cols-2 md:gap-20">
          <div data-reveal>
            <h2 id="kk-neden" className="text-h3 font-bold">
              Neden Ocean İnşaat?
            </h2>
            <ul className="mt-6 space-y-3">
              {k.reasons.map((r) => (
                <li key={r} className="flex gap-3">
                  <Check aria-hidden className="mt-1 size-4 shrink-0 text-ocean-600" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal style={idx(1)}>
            <h2 className="text-h3 font-bold">Kat karşılığına uygun parseller</h2>
            <ul className="mt-6 space-y-3">
              {k.parcels.map((r) => (
                <li key={r} className="flex gap-3">
                  <Check aria-hidden className="mt-1 size-4 shrink-0 text-ocean-600" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <FaqSection items={k.faqs} title="Kat karşılığı hakkında" tone="soft" />
      <CtaSection title="Arsanızın değerini birlikte ortaya çıkaralım." text="Arsanızın konumunu ve imar durumunu paylaşın; ön değerlendirme için sizinle iletişime geçelim." quoteHref="/iletisim" />
      <JsonLdScript data={[serviceSchema(SITE_URL, { path: PATH, name: 'Kat Karşılığı İnşaat', description: DESCRIPTION }), breadcrumbSchema(SITE_URL, crumbs)]} />
    </>
  );
}
