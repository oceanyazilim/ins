import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { processPage } from '@content/corporate';
import { CtaSection, PageHero, ProcessSection } from '@/components/sections/blocks';
import { Container, Section } from '@/components/ui/primitives';
import { JsonLdScript, pageMetadata, SITE_URL } from '@/seo';
import { breadcrumbSchema } from '@/seo/schema';

const PATH = '/surec';
const crumbs = [
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Çalışma Süreci', path: PATH },
];

export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata({
    path: PATH,
    title: 'Çalışma Süreci',
    description: 'Ocean İnşaat’ın ilk görüşmeden teslim sonrasına kadar izlediği çalışma süreci: keşif, projelendirme, teklif, sözleşme, uygulama ve kalite kontrol.',
  });

export default function SurecPage() {
  return (
    <>
      <PageHero crumbs={crumbs} eyebrow="Çalışma süreci" title={processPage.h1} lead={processPage.lead} />

      <Section labelledBy="adimlar">
        <Container>
          <div data-reveal className="mb-12 max-w-3xl">
            <h2 id="adimlar" className="text-h2 font-bold">
              {processPage.heading}
            </h2>
            <p className="mt-5 text-lead text-muted">{processPage.intro}</p>
          </div>
          <ol className="border-t border-line">
            {processPage.steps.map((s, i) => (
              <li key={s.title} data-reveal style={{ '--reveal-index': 0 } as CSSProperties} className="grid gap-6 border-b border-line py-9 md:grid-cols-[5rem_1.4fr_1fr] md:gap-12">
                <span className="font-display text-4xl font-extrabold tracking-[-0.03em] text-ocean-600">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-[-0.015em] text-navy-900">{s.title}</h3>
                  <p className="mt-3 text-muted">{s.text}</p>
                </div>
                <div>
                  <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-muted">Çıktılar</p>
                  <ul className="mt-3 space-y-1.5 text-navy-900">
                    {s.outputs.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <ProcessSection title="Ev boyama işlerinde süreç daha kısadır" />
      <Section flush tone="soft">
        <Container>
          <p className="max-w-3xl text-muted">
            Daire boyama ve küçük ölçekli tadilat işlerinde yukarıdaki dört adım izlenir. Ayrıntılar için{' '}
            <Link href="/ev-boyama" className="text-link">
              ev boyama hizmeti
            </Link>{' '}
            sayfasına bakabilirsiniz.
          </p>
        </Container>
      </Section>

      <CtaSection title="Projenizin süreç planını birlikte oluşturalım." text="İhtiyacınızı paylaşın; teknik ekibimiz değerlendirerek size özel bir çalışma planı hazırlasın." />
      <JsonLdScript data={breadcrumbSchema(SITE_URL, crumbs)} />
    </>
  );
}
