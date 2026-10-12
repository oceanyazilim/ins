import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PricingSelector } from '@/components/interactive/pricing-selector';
import { CtaSection, FaqSection, PageHero } from '@/components/sections/blocks';
import { ScopeList } from '@/components/sections/cards';
import { TrackView } from '@/components/site/site-client';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section, SectionHeader } from '@/components/ui/primitives';
import { formatDate, formatPrice } from '@/lib/format';
import { joinTr } from '@/lib/tokens';
import { JsonLdScript, pageMetadata, SITE_URL } from '@/seo';
import { breadcrumbSchema, serviceSchema } from '@/seo/schema';
import { getActiveAreas, getPackages } from '@/server/data';

const PATH = '/boya-fiyatlari';
const crumbs = [
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Boya Fiyatları', path: PATH },
];

export async function generateMetadata(): Promise<Metadata> {
  const types = joinTr((await getPackages()).map((p) => p.roomType));
  return pageMetadata({
    path: PATH,
    title: `Ev Boyama Fiyatları | ${types} Daire`,
    description: `${types} daireler için Ocean İnşaat ev boyama fiyatları. İlan edilen paket fiyatlarını, fiyatı etkileyen etkenleri ve teklif sürecini inceleyin.`,
  });
}

const idx = (i: number) => ({ '--reveal-index': i }) as CSSProperties;

const FACTORS = [
  {
    title: 'Fiyatlar nasıl değerlendirilir?',
    body: 'İlan edilen tutarlar daire tipine göre belirlenmiş paket fiyatlarıdır. Talebiniz alındıktan sonra dairenizin durumu ve istekleriniz gözden geçirilir; kapsam netleştiğinde size özel teklif hazırlanır. Paket fiyatı ile onaylanan teklif bu nedenle iki ayrı şeydir: ilki ilan edilen başlangıç fiyatı, ikincisi sizin daireniz için yazılı olarak verilen tutardır.',
  },
  {
    title: 'Dairenin durumu neden önemlidir?',
    body: 'Yeni ve düzgün yüzeyli bir daire ile yıllardır boyanmamış, katmanları kabarmış bir daire aynı emeği gerektirmez. Çatlaklar, nem izleri, sigara ve is kaynaklı sararma ya da önceki boyanın türü, yapılacak hazırlığı belirler.',
  },
  {
    title: 'Boyanacak alan nasıl belirlenir?',
    body: 'Paketler daire tipine göre tanımlanmıştır. Aynı tipteki iki dairenin duvar alanı; tavan yüksekliği, koridor uzunluğu, balkon ve teras duvarları ya da galeri boşluğu gibi özelliklere göre farklılaşabilir. Standart dışı özellikleri talebinizde belirtmeniz teklifin isabetli olmasını sağlar.',
  },
  {
    title: 'İlave duvar onarımları',
    body: 'Derin çatlaklar, dökülen sıva, geniş alanlı macun ve zımpara işleri ya da nem kaynaklı bozulmalar boyadan önce onarım gerektirir. Bu işler dairenin durumuna bağlı olduğu için teklifte ayrıca gösterilir.',
  },
  {
    title: 'Boya ve renk tercihleri',
    body: 'Mat, ipek mat ya da silinebilir boya gibi tercihler ile koyu renkten açık renge geçiş gibi durumlar uygulamayı etkiler. Kullanılacak malzeme ve renkler teklif aşamasında sizinle birlikte belirlenir.',
  },
  {
    title: 'Eşyalı ev uygulamaları',
    body: 'Eşyalı evlerde eşyaların korunması, yer değiştirilmesi ve odaların sırayla boyanması gerekir. Eşya yoğunluğu işin temposunu etkilediği için değerlendirmede dikkate alınır.',
  },
];

export default async function BoyaFiyatlariPage() {
  const [packages, areas] = await Promise.all([getPackages(), getActiveAreas()]);
  const validUntil = packages.map((p) => p.validUntil).filter(Boolean)[0];
  const updated = packages.reduce((d, p) => (p.updatedAt > d ? p.updatedAt : d), new Date(0));
  const vatNote = packages[0]?.vatNote;

  return (
    <>
      <TrackView event="view_pricing" />
      <PageHero
        crumbs={crumbs}
        eyebrow="Şeffaf fiyat"
        prices={packages}
        title="Ev Boyama Fiyatları"
        lead={`${joinTr(packages.map((p) => p.roomType))} daireler için Ocean İnşaat boya hizmeti fiyatlarını inceleyin.`}
        image={{ src: '/images/site/yemek-kosesi-beyaz-duvar.jpg', alt: 'Beyaz boyalı duvarları olan aydınlık bir dairede yemek köşesi' }}
        actions={
          <ButtonLink href="/teklif-al?hizmet=ev-boyama" size="lg">
            Teklif Al <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        }
      />

      {/* Fiyat tablosu: kartlardan farklı, defter görünümünde */}
      <Section labelledBy="tablo-baslik">
        <Container>
          <h2 id="tablo-baslik" className="sr-only">
            Fiyat tablosu
          </h2>
          <div data-reveal className="overflow-hidden rounded-(--radius-xl) border border-line">
            <table className="w-full text-left" data-testid="price-table">
              <caption className="sr-only">Ocean İnşaat ev boyama paket fiyatları</caption>
              <thead className="bg-soft font-display text-sm uppercase tracking-[0.1em] text-muted">
                <tr>
                  <th scope="col" className="px-5 py-4 font-bold md:px-8">
                    Hizmet
                  </th>
                  <th scope="col" className="px-5 py-4 text-right font-bold md:px-8">
                    İlan edilen fiyat
                  </th>
                  <th scope="col" className="hidden px-8 py-4 md:table-cell">
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {packages.map((p) => (
                  <tr key={p.slug} className="border-t border-line">
                    <th scope="row" className="px-5 py-6 md:px-8">
                      <Link href={`/ev-boyama/${p.slug}`} className="font-display text-xl font-bold text-navy-900 underline-offset-4 hover:underline md:text-2xl">
                        {p.roomType} Daire Boyama
                      </Link>
                      <span className="mt-1 block max-w-md text-sm font-normal text-muted">{p.summary}</span>
                    </th>
                    <td className="whitespace-nowrap px-5 py-6 text-right font-display text-2xl font-extrabold tracking-[-0.03em] text-navy-900 md:px-8 md:text-4xl" data-testid={`table-price-${p.roomType}`}>
                      {formatPrice(p.price, p.currency)}
                    </td>
                    <td className="hidden px-8 py-6 text-right md:table-cell">
                      <ButtonLink href={`/teklif-al?paket=${p.slug}`} variant="outline" size="sm" data-event="select_painting_package" data-event-label={p.roomType}>
                        Teklif Al
                      </ButtonLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-sm text-muted">
            {[
              'Para birimi: Türk lirası (TRY).',
              vatNote,
              validUntil ? `Fiyatlar ${formatDate(validUntil)} tarihine kadar geçerlidir.` : '',
              `Son güncelleme: ${formatDate(updated)}.`,
              '4+1 ve diğer daire tipleri için fiyat, kapsam değerlendirildikten sonra verilir.',
            ]
              .filter(Boolean)
              .join(' ')}
          </p>
        </Container>
      </Section>

      {/* Fiyatı etkileyen etkenler */}
      <Section tone="soft" labelledBy="etkenler-baslik">
        <Container>
          <SectionHeader id="etkenler-baslik" eyebrow="Fiyatın arkasındaki mantık" title="Bir ev boyama teklifini neler belirler?" />
          <div className="grid gap-x-16 md:grid-cols-2">
            {FACTORS.map((f, i) => (
              <div key={f.title} data-reveal style={idx(i % 2)} className="border-t border-line-strong py-8">
                <h3 className="font-display text-xl font-bold text-navy-900">{f.title}</h3>
                <p className="mt-3 text-muted">{f.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-muted">
            Konunun ayrıntıları için{' '}
            <Link href="/blog/ev-boyama-fiyatlari-nasil-belirlenir" className="text-link">
              ev boyama fiyatları nasıl belirlenir?
            </Link>{' '}
            yazımızı okuyabilirsiniz.
          </p>
        </Container>
      </Section>

      {/* Kapsam */}
      <Section labelledBy="kapsam-baslik">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div data-reveal>
            <p className="eyebrow mb-4">Kapsam</p>
            <h2 id="kapsam-baslik" className="text-h2 font-bold">
              Fiyata neler dahil?
            </h2>
            <p className="mt-5 text-muted">
              Aşağıdaki başlıklar her daire için ayrı değerlendirilir. Teklifiniz, hangi kalemlerin dahil olduğunu açıkça gösterecek biçimde yazılı olarak iletilir.
            </p>
          </div>
          <div data-reveal style={idx(1)}>
            <ScopeList items={packages[0]?.scopeItems ?? []} note={packages[0]?.scopeNote} />
          </div>
        </Container>
      </Section>

      {/* Teklif süreci + seçici */}
      <Section tone="soft" labelledBy="teklif-baslik">
        <Container className="grid items-start gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
          <div data-reveal>
            <p className="eyebrow mb-4">Teklif süreci</p>
            <h2 id="teklif-baslik" className="text-h2 font-bold">
              Paketten teklife üç adım
            </h2>
            <ol className="mt-8 space-y-6">
              {[
                ['Paketinizi seçin', 'Daire tipinizi işaretleyip teklif formuna geçin.'],
                ['Daireyi tanıtın', 'Konum, dairenin durumu ve varsa fotoğrafları ekleyin.'],
                ['Teklifinizi alın', 'Kapsam netleştirilir ve size özel teklif iletilir.'],
              ].map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[auto_1fr] gap-5">
                  <span className="grid size-10 place-items-center rounded-full border border-navy-900 font-display text-sm font-bold text-navy-900">{i + 1}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-navy-900">{t}</h3>
                    <p className="mt-1 text-muted">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div data-reveal style={idx(1)} id="teklif">
            <PricingSelector packages={packages.map((p) => ({ slug: p.slug, roomType: p.roomType, name: p.name, price: p.price, currency: p.currency, summary: p.summary }))} />
          </div>
        </Container>
      </Section>

      <FaqSection scope="boya-fiyatlari" title="Fiyatlar hakkında sık sorulanlar" />
      <CtaSection quoteHref="/teklif-al?hizmet=ev-boyama" />

      <JsonLdScript
        data={[
          serviceSchema(SITE_URL, {
            path: PATH,
            name: 'Ev Boyama',
            description: 'Daire tipine göre ilan edilen Ocean İnşaat ev boyama paket fiyatları.',
            areaNames: areas.map((a) => a.name),
            packages: packages.map((p) => ({ slug: p.slug, name: p.name, price: p.price, currency: p.currency, validUntil: p.validUntil })),
          }),
          breadcrumbSchema(SITE_URL, crumbs),
        ]}
      />
    </>
  );
}
