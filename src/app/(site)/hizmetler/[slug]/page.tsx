import { ArrowRight, Check } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { CtaSection, FaqSection, PageHero } from '@/components/sections/blocks';
import { getTokenContext, renderContent } from '@/server/content';
import { ServiceCard } from '@/components/sections/cards';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section, SectionHeader } from '@/components/ui/primitives';
import { formatPrice } from '@/lib/format';
import { fillTokens } from '@/lib/tokens';
import { JsonLdScript, pageMetadata, SITE_URL } from '@/seo';
import { breadcrumbSchema, serviceSchema } from '@/seo/schema';
import { getActiveAreas, getPackages, getService, getServiceCategories } from '@/server/data';
import { redirectOrNotFound } from '@/server/redirects';

type Props = { params: Promise<{ slug: string }> };

/** Teklif formundaki hizmet seçenekleriyle eşleşen sayfalar. */
const QUOTE_SERVICE: Record<string, string> = {
  'ic-cephe-boyama': 'ev-boyama',
  'boya-badana': 'boya-badana',
  'ev-tadilati': 'komple-tadilat',
  'ic-mekan-tadilati': 'komple-tadilat',
  'mutfak-tadilati': 'mutfak-tadilati',
  'banyo-tadilati': 'banyo-tadilati',
  'elektrik-tesisati': 'elektrik-tesisati',
  'sihhi-tesisat': 'su-tesisati',
};
const SHOWS_PRICING = ['ic-cephe-boyama', 'boya-badana'];
const LOCAL_CATEGORIES = ['boya-yuzey', 'ic-mekan', 'tesisat', 'zemin'];

export async function generateStaticParams() {
  return (await getServiceCategories()).flatMap((c) => c.services.map((s) => ({ slug: s.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return {};
  return pageMetadata({ path: `/hizmetler/${s.slug}`, title: s.metaTitle || s.title, description: s.metaDescription || s.overview, image: s.image });
}

const idx = (i: number) => ({ '--reveal-index': i }) as CSSProperties;

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((t) => (
        <li key={t} className="flex gap-3">
          <Check aria-hidden className="mt-1 size-4 shrink-0 text-ocean-600" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return redirectOrNotFound(`/hizmetler/${slug}`);

  const [categories, areas, packages, ctx] = await Promise.all([getServiceCategories(), getActiveAreas(), getPackages(), getTokenContext()]);
  const path = `/hizmetler/${s.slug}`;
  const crumbs = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Hizmetler', path: '/hizmetler' },
    { name: s.title, path },
  ];
  const all = categories.flatMap((c) => c.services);
  const relatedSlugs = s.related.filter((r) => r.startsWith('/hizmetler/')).map((r) => r.replace('/hizmetler/', ''));
  const related = [
    ...relatedSlugs.map((r) => all.find((x) => x.slug === r)).filter((x): x is (typeof all)[number] => Boolean(x)),
    ...all.filter((x) => x.categoryId === s.categoryId && x.slug !== s.slug && !relatedSlugs.includes(x.slug)),
  ].slice(0, 4);
  const quoteHref = QUOTE_SERVICE[s.slug] ? `/teklif-al?hizmet=${QUOTE_SERVICE[s.slug]}` : '/teklif-al';
  const isLocal = LOCAL_CATEGORIES.includes(s.category.slug);
  const body = s.body ? (await renderContent(s.body)).html : '';
  const intro = fillTokens(s.intro, ctx);

  return (
    <>
      <PageHero
        crumbs={crumbs}
        eyebrow={s.category.name}
        title={s.title}
        lead={s.tagline}
        image={s.image ? { src: s.image, alt: s.imageAlt ?? s.title } : null}
        actions={
          <>
            <ButtonLink href={quoteHref} size="lg">
              Bu hizmet için teklif al <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            <ButtonLink href="/iletisim" variant="outline" size="lg">
              Bize ulaşın
            </ButtonLink>
          </>
        }
      />

      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <div data-reveal>
            <p className="eyebrow mb-4">Genel bakış</p>
            <p className="font-display text-2xl font-semibold leading-snug tracking-[-0.015em] text-navy-900 md:text-3xl">{s.overview}</p>
            <div className="prose-ocean mt-8">
              {intro.split(/\n{2,}/).map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
            {body && <div className="prose-ocean mt-4" dangerouslySetInnerHTML={{ __html: body }} />}
          </div>

          <aside data-reveal style={idx(1)} className="space-y-8 lg:sticky lg:top-28 lg:self-start">
            {s.scope.length > 0 && (
              <div className="rounded-(--radius-xl) border border-line p-7">
                <h2 className="font-display text-lg font-bold text-navy-900">Hizmet kapsamı</h2>
                <div className="mt-5 text-[0.9375rem]">
                  <BulletList items={s.scope} />
                </div>
                <p className="mt-5 text-sm text-muted">Kapsam, ihtiyacınız değerlendirildikten sonra teklifinizde netleştirilir.</p>
              </div>
            )}
            {SHOWS_PRICING.includes(s.slug) && packages.length > 0 && (
              <div className="rounded-(--radius-xl) bg-soft p-7">
                <h2 className="font-display text-lg font-bold text-navy-900">Daire boyama paket fiyatları</h2>
                <dl className="mt-4 divide-y divide-line-strong">
                  {packages.map((p) => (
                    <div key={p.slug} className="flex items-baseline justify-between py-3">
                      <dt>
                        <Link href={`/ev-boyama/${p.slug}`} className="font-medium text-navy-900 underline-offset-4 hover:underline">
                          {p.roomType} daire
                        </Link>
                      </dt>
                      <dd className="font-display font-bold text-navy-900">{formatPrice(p.price, p.currency)}</dd>
                    </div>
                  ))}
                </dl>
                <Link href="/boya-fiyatlari" className="link-arrow mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900">
                  Fiyat ayrıntıları <ArrowRight aria-hidden className="size-4" />
                </Link>
              </div>
            )}
          </aside>
        </Container>
      </Section>

      {s.steps.length > 0 && (
        <Section tone="soft" labelledBy="asamalar-baslik">
          <Container>
            <SectionHeader id="asamalar-baslik" eyebrow="Süreç" title="Uygulama aşamaları" />
            <ol className="grid gap-x-10 border-t border-line-strong sm:grid-cols-2 lg:grid-cols-3">
              {s.steps.map((st, i) => (
                <li key={st.title} data-reveal style={idx(i % 3)} className="border-b border-line-strong py-7">
                  <span className="font-display text-sm font-bold text-ocean-600">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-2 font-display text-xl font-bold text-navy-900">{st.title}</h3>
                  <p className="mt-2 text-muted">{st.desc}</p>
                </li>
              ))}
            </ol>
          </Container>
        </Section>
      )}

      {(s.materials.length > 0 || s.benefits.length > 0 || s.projectTypes.length > 0) && (
        <Section>
          <Container className="grid gap-12 md:grid-cols-3">
            {(
              [
                ['Malzeme ve yöntemler', s.materials],
                ['Sağladığı faydalar', s.benefits],
                ['Uygun olduğu yerler', s.projectTypes],
              ] as const
            )
              .filter(([, items]) => items.length > 0)
              .map(([title, items], i) => (
                <div key={title} data-reveal style={idx(i)}>
                  <h2 className="border-b border-navy-900 pb-4 font-display text-xl font-bold text-navy-900">{title}</h2>
                  <div className="mt-6 text-muted">
                    <BulletList items={[...items]} />
                  </div>
                </div>
              ))}
          </Container>
        </Section>
      )}

      <FaqSection items={s.faqs} title={`${s.title} hakkında sık sorulanlar`} tone="soft" />

      {related.length > 0 && (
        <Section labelledBy="ilgili-baslik">
          <Container>
            <SectionHeader id="ilgili-baslik" eyebrow="İlgili hizmetler" title="Birlikte değerlendirebilecekleriniz" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r, i) => (
                <ServiceCard key={r.slug} service={r} index={i} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CtaSection title={`${s.title} için teklif alın.`} text="İhtiyacınızı ve konumunuzu paylaşın; kapsamı değerlendirip size dönelim." quoteHref={quoteHref} whatsappMessage={`Merhaba Ocean İnşaat, ${s.title} hizmetiniz hakkında bilgi almak istiyorum.`} />

      <JsonLdScript
        data={[
          serviceSchema(SITE_URL, {
            path,
            name: s.title,
            description: s.metaDescription || s.overview,
            // Ev içi hizmetlerde yalnızca aktif hizmet bölgeleri bildirilir.
            areaNames: isLocal ? areas.map((a) => a.name) : undefined,
          }),
          breadcrumbSchema(SITE_URL, crumbs),
        ]}
      />
    </>
  );
}
