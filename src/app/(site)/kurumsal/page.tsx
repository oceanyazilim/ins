import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { about } from '@content/corporate';
import legacy from '@content/legacy/legacy.json';
import { CtaSection, PageHero } from '@/components/sections/blocks';
import { Container, Section, SectionHeader } from '@/components/ui/primitives';
import { JsonLdScript, pageMetadata, SITE_URL } from '@/seo';
import { breadcrumbSchema } from '@/seo/schema';

const PATH = '/kurumsal';
const crumbs = [
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Kurumsal', path: PATH },
];

export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata({
    path: PATH,
    title: 'Kurumsal',
    description: 'Ocean İnşaat kurumsal kimliği, misyon ve vizyonu, kalite politikası, teknik kapasitesi ve şirket tarihi hakkında bilgi alın.',
  });

const idx = (i: number) => ({ '--reveal-index': i }) as CSSProperties;

const CORPORATE_LINKS = [
  ['Anahtar Teslim İnşaat', '/hizmetler/anahtar-teslim-insaat'],
  ['Kat Karşılığı İnşaat', '/kat-karsiligi'],
  ['Konut İnşaatı', '/hizmetler/konut-insaati'],
  ['Kentsel Dönüşüm', '/hizmetler/kentsel-donusum'],
  ['İnşaat Danışmanlığı', '/hizmetler/insaat-danismanligi'],
  ['Çalışma Sürecimiz', '/surec'],
] as const;

export default function KurumsalPage() {
  return (
    <>
      <PageHero
        crumbs={crumbs}
        eyebrow="Kurumsal"
        title={about.h1}
        lead={about.lead}
        image={{ src: '/images/projects/quattro-istanbul-serifali/quattro-istanbul-serifali-01.jpeg', alt: 'Yüksek yapı projesinin betonarme imalat aşamasından bir görüntü' }}
      />

      <Section labelledBy="hakkimizda">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <h2 id="hakkimizda" data-reveal className="text-h2 font-bold">
            {about.heading}
          </h2>
          <div data-reveal style={idx(1)} className="prose-ocean">
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 30)}>{p}</p>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="navy" labelledBy="misyon-vizyon">
        <Container>
          <h2 id="misyon-vizyon" className="sr-only">
            Misyon, vizyon ve değerler
          </h2>
          <div className="grid gap-12 md:grid-cols-2 md:gap-20">
            {[
              ['Misyonumuz', about.mission],
              ['Vizyonumuz', about.vision],
            ].map(([t, d], i) => (
              <div key={t} data-reveal style={idx(i)} className="border-t border-white/20 pt-8">
                <h3 className="eyebrow">{t}</h3>
                <p className="mt-4 font-display text-2xl font-semibold leading-snug tracking-[-0.015em] text-white">{d}</p>
              </div>
            ))}
          </div>
          <ul data-reveal className="mt-14 flex flex-wrap gap-2">
            {about.values.map((v) => (
              <li key={v} className="rounded-full border border-white/25 px-4 py-2 text-sm font-medium text-white/90">
                {v}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section labelledBy="ilkeler">
        <Container>
          <SectionHeader id="ilkeler" eyebrow="Yönetim ilkelerimiz" title="Kalite, çevre ve iş güvenliği yaklaşımımız" />
          <div className="grid gap-x-12 border-t border-line md:grid-cols-3">
            {about.principles.map((p, i) => (
              <div key={p.title} data-reveal style={idx(i)} className="border-b border-line py-8">
                <h3 className="font-display text-xl font-bold text-navy-900">{p.title}</h3>
                <p className="mt-3 text-muted">{p.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="soft" labelledBy="kapasite">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div data-reveal>
            <p className="eyebrow mb-4">Teknik kapasitemiz</p>
            <h2 id="kapasite" className="text-h2 font-bold">
              Modern yazılımlar ve deneyimli ekipler
            </h2>
            <ul className="mt-8 grid gap-x-8 sm:grid-cols-2">
              {about.capabilities.map((c) => (
                <li key={c} className="border-t border-line-strong py-4 font-medium text-navy-900">
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal style={idx(1)}>
            <p className="eyebrow mb-4">Ekip yapımız</p>
            <h2 className="text-h2 font-bold">Disiplinler aynı çatı altında</h2>
            <dl className="mt-8">
              {about.team.map(([role, focus]) => (
                <div key={role} className="flex justify-between gap-6 border-t border-line-strong py-4">
                  <dt className="font-medium text-navy-900">{role}</dt>
                  <dd className="text-right text-muted">{focus}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </Section>

      <Section labelledBy="tarihce">
        <Container>
          <SectionHeader id="tarihce" eyebrow="Şirket zaman çizelgesi" title="Ocean İnşaat’ın yolculuğu" />
          <ol className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {about.timeline.map(([year, title, text], i) => (
              <li key={year} data-reveal style={idx(i % 3)} className="border-t-2 border-navy-900 pt-5">
                <p className="font-display text-4xl font-extrabold tracking-[-0.03em] text-ocean-600">{year}</p>
                <h3 className="mt-3 font-display text-xl font-bold text-navy-900">{title}</h3>
                <p className="mt-2 text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="soft" labelledBy="kurumsal-hizmetler">
        <Container>
          <SectionHeader id="kurumsal-hizmetler" eyebrow="Kurumsal inşaat" title="Kurumsal hizmet başlıklarımız" lead="Konut, ticari ve endüstriyel yapı projelerinde sunduğumuz hizmetler." />
          <ul className="grid gap-x-12 border-t border-line-strong md:grid-cols-2">
            {CORPORATE_LINKS.map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="group flex items-center justify-between border-b border-line-strong py-5 font-display text-xl font-bold text-navy-900 hover:text-ocean-700">
                  {label}
                  <span className="link-arrow">
                    <ArrowRight aria-hidden className="size-5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <h3 className="mt-12 font-display text-sm font-bold uppercase tracking-[0.14em] text-muted">Bölgelere göre kurumsal inşaat</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {legacy.konum.map((k) => (
              <li key={k.slug}>
                <Link href={`/konum/${k.slug}`} className="block rounded-full border border-line-strong bg-white px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:border-navy-900">
                  {k.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-muted">
            Tamamlanan işlerimiz için{' '}
            <Link href="/projeler" className="text-link">
              projelerimiz
            </Link>{' '}
            sayfasını inceleyebilirsiniz.
          </p>
        </Container>
      </Section>

      <CtaSection title="Kurumsal işbirlikleri için bize ulaşın." text="İnşaat, renovasyon, dış cephe veya kat karşılığı projeniz için ekibimiz ihtiyaçlarınızı değerlendirsin." quoteHref="/iletisim" />
      <JsonLdScript data={breadcrumbSchema(SITE_URL, crumbs)} />
    </>
  );
}
