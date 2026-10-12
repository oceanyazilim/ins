import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { CtaSection, PageHero } from '@/components/sections/blocks';
import { ServiceCard } from '@/components/sections/cards';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section } from '@/components/ui/primitives';
import { formatPrice } from '@/lib/format';
import { JsonLdScript, pageMetadata, SITE_URL } from '@/seo';
import { breadcrumbSchema } from '@/seo/schema';
import { getPackages, getServiceCategories } from '@/server/data';

const PATH = '/hizmetler';
const crumbs = [
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Hizmetler', path: PATH },
];

export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata({
    path: PATH,
    title: 'Hizmetlerimiz: Boya, Tadilat ve İnşaat',
    description: 'Ocean İnşaat hizmetleri: ev boyama, boya badana, alçı sıva, mutfak ve banyo tadilatı, tesisat, dış cephe, yalıtım ve anahtar teslim inşaat.',
  });

export default async function HizmetlerPage() {
  const [categories, packages] = await Promise.all([getServiceCategories(), getPackages()]);
  const visible = categories.filter((c) => c.services.length > 0);
  const minPrice = packages.length ? Math.min(...packages.map((p) => p.price)) : null;

  return (
    <>
      <PageHero
        crumbs={crumbs}
        eyebrow="Hizmetlerimiz"
        title="Boyadan anahtar teslime kadar"
        lead="Evinizin duvarlarından bir yapının tamamına uzanan hizmetlerimizi kategorilere göre inceleyin."
        actions={
          <ButtonLink href="/teklif-al" size="lg">
            Teklif Al <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        }
      />

      {/* Kategori atlama bağlantıları */}
      <nav aria-label="Hizmet kategorileri" className="border-b border-line bg-white">
        <Container>
          <ul className="flex gap-2 overflow-x-auto py-4 text-sm font-semibold">
            {visible.map((c) => (
              <li key={c.slug} className="shrink-0">
                <a href={`#${c.slug}`} className="block rounded-full border border-line px-4 py-2 text-navy-900 transition-colors hover:border-navy-900">
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      {/* Ana hizmet vurgusu */}
      <Section className="pb-0">
        <Container>
          <Link href="/ev-boyama" data-reveal className="group grid items-center gap-6 rounded-(--radius-xl) bg-navy-900 p-8 text-white md:grid-cols-[1fr_auto] md:p-12">
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-[#8cc4f0]">Ana hizmetimiz</p>
              <h2 className="mt-2 font-display text-4xl font-extrabold tracking-[-0.03em] text-white md:text-5xl">Ev Boyama</h2>
              <p className="mt-3 max-w-xl text-white/80">
                1+1, 2+1 ve 3+1 daireler için ilan edilmiş paket fiyatları{minPrice ? ` (${formatPrice(minPrice)}’den başlayan)` : ''} ve planlı uygulama.
              </p>
            </div>
            <span className="link-arrow inline-flex items-center gap-2 font-display font-semibold">
              Hizmeti ve fiyatları incele <ArrowRight aria-hidden className="size-4" />
            </span>
          </Link>
        </Container>
      </Section>

      {visible.map((c, ci) => {
        const withImage = c.services.filter((s) => s.image);
        const plain = c.services.filter((s) => !s.image);
        return (
          <Section key={c.slug} id={c.slug} tone={ci % 2 ? 'soft' : 'paper'} labelledBy={`${c.slug}-baslik`}>
            <Container>
              <div data-reveal className="mb-10 grid gap-4 md:grid-cols-[1fr_1.4fr] md:items-end">
                <h2 id={`${c.slug}-baslik`} className="text-h2 font-bold">
                  {c.name}
                </h2>
                <p className="text-lead text-muted">{c.description}</p>
              </div>
              {withImage.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {withImage.map((s, i) => (
                    <ServiceCard key={s.slug} service={s} index={i % 4} />
                  ))}
                </div>
              )}
              {plain.length > 0 && (
                <ul className={`grid gap-x-12 md:grid-cols-2 ${withImage.length ? 'mt-10' : ''} border-t border-line-strong`}>
                  {plain.map((s, i) => (
                    <li key={s.slug} data-reveal style={{ '--reveal-index': i % 2 } as CSSProperties}>
                      <Link href={`/hizmetler/${s.slug}`} className="group flex items-start justify-between gap-6 border-b border-line-strong py-6">
                        <span>
                          <span className="font-display text-xl font-bold text-navy-900 transition-colors group-hover:text-ocean-700">{s.title}</span>
                          <span className="mt-1 line-clamp-2 block text-[0.9375rem] text-muted">{s.overview}</span>
                        </span>
                        <span className="link-arrow mt-1.5 shrink-0 text-navy-900">
                          <ArrowRight aria-hidden className="size-5" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Container>
          </Section>
        );
      })}

      <CtaSection title="İhtiyacınız olan hizmet için teklif alın." text="Hizmeti ve konumunuzu paylaşın; kapsamı değerlendirip size dönelim." />
      <JsonLdScript data={breadcrumbSchema(SITE_URL, crumbs)} />
    </>
  );
}
