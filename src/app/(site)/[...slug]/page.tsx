import { ArrowRight, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { legalPages } from '@content/legal';
import { AreasSection, CtaSection, FaqSection, PageHero, ProcessSection } from '@/components/sections/blocks';
import { renderContent } from '@/server/content';
import { PriceCards } from '@/components/sections/cards';
import { TrackView } from '@/components/site/site-client';
import { ButtonLink } from '@/components/ui/button';
import { Breadcrumbs, Container, Section, SectionHeader } from '@/components/ui/primitives';
import { formatDate } from '@/lib/format';
import { JsonLdScript, pageMetadata, SITE_URL } from '@/seo';
import { breadcrumbSchema, serviceSchema } from '@/seo/schema';
import { areaPath, getAreaBySlug, getAreaPages, getPackages } from '@/server/data';
import { redirectOrNotFound } from '@/server/redirects';

/**
 * Kök düzeyindeki tek parçalı dinamik adresler:
 *   /{ilce}-ev-boyama  → yalnızca aktif ve içeriği yayınlanmış hizmet bölgeleri
 *   /kvkk-aydinlatma-metni vb. → hukuki metinler
 * Eşleşmeyen her yol için panelden tanımlı yönlendirmelere bakılır, yoksa gerçek 404 döner.
 */
type Props = { params: Promise<{ slug: string[] }> };

const AREA_SUFFIX = '-ev-boyama';
const AREA_SERVICES = [
  { label: 'İç Cephe Boyama', href: '/hizmetler/ic-cephe-boyama' },
  { label: 'Boya Badana', href: '/hizmetler/boya-badana' },
  { label: 'Duvar Onarımı', href: '/hizmetler/duvar-onarimi' },
  { label: 'Dekoratif Boya', href: '/hizmetler/dekoratif-boya' },
  { label: 'Alçı ve Sıva', href: '/hizmetler/alci-siva' },
  { label: 'Komple Ev Tadilatı', href: '/hizmetler/ev-tadilati' },
];

async function resolve(slug: string[]) {
  if (slug.length !== 1) return null;
  const s = slug[0]!;
  if (s.endsWith(AREA_SUFFIX)) {
    const area = await getAreaBySlug(s.slice(0, -AREA_SUFFIX.length));
    if (area) return { kind: 'area' as const, area };
  }
  const legal = legalPages.find((l) => l.slug === s);
  if (legal) return { kind: 'legal' as const, legal };
  return null;
}

export async function generateStaticParams() {
  return [...(await getAreaPages()).map((a) => ({ slug: [`${a.slug}${AREA_SUFFIX}`] })), ...legalPages.map((l) => ({ slug: [l.slug] }))];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = await resolve(slug);
  if (!r) return {};
  if (r.kind === 'area') {
    return pageMetadata({
      path: areaPath(r.area.slug),
      title: r.area.metaTitle || `${r.area.name} Ev Boyama`,
      description: r.area.metaDescription || r.area.lead,
    });
  }
  return pageMetadata({ path: `/${r.legal.slug}`, title: r.legal.title, description: r.legal.description });
}

const idx = (i: number) => ({ '--reveal-index': i }) as CSSProperties;

export default async function CatchAllPage({ params }: Props) {
  const { slug } = await params;
  const r = await resolve(slug);
  if (!r) return redirectOrNotFound(`/${slug.join('/')}`);

  /* ---------------- Hukuki metin ---------------- */
  if (r.kind === 'legal') {
    const { legal } = r;
    const crumbs = [
      { name: 'Ana Sayfa', path: '/' },
      { name: legal.title, path: `/${legal.slug}` },
    ];
    const { html } = await renderContent(legal.body);
    return (
      <>
        <div className="bg-soft">
          <Container className="py-10 md:py-14">
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-8 text-h1 font-extrabold">{legal.title}</h1>
            <p className="mt-4 text-sm text-muted">
              Son güncelleme: <time dateTime={legal.updated}>{formatDate(legal.updated)}</time>
            </p>
          </Container>
        </div>
        <Container className="py-12 lg:py-16">
          <div className="prose-ocean max-w-(--container-prose)" dangerouslySetInnerHTML={{ __html: html }} />
        </Container>
        <JsonLdScript data={breadcrumbSchema(SITE_URL, crumbs)} />
      </>
    );
  }

  /* ---------------- Lokasyon sayfası ---------------- */
  const { area } = r;
  const packages = await getPackages();
  const path = areaPath(area.slug);
  const crumbs = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Hizmet Bölgeleri', path: '/hizmet-bolgeleri' },
    { name: `${area.name} Ev Boyama`, path },
  ];
  const sections = await Promise.all(area.sections.map(async (s) => ({ heading: s.heading, html: (await renderContent(s.body)).html })));
  const quoteHref = `/teklif-al?hizmet=ev-boyama&ilce=${area.slug}`;

  return (
    <>
      <TrackView event="view_local_service" label={area.name} />
      <PageHero
        crumbs={crumbs}
        eyebrow={area.isHub ? 'Merkezimiz · İstanbul' : 'Hizmet bölgesi · İstanbul'}
        prices={packages}
        title={area.h1 || `${area.name} Ev Boyama`}
        lead={area.lead}
        actions={
          <>
            <ButtonLink href={quoteHref} size="lg">
              {area.name} için teklif al <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            <ButtonLink href="#fiyatlar" variant="outline" size="lg">
              Fiyatları gör
            </ButtonLink>
          </>
        }
      />

      {/* İlçeye özgü içerik */}
      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
          <div className="space-y-14">
            {sections.map((s) => (
              <section key={s.heading} data-reveal>
                <h2 className="text-h3 font-bold">{s.heading}</h2>
                <div className="prose-ocean mt-5" dangerouslySetInnerHTML={{ __html: s.html }} />
              </section>
            ))}
          </div>
          <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
            {area.neighborhoods.length > 0 && (
              <div data-reveal className="rounded-(--radius-xl) border border-line p-7">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
                  <MapPin aria-hidden className="size-5 text-ocean-600" />
                  {area.name} içinde hizmet verdiğimiz yerler
                </h2>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {area.neighborhoods.map((n) => (
                    <li key={n.id} className="rounded-full bg-soft px-3.5 py-1.5 text-sm font-medium text-navy-900">
                      {n.name}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-sm text-muted">Listede olmayan {area.name} mahalleleri için de talep oluşturabilirsiniz.</p>
              </div>
            )}
            <div data-reveal style={idx(1)} className="rounded-(--radius-xl) bg-soft p-7">
              <h2 className="font-display text-lg font-bold text-navy-900">İlgili hizmetler</h2>
              <ul className="mt-4 divide-y divide-line-strong">
                {AREA_SERVICES.map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} className="group flex items-center justify-between py-3 font-medium text-navy-900 hover:text-ocean-700">
                      {s.label}
                      <span className="link-arrow">
                        <ArrowRight aria-hidden className="size-4" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Container>
      </Section>

      <Section tone="soft" id="fiyatlar" labelledBy="fiyat-baslik">
        <Container>
          <SectionHeader
            id="fiyat-baslik"
            eyebrow="Fiyatlar"
            title={`${area.name} ev boyama fiyatları`}
            lead="İlan edilen paket fiyatları hizmet verdiğimiz bütün ilçelerde aynıdır. Nihai teklif dairenizin durumu değerlendirildikten sonra netleşir."
            action={
              <Link href="/boya-fiyatlari" className="link-arrow inline-flex items-center gap-1.5 font-semibold text-navy-900 underline-offset-4 hover:underline">
                Fiyat ayrıntıları <ArrowRight aria-hidden className="size-4" />
              </Link>
            }
          />
          <PriceCards packages={packages} />
        </Container>
      </Section>

      <ProcessSection tone="paper" title={`${area.name}’de ev boyama süreci`} />
      <FaqSection items={area.faqs} title={`${area.name} ev boyama hakkında`} tone="soft" />
      <AreasSection exclude={area.slug} title="Hizmet verdiğimiz diğer ilçeler" lead="Ocean İnşaat’ın ev boyama hizmeti verdiği diğer Anadolu Yakası ilçeleri." />
      <CtaSection
        title={`${area.name}’deki daireniz için teklif alın.`}
        quoteHref={quoteHref}
        whatsappMessage={`Merhaba Ocean İnşaat, ${area.name} bölgesinde ev boyama hizmetiniz hakkında bilgi almak istiyorum.`}
      />

      <JsonLdScript
        data={[
          serviceSchema(SITE_URL, {
            path,
            name: `${area.name} Ev Boyama`,
            description: area.metaDescription || area.lead,
            serviceType: 'Ev boyama ve boya badana',
            areaNames: [area.name],
            packages: packages.map((p) => ({ slug: p.slug, name: p.name, price: p.price, currency: p.currency, validUntil: p.validUntil })),
          }),
          breadcrumbSchema(SITE_URL, crumbs),
        ]}
      />
    </>
  );
}
