import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { BeforeAfter } from '@/components/interactive/before-after';
import { AreasSection, CtaSection, FaqSection, PageHero, ProcessSection } from '@/components/sections/blocks';
import { BlogCard, PriceCards, ProjectCard, ScopeList } from '@/components/sections/cards';
import { TrackView } from '@/components/site/site-client';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section, SectionHeader } from '@/components/ui/primitives';
import { formatPrice } from '@/lib/format';
import { JsonLdScript, pageMetadata, SITE_URL } from '@/seo';
import { breadcrumbSchema, serviceSchema } from '@/seo/schema';
import { getActiveAreas, getComparisons, getPackages, getPostsByCategories, getProjects } from '@/server/data';

const PATH = '/ev-boyama';
const DESCRIPTION =
  'Ocean İnşaat ev boyama hizmeti: 1+1, 2+1 ve 3+1 daireler için paket fiyatları, yüzey hazırlığı, uygulama süreci ve hizmet bölgeleri. Daireniz için teklif isteyin.';
const crumbs = [
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Ev Boyama', path: PATH },
];

export const generateMetadata = (): Promise<Metadata> => pageMetadata({ path: PATH, title: 'Ev Boyama Hizmetleri', description: DESCRIPTION });

const idx = (i: number) => ({ '--reveal-index': i }) as CSSProperties;

const PREP = [
  { title: 'Yüzey kontrolü', text: 'Duvar ve tavanlar çatlak, kabarma, nem izi ve eski boya katmanlarının durumu açısından gözden geçirilir.' },
  { title: 'Koruma', text: 'Zemin, doğrama, priz ve anahtarlar ile odada kalan eşyalar örtülerek korunur.' },
  { title: 'Onarım', text: 'Gerekli görülen yerlerde delik ve çatlaklar doldurulur, kabaran bölgeler temizlenir.' },
  { title: 'Astar', text: 'Yüzeyin emiciliğine ve yapılan onarımlara göre astar ihtiyacı belirlenir.' },
];

const EXTRAS = [
  { label: 'Duvar onarımı ve yüzey hazırlığı', href: '/hizmetler/duvar-onarimi' },
  { label: 'Alçı ve sıva uygulamaları', href: '/hizmetler/alci-siva' },
  { label: 'Dekoratif boya', href: '/hizmetler/dekoratif-boya' },
  { label: 'Alçıpan ve asma tavan', href: '/hizmetler/alcipan-asma-tavan' },
  { label: 'Elektrik tesisatı (priz ve anahtar yenileme)', href: '/hizmetler/elektrik-tesisati' },
  { label: 'Komple ev tadilatı', href: '/hizmetler/ev-tadilati' },
];

export default async function EvBoyamaPage() {
  const [packages, areas, projects, comparisons, posts] = await Promise.all([
    getPackages(),
    getActiveAreas(),
    getProjects(),
    getComparisons(),
    getPostsByCategories(['ev-boyama', 'boya-badana', 'ic-cephe', 'renk-rehberi'], 3),
  ]);
  const paintProjects = projects.filter((p) => p.kind === 'boya').slice(0, 3);
  const paintComparisons = comparisons.filter((c) => c.kind === 'boya');
  const scopeItems = packages[0]?.scopeItems ?? [];

  return (
    <>
      <TrackView event="view_painting_service" />
      <PageHero
        crumbs={crumbs}
        eyebrow="Ana hizmetimiz"
        prices={packages}
        title="Ev Boyama Hizmetleri"
        lead="Daire tipinize göre ilan edilmiş paket fiyatları, yüzeyin durumuna göre belirlenen hazırlık ve planlı uygulama. Sancaktepe merkezli ekibimizle evinizin duvarlarını yeniliyoruz."
        image={{ src: '/images/site/salon-acik-renk-koltuk.jpg', alt: 'Açık renk boyanmış duvarları olan ferah bir salon' }}
        actions={
          <>
            <ButtonLink href="/teklif-al?hizmet=ev-boyama" size="lg">
              Teklif Al <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            <ButtonLink href="#fiyatlar" variant="outline" size="lg">
              Fiyatları Gör
            </ButtonLink>
          </>
        }
      />

      {/* Hizmet açıklaması */}
      <Section labelledBy="hizmet-baslik">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <h2 id="hizmet-baslik" data-reveal className="text-h2 font-bold">
            Ev boyama hizmetimiz neyi kapsar?
          </h2>
          <div data-reveal style={idx(1)} className="prose-ocean">
            <p>
              Ev boyama; bir dairenin duvar ve tavan yüzeylerinin hazırlanıp boyanmasını kapsayan, evin görünümünü en kısa yoldan yenileyen iştir. Ocean İnşaat
              bu hizmeti 1+1, 2+1 ve 3+1 daireler için ilan edilmiş paket fiyatlarıyla sunar; daha büyük ya da farklı planlı konutlar için kapsam
              değerlendirilerek özel teklif hazırlanır.
            </p>
            <p>
              Her daire aynı değildir: yeni teslim edilmiş bir evde iş çoğu zaman renk değişiminden ibarettir, yıllardır boyanmamış bir dairede ise yüzey onarımı
              öne çıkar. Bu nedenle paket fiyatını bir başlangıç noktası olarak görün. Hangi işlerin teklifinize dahil olduğu, dairenizin durumu
              değerlendirildikten sonra yazılı olarak netleştirilir.
            </p>
            <p>
              Aynı hizmete farklı açılardan bakmak isterseniz <Link href="/hizmetler/ic-cephe-boyama">iç cephe boyama</Link> sayfasında yüzey ve malzeme
              konularını, <Link href="/hizmetler/boya-badana">boya badana</Link> sayfasında tavan badanası ve kısmi boyama taleplerini ayrıntılı bulabilirsiniz.
            </p>
          </div>
        </Container>
      </Section>

      {/* Fiyat kartları */}
      <Section tone="soft" id="fiyatlar" labelledBy="fiyat-baslik">
        <Container>
          <SectionHeader
            id="fiyat-baslik"
            eyebrow="Paketler"
            title="Daire tipine göre ev boyama fiyatları"
            lead="İlan edilen paket fiyatları hizmet verdiğimiz bütün ilçelerde aynıdır."
            action={
              <Link href="/boya-fiyatlari" className="link-arrow inline-flex items-center gap-1.5 font-semibold text-navy-900 underline-offset-4 hover:underline">
                Fiyatlar hakkında ayrıntı <ArrowRight aria-hidden className="size-4" />
              </Link>
            }
          />
          <PriceCards packages={packages} />
        </Container>
      </Section>

      {/* Daire tipleri */}
      <Section labelledBy="daire-tipleri-baslik">
        <Container>
          <SectionHeader id="daire-tipleri-baslik" eyebrow="Daire tipleri" title="Her daire tipinin ihtiyacı farklıdır" />
          <ul className="border-t border-line">
            {packages.map((p, i) => (
              <li key={p.slug} data-reveal style={idx(i)}>
                <Link href={`/ev-boyama/${p.slug}`} className="group grid items-center gap-4 border-b border-line py-7 transition-colors hover:bg-soft md:grid-cols-[8rem_1fr_auto_auto] md:gap-10 md:px-4">
                  <span className="font-display text-5xl font-extrabold tracking-[-0.04em] text-navy-900">{p.roomType}</span>
                  <span className="text-muted">{p.summary}</span>
                  <span className="font-display text-xl font-bold text-navy-900">{formatPrice(p.price, p.currency)}</span>
                  <span className="link-arrow inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900">
                    Paketi incele <ArrowRight aria-hidden className="size-4" />
                  </span>
                </Link>
              </li>
            ))}
            <li data-reveal style={idx(packages.length)} className="grid items-center gap-4 border-b border-line py-7 md:grid-cols-[8rem_1fr_auto] md:gap-10 md:px-4">
              <span className="font-display text-3xl font-extrabold tracking-[-0.03em] text-navy-900">4+1 ve üzeri</span>
              <span className="text-muted">Büyük daireler, dubleksler, villalar ve iş yerleri için ilan edilmiş paket fiyatı yoktur; kapsam değerlendirilerek teklif hazırlanır.</span>
              <Link href="/teklif-al?hizmet=ev-boyama" className="link-arrow inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900">
                Özel teklif iste <ArrowRight aria-hidden className="size-4" />
              </Link>
            </li>
          </ul>
        </Container>
      </Section>

      {/* İç cephe boya + hazırlık */}
      <Section tone="navy" labelledBy="hazirlik-baslik">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div data-reveal>
            <p className="eyebrow mb-4">İş öncesi hazırlık</p>
            <h2 id="hazirlik-baslik" className="text-h2 font-bold">
              Boyadan önce yüzey
            </h2>
            <p className="mt-5 text-lead text-white/80">
              İç cephe boyasının düzgün görünmesi ve uzun süre dayanması, altındaki yüzeyin sağlamlığına bağlıdır. Pürüzlü, tozlu ya da nemli bir duvara atılan
              boya kısa sürede kusurlarını gösterir.
            </p>
            <div className="relative mt-10 aspect-[3/2] overflow-hidden rounded-(--radius-xl) bg-navy-800">
              <Image src="/images/site/duvar-boyama-uygulama.jpg" alt="Rulo ile duvar boyayan usta" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
          </div>
          <ol className="self-center">
            {PREP.map((s, i) => (
              <li key={s.title} data-reveal style={idx(i)} className="grid grid-cols-[auto_1fr] gap-6 border-t border-white/15 py-7 last:border-b">
                <span className="font-display text-sm font-bold text-[#8cc4f0]">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-display text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-white/75">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* Uygulama + yüzey onarımı */}
      <Section labelledBy="uygulama-baslik">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div data-reveal>
            <h2 id="uygulama-baslik" className="text-h3 font-bold">
              Boyama uygulaması
            </h2>
            <div className="prose-ocean mt-5">
              <p>
                Uygulama genellikle tavandan başlar, duvarlarla devam eder; köşeler ve doğrama kenarları fırçayla, geniş yüzeyler ruloyla boyanır. Katlar arasında
                boyanın üreticisinin önerdiği kuruma süresi beklenir. Eşyalı evlerde odalar sırayla ele alınarak evin tamamının aynı anda kullanım dışı kalması
                önlenir.
              </p>
              <p>
                Kaç kat uygulanacağı, hangi boya türünün kullanılacağı ve tavanın kapsama girip girmediği gibi konular dairenize göre değişir ve teklifinizde
                açıkça yazılır.
              </p>
            </div>
          </div>
          <div data-reveal style={idx(1)}>
            <h2 className="text-h3 font-bold">Yüzey onarımı</h2>
            <div className="prose-ocean mt-5">
              <p>
                Kılcal çatlaklar, çivi ve dübel delikleri, kabarmış boya ve küçük sıva dökülmeleri boyadan önce giderilmesi gereken yaygın kusurlardır. Daha geniş
                çaplı sorunlarda (yaygın nem, derin çatlak, dökülen sıva) önce nedenin anlaşılması gerekir.
              </p>
              <p>
                Onarım ihtiyacı daireden daireye değiştiği için teklifte ayrıca değerlendirilir. Ayrıntı için{' '}
                <Link href="/hizmetler/duvar-onarimi">duvar onarımı ve yüzey hazırlığı</Link> sayfasına bakabilirsiniz.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Kapsam + ek hizmetler */}
      <Section tone="soft" labelledBy="kapsam-baslik">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div data-reveal>
            <p className="eyebrow mb-4">Kapsam</p>
            <h2 id="kapsam-baslik" className="text-h2 font-bold">
              Teklifinizde netleşen başlıklar
            </h2>
            <p className="mt-5 text-muted">Aşağıdaki konular her daire için ayrı değerlendirilir ve teklifinizde açıkça belirtilir.</p>
            <div className="mt-8">
              <ScopeList items={scopeItems} note={packages[0]?.scopeNote} />
            </div>
          </div>
          <div data-reveal style={idx(1)}>
            <p className="eyebrow mb-4">İsteğe bağlı</p>
            <h2 className="text-h2 font-bold">Boyayla birlikte yapılabilecek işler</h2>
            <p className="mt-5 text-muted">Ev boşalmışken ya da boya yapılırken ele alınması pratik olan işler. Bunlar paket fiyatına dahil değildir; talebinize göre ayrıca tekliflendirilir.</p>
            <ul className="mt-8 border-t border-line-strong">
              {EXTRAS.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="group flex items-center justify-between gap-4 border-b border-line-strong py-4 font-medium text-navy-900 hover:text-ocean-700">
                    {e.label}
                    <span className="link-arrow">
                      <ArrowRight aria-hidden className="size-4" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* Renkler */}
      <Section labelledBy="renk-baslik">
        <Container className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div data-reveal="image" className="relative aspect-[4/3] overflow-hidden rounded-(--radius-xl) bg-soft">
            <Image src="/images/site/renk-kartelasi.jpg" alt="Yan yana açılmış renk kartelaları" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
          <div data-reveal style={idx(1)}>
            <p className="eyebrow mb-4">Boya renkleri</p>
            <h2 id="renk-baslik" className="text-h2 font-bold">
              Renk kararını aceleye getirmeyin
            </h2>
            <div className="prose-ocean mt-5">
              <p>
                Aynı renk, kuzey cepheli bir odada ve gün boyu güneş alan bir salonda farklı görünür. Zemin kaplaması, perdeler ve büyük mobilyalar da duvar
                renginin algısını değiştirir. Karar vermeden önce rengi kartela üzerinde değil, mümkünse kendi duvarınızda ve farklı saatlerde görmeniz en sağlıklı
                yöntemdir.
              </p>
              <ul>
                <li>
                  <Link href="/blog/salon-icin-boya-renkleri">Salon için boya renkleri</Link>
                </li>
                <li>
                  <Link href="/blog/ic-cephe-boyasi-nasil-secilir">İç cephe boyası nasıl seçilir?</Link>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* Gerçek boya projeleri ve öncesi/sonrası: yalnızca panelden eklendiğinde görünür */}
      {paintProjects.length > 0 && (
        <Section tone="soft" labelledBy="boya-projeleri-baslik">
          <Container>
            <SectionHeader id="boya-projeleri-baslik" eyebrow="Projeler" title="Tamamladığımız boya işleri" />
            <div className="grid gap-x-6 gap-y-12 md:grid-cols-3">
              {paintProjects.map((p, i) => (
                <ProjectCard key={p.slug} project={p} index={i} />
              ))}
            </div>
          </Container>
        </Section>
      )}
      {paintComparisons.length > 0 && (
        <Section labelledBy="boya-karsilastirma-baslik">
          <Container>
            <SectionHeader id="boya-karsilastirma-baslik" eyebrow="Öncesi & sonrası" title="Uygulama öncesi ve sonrası" />
            <div className="grid gap-10 lg:grid-cols-2">
              {paintComparisons.slice(0, 2).map((c) => (
                <BeforeAfter key={c.id} before={c.beforeSrc} after={c.afterSrc} title={c.title} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <ProcessSection tone="soft" />
      <FaqSection scope="ev-boyama" />
      <AreasSection tone="soft" title="Ev boyama hizmeti verdiğimiz ilçeler" />

      {posts.length > 0 && (
        <Section labelledBy="rehber-baslik">
          <Container>
            <SectionHeader id="rehber-baslik" eyebrow="İlgili rehberler" title="Karar vermeden önce okuyun" />
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <BlogCard key={p.slug} post={p} index={i} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CtaSection quoteHref="/teklif-al?hizmet=ev-boyama" />

      <JsonLdScript
        data={[
          serviceSchema(SITE_URL, {
            path: PATH,
            name: 'Ev Boyama',
            description: DESCRIPTION,
            serviceType: 'Ev boyama ve boya badana',
            areaNames: areas.map((a) => a.name),
            packages: packages.map((p) => ({ slug: p.slug, name: p.name, price: p.price, currency: p.currency, validUntil: p.validUntil })),
          }),
          breadcrumbSchema(SITE_URL, crumbs),
        ]}
      />
    </>
  );
}
