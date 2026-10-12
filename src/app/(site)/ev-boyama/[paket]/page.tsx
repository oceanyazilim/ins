import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import { AreasSection, CtaSection, FaqSection, PageHero } from '@/components/sections/blocks';
import { renderContent } from '@/server/content';
import { ScopeList } from '@/components/sections/cards';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section } from '@/components/ui/primitives';
import { formatDate, formatPrice } from '@/lib/format';
import { JsonLdScript, pageMetadata, SITE_URL } from '@/seo';
import { breadcrumbSchema, serviceSchema } from '@/seo/schema';
import { getActiveAreas, getPackageBySlug, getPackages } from '@/server/data';

type Props = { params: Promise<{ paket: string }> };

export async function generateStaticParams() {
  return (await getPackages()).map((p) => ({ paket: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { paket } = await params;
  const p = await getPackageBySlug(paket);
  if (!p) return {};
  return pageMetadata({ path: `/ev-boyama/${p.slug}`, title: p.metaTitle || p.name, description: p.metaDescription || p.summary });
}

const idx = (i: number) => ({ '--reveal-index': i }) as CSSProperties;

export default async function PackagePage({ params }: Props) {
  const { paket } = await params;
  const [p, all, areas] = await Promise.all([getPackageBySlug(paket), getPackages(), getActiveAreas()]);
  if (!p) notFound();
  const path = `/ev-boyama/${p.slug}`;
  const crumbs = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Ev Boyama', path: '/ev-boyama' },
    { name: p.name, path },
  ];
  const others = all.filter((x) => x.slug !== p.slug);
  const { html } = await renderContent(p.body);

  return (
    <>
      <PageHero
        crumbs={crumbs}
        eyebrow={`${p.roomType} daire boyama paketi`}
        title={p.name}
        lead={p.description}
        actions={
          <>
            <ButtonLink href={`/teklif-al?paket=${p.slug}`} size="lg" data-event="select_painting_package" data-event-label={p.roomType}>
              Bu paket için teklif al <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            <ButtonLink href="/boya-fiyatlari" variant="outline" size="lg">
              Tüm fiyatlar
            </ButtonLink>
          </>
        }
      />

      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <div>
            <div data-reveal className="prose-ocean" dangerouslySetInnerHTML={{ __html: html }} />

            <div data-reveal className="mt-14">
              <h2 className="text-h3 font-bold">Hizmet kapsamı</h2>
              <p className="mt-3 text-muted">Bu başlıklar daireniz değerlendirildikten sonra teklifinizde açıkça belirtilir.</p>
              <div className="mt-6">
                <ScopeList items={p.scopeItems} note={p.scopeNote} />
              </div>
            </div>

            <div data-reveal className="mt-14">
              <h2 className="text-h3 font-bold">Uygulama öncesi değerlendirme</h2>
              <div className="prose-ocean mt-4">
                <p>
                  Teklif talebiniz alındıktan sonra dairenizin durumu; paylaştığınız bilgiler, fotoğraflar ve gerekli görülürse yerinde inceleme ile
                  değerlendirilir. Bu aşamada yüzey onarımı ihtiyacı, renk tercihi, eşya durumu ve uygun tarih birlikte netleştirilir. Hazırlanan teklif, kapsamı
                  ve tutarı açıkça gösterir; siz onaylamadan uygulama başlamaz.
                </p>
              </div>
            </div>
          </div>

          {/* Yapışkan fiyat özeti */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div data-reveal style={idx(1)} className="rounded-(--radius-xl) border border-line bg-white p-7 shadow-(--shadow-card) md:p-9">
              <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-ocean-600">İlan edilen fiyat</p>
              <p className="mt-2 font-display text-5xl font-extrabold tracking-[-0.035em] text-navy-900" data-testid="package-price">
                {formatPrice(p.price, p.currency)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {[p.name, p.vatNote, p.validUntil ? `${formatDate(p.validUntil)} tarihine kadar geçerli` : ''].filter(Boolean).join(' · ')}
              </p>
              <p className="mt-5 text-[0.9375rem] text-muted">{p.scopeNote}</p>
              <ButtonLink href={`/teklif-al?paket=${p.slug}`} size="lg" className="mt-7 w-full">
                Teklif Al
              </ButtonLink>
              <p className="mt-4 text-center text-sm text-muted">
                Fiyatların tamamı için{' '}
                <Link href="/boya-fiyatlari" className="text-link">
                  boya fiyatları
                </Link>
              </p>
            </div>
          </aside>
        </Container>
      </Section>

      <FaqSection items={p.faqs} title={`${p.roomType} daire boyama hakkında`} tone="soft" />

      {/* İlgili paketler */}
      <Section labelledBy="diger-paketler">
        <Container>
          <h2 id="diger-paketler" data-reveal className="text-h2 font-bold">
            Diğer daire tipleri
          </h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-2">
            {others.map((o, i) => (
              <li key={o.slug} data-reveal style={idx(i)}>
                <Link href={`/ev-boyama/${o.slug}`} className="group flex items-center justify-between gap-6 rounded-(--radius-lg) border border-line p-7 transition-[border-color,box-shadow] duration-(--duration-card) hover:border-navy-900/30 hover:shadow-(--shadow-card)">
                  <div>
                    <p className="font-display text-3xl font-extrabold tracking-[-0.03em] text-navy-900">{o.roomType}</p>
                    <p className="mt-1 text-muted">{o.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold text-navy-900">{formatPrice(o.price, o.currency)}</p>
                    <span className="link-arrow mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900">
                      İncele <ArrowRight aria-hidden className="size-4" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <AreasSection tone="soft" title={`${p.roomType} daire boyama yaptığımız ilçeler`} />
      <CtaSection quoteHref={`/teklif-al?paket=${p.slug}`} whatsappMessage={`Merhaba, ${p.roomType} ev boyama paketi için teklif almak istiyorum.`} />

      <JsonLdScript
        data={[
          serviceSchema(SITE_URL, {
            path,
            name: p.name,
            description: p.metaDescription || p.summary,
            serviceType: 'Ev boyama',
            areaNames: areas.map((a) => a.name),
            packages: [{ slug: p.slug, name: p.name, price: p.price, currency: p.currency, validUntil: p.validUntil }],
          }),
          breadcrumbSchema(SITE_URL, crumbs),
        ]}
      />
    </>
  );
}
