import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { CtaSection, PageHero } from '@/components/sections/blocks';
import { ButtonLink } from '@/components/ui/button';
import { Badge, Container, Section } from '@/components/ui/primitives';
import { joinTr } from '@/lib/tokens';
import { JsonLdScript, pageMetadata, SITE_URL } from '@/seo';
import { breadcrumbSchema } from '@/seo/schema';
import { areaPath, getActiveAreas } from '@/server/data';

const PATH = '/hizmet-bolgeleri';
const crumbs = [
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Hizmet Bölgeleri', path: PATH },
];

export async function generateMetadata(): Promise<Metadata> {
  const names = joinTr((await getActiveAreas()).map((a) => a.name));
  return pageMetadata({ path: PATH, title: 'Hizmet Bölgeleri', description: `Ocean İnşaat’ın ev boyama ve boya badana hizmeti verdiği ilçeler: ${names}. Merkezimiz Sancaktepe’dedir.` });
}

export default async function HizmetBolgeleriPage() {
  const areas = await getActiveAreas();
  return (
    <>
      <PageHero
        crumbs={crumbs}
        eyebrow="Hizmet bölgeleri"
        title="Nerede hizmet veriyoruz?"
        lead={`Merkezimiz Sancaktepe’dedir. Ev boyama ve boya badana hizmetimizi şu anda ${joinTr(areas.map((a) => a.name))} ilçelerinde sunuyoruz.`}
        actions={
          <ButtonLink href="/teklif-al" size="lg">
            Teklif Al <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        }
      />
      <Section>
        <Container>
          <ul className="border-t border-line">
            {areas.map((a, i) => (
              <li key={a.slug} data-reveal style={{ '--reveal-index': i % 3 } as CSSProperties} className="grid gap-6 border-b border-line py-10 md:grid-cols-[1fr_1.6fr_auto] md:items-start md:gap-12">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-navy-900">{a.name}</h2>
                    {a.isHub && <Badge>Merkez</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted">İstanbul · Anadolu Yakası</p>
                </div>
                <div>
                  <p className="text-muted">{a.summary}</p>
                  {a.neighborhoods.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {a.neighborhoods.map((n) => (
                        <li key={n.id} className="rounded-full bg-soft px-3 py-1 text-sm font-medium text-navy-900">
                          {n.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {a.pagePublished && (
                    <Link href={areaPath(a.slug)} className="link-arrow inline-flex items-center gap-1.5 font-semibold text-navy-900 underline-offset-4 hover:underline">
                      {a.name} ev boyama <ArrowRight aria-hidden className="size-4" />
                    </Link>
                  )}
                  <Link href={`/teklif-al?hizmet=ev-boyama&ilce=${a.slug}`} className="text-sm font-semibold text-ocean-700 underline underline-offset-4">
                    Bu ilçe için teklif al
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <p data-reveal className="mt-10 max-w-3xl text-muted">
            Bu listede yer almayan bir ilçedeyseniz teklif formunda “Listede yok” seçeneğiyle talebinizi iletebilirsiniz; hizmet verip veremeyeceğimizi size
            bildiririz. Kurumsal inşaat ve taahhüt projeleri için hizmet bölgesi proje bazında değerlendirilir; ayrıntılar için{' '}
            <Link href="/kurumsal" className="text-link">
              kurumsal
            </Link>{' '}
            sayfasına bakabilirsiniz.
          </p>
        </Container>
      </Section>
      <CtaSection />
      <JsonLdScript data={breadcrumbSchema(SITE_URL, crumbs)} />
    </>
  );
}
