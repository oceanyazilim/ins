import { ArrowRight, CalendarCheck, Layers, MapPin, MessagesSquare, Phone, ReceiptText, Ruler } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { BeforeAfter } from '@/components/interactive/before-after';
import { Magnetic } from '@/components/interactive/magnetic';
import { PricingSelector } from '@/components/interactive/pricing-selector';
import { AreasSection, CtaSection, FaqSection, ProcessSection } from '@/components/sections/blocks';
import { BlogCard, MobilePriceStrip, PriceCards, ProjectCard } from '@/components/sections/cards';
import { ButtonAnchor, ButtonLink } from '@/components/ui/button';
import { Container, Section, SectionHeader } from '@/components/ui/primitives';
import { formatPrice } from '@/lib/format';
import { pageMetadata } from '@/seo';
import { areaPath, getActiveAreas, getComparisons, getPackages, getPostsByCategories, getProjects, getServicesBySlugs, getSettings } from '@/server/data';

export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata({
    path: '/',
    title: 'Ocean İnşaat | Sancaktepe Ev Boyama ve Tadilat',
    absoluteTitle: true,
    description:
      'Sancaktepe, Çekmeköy ve Ümraniye’de Ocean İnşaat ev boyama, boya badana ve tadilat hizmetlerini keşfedin. Daire boyama fiyatlarını inceleyin, teklif talebi oluşturun.',
  });

const idx = (i: number) => ({ '--reveal-index': i }) as CSSProperties;

const WHY = [
  { icon: ReceiptText, title: 'Şeffaf Fiyatlandırma', text: 'Daire tipine göre paket fiyatlarını sitede açıkça yayınlıyoruz. Teklifinizde hangi kalemlerin dahil olduğu yazılı olarak belirtilir.' },
  { icon: Ruler, title: 'İhtiyaca Uygun Çözümler', text: 'Her dairenin yüzeyi ve beklentisi farklıdır. Kapsam, dairenizin durumu değerlendirilerek size göre belirlenir.' },
  { icon: CalendarCheck, title: 'Planlı Uygulama', text: 'İşin sırası, eşya düzeni ve takvim uygulama başlamadan önce sizinle birlikte kararlaştırılır.' },
  { icon: MessagesSquare, title: 'Detaylı İletişim', text: 'Talebinizden teslimata kadar telefon, WhatsApp veya e-posta üzerinden aynı ekipten bilgi alırsınız.' },
  { icon: Layers, title: 'Bütünleşik Tadilat Hizmetleri', text: 'Boyanın yanında alçı, tesisat, zemin ve tadilat işlerini de aynı çatı altında, doğru sırayla planlayabilirsiniz.' },
];

const SERVICE_SLUGS = ['boya-badana', 'ic-cephe-boyama', 'ev-tadilati', 'mutfak-tadilati', 'banyo-tadilati', 'alci-siva', 'elektrik-tesisati'];
const SERVICE_LABELS: Record<string, string> = {
  'ev-tadilati': 'Ev Tadilatı',
  'mutfak-tadilati': 'Mutfak Yenileme',
  'banyo-tadilati': 'Banyo Yenileme',
  'alci-siva': 'Alçı & Sıva',
  'elektrik-tesisati': 'Elektrik & Tesisat',
};

export default async function HomePage() {
  const [settings, packages, areas, services, projects, comparisons, posts] = await Promise.all([
    getSettings(),
    getPackages(),
    getActiveAreas(),
    getServicesBySlugs(SERVICE_SLUGS),
    getProjects(),
    getComparisons(),
    getPostsByCategories(['ev-boyama', 'boya-fiyatlari', 'boya-badana', 'ic-cephe', 'renk-rehberi'], 3),
  ]);
  const phone = settings.contact.phone;
  const featured = projects.filter((p) => p.featured).slice(0, 4);
  const heroAreas = areas.slice(0, 3);

  return (
    <>
      {/* 03 — Hero. Mobil sıra: başlık → görsel → fiyatlar → düğmeler (ilk ekrana sığar); masaüstünde iki sütun.
          Metin ilk HTML'dedir; LCP görseli öncelikli yüklenir ve animasyonla geciktirilmez. */}
      <section aria-labelledby="hero-baslik" className="relative bg-soft lg:flex lg:h-[clamp(30rem,calc(100dvh-7.5rem),58rem)] lg:flex-col">
        <Container className="flex flex-col gap-3 pb-8 pt-4 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[1.05fr_1fr] lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-x-14 lg:gap-y-0 lg:pb-6 lg:pt-8">
          <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
            <p className="eyebrow text-[0.6875rem] animate-(--animate-hero-in) lg:text-[0.8125rem]">Sancaktepe ve Çevresinde Profesyonel Ev Boyama</p>
            <h1
              id="hero-baslik"
              className="mt-2 text-[clamp(1.625rem,7.4vw,2.5rem)] font-extrabold leading-[1.06] tracking-[-0.03em] animate-(--animate-hero-in) [animation-delay:60ms] lg:mt-4 lg:max-w-[16ch] lg:text-[clamp(2.25rem,min(4.4vw,7.2dvh),4.75rem)] lg:leading-[1.04]"
            >
              Yaşam Alanlarınıza Yeni Bir Görünüm.
            </h1>
          </div>

          <div className="relative lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:min-h-0">
            <div className="relative h-[clamp(6rem,calc(100dvh-27.5rem),19rem)] overflow-hidden rounded-(--radius-lg) bg-line lg:h-full lg:rounded-(--radius-xl)">
              <Image
                src="/images/site/salon-beyaz-duvar.jpg"
                alt="Açık renk duvarları ve beyaz koltuğu olan aydınlık, modern bir salon"
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover object-[60%_62%] lg:object-[60%_50%]"
              />
            </div>
            <div className="absolute bottom-5 -left-10 hidden w-[clamp(9rem,20dvh,14rem)] overflow-hidden rounded-(--radius-lg) border-4 border-soft bg-line shadow-(--shadow-lift) lg:block">
              <Image src="/images/site/renk-secimi-kartela.jpg" alt="Renk seçimi için açılmış boya kartelası" width={448} height={299} sizes="224px" className="aspect-[3/2] object-cover" />
            </div>
          </div>

          {/* Mobilde fiyatlar ilk ekranda, görselin hemen altında */}
          <MobilePriceStrip packages={packages} location="hero" />

          <div className="grid grid-cols-2 gap-2 animate-(--animate-hero-in) [animation-delay:220ms] lg:col-start-1 lg:row-start-3 lg:mt-[clamp(1rem,3dvh,2rem)] lg:flex lg:flex-wrap lg:gap-3">
            <ButtonLink href="/teklif-al" size="lg" className="px-3 lg:hidden">
              Teklif Al <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            <ButtonAnchor href={`tel:${phone}`} variant="outline" size="lg" className="px-3 lg:hidden" data-event="click_phone" data-event-location="hero">
              <Phone aria-hidden className="size-4" /> Hemen Ara
            </ButtonAnchor>
            <Magnetic className="hidden lg:inline-block">
              <ButtonLink href="/boya-fiyatlari" size="lg">
                Boya Fiyatlarını İncele
              </ButtonLink>
            </Magnetic>
            <span className="hidden lg:inline-block">
              <ButtonLink href="/teklif-al" variant="outline" size="lg">
                Hemen Teklif Al <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            </span>
          </div>

          <p className="mt-2 max-w-xl text-[0.9375rem] text-muted animate-(--animate-hero-in) [animation-delay:140ms] lg:col-start-1 lg:row-start-2 lg:mt-[clamp(0.75rem,2.4dvh,1.5rem)] lg:text-lead">
            Ocean İnşaat ile ev boyama, boya badana ve iç mekân yenileme hizmetlerini keşfedin. Dairenize uygun fiyatları inceleyin, ihtiyaçlarınız için teklif
            talebi oluşturun.
          </p>

          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-navy-900 animate-(--animate-hero-in) [animation-delay:300ms] lg:col-start-1 lg:row-start-4 lg:mt-[clamp(0.75rem,2.6dvh,2rem)] lg:self-start">
            {heroAreas.map((a) => (
              <li key={a.slug}>
                {a.pagePublished ? (
                  <Link href={areaPath(a.slug)} className="flex min-h-9 items-center gap-1.5 underline-offset-4 hover:underline">
                    <MapPin aria-hidden className="size-4 text-ocean-600" />
                    {a.name}
                  </Link>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <MapPin aria-hidden className="size-4 text-ocean-600" />
                    {a.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Container>

        {/* 04 — Fiyat paneli: masaüstünde ilk ekranın alt kenarında (mobilde fiyatlar yukarıdaki şerittedir) */}
        <Container className="hidden pb-6 lg:block">
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] overflow-hidden rounded-(--radius-xl) border border-line bg-white shadow-(--shadow-lift)">
            {packages.map((p) => (
              <Link
                key={p.slug}
                href={`/ev-boyama/${p.slug}`}
                data-event="select_painting_package"
                data-event-label={p.roomType}
                data-event-location="hero-preview"
                className="group block border-r border-line px-8 py-[clamp(0.875rem,2.4dvh,1.75rem)] transition-colors duration-(--duration-hover) hover:bg-soft"
              >
                <span className="font-display text-sm font-bold uppercase tracking-[0.12em] text-muted">{p.roomType} ev boyama</span>
                <span className="mt-1 block font-display text-[clamp(1.5rem,3.6dvh,1.875rem)] font-extrabold tracking-[-0.03em] text-navy-900 transition-colors group-hover:text-ocean-700">
                  {formatPrice(p.price, p.currency)}
                </span>
              </Link>
            ))}
            <Link href="/boya-fiyatlari" className="link-arrow flex items-center justify-center gap-2 bg-navy-900 px-8 py-5 font-display font-semibold text-white transition-colors hover:bg-navy-700">
              Tüm fiyatlar <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* 05 — Marka anlatımı */}
      <Section labelledBy="giris-baslik">
        <Container className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <h2 id="giris-baslik" data-reveal className="text-h1 font-extrabold">
            Evinizde küçük bir değişim, yaşam alanınızda <span className="text-ocean-600">büyük bir yenilik.</span>
          </h2>
          <div data-reveal style={idx(1)} className="self-end text-lead text-muted">
            <p>
              Ocean İnşaat, Sancaktepe merkezli bir yapı firmasıdır. İnşaat ve tadilat işlerindeki deneyimimizi, evinizin en hızlı yenilenen yüzeyine, yani
              duvarlarına taşıyoruz.
            </p>
            <p className="mt-4">
              Daire tipinize göre fiyatı baştan görürsünüz; kapsamı birlikte netleştirir, işi planlı biçimde uygularız. İhtiyaç duyarsanız boyayı alçı, tesisat
              ve tadilat işleriyle birlikte tek elden yürütürüz.
            </p>
            <Link href="/kurumsal" className="link-arrow mt-6 inline-flex items-center gap-1.5 text-base font-semibold text-navy-900 underline-offset-4 hover:underline">
              Ocean İnşaat hakkında <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        </Container>
      </Section>

      {/* 06 — Hizmetler: bento düzeni, ana hizmet büyük */}
      <Section tone="soft" labelledBy="hizmetler-baslik">
        <Container>
          <SectionHeader
            id="hizmetler-baslik"
            eyebrow="Hizmetlerimiz"
            title="Boyadan tadilata, eviniz için tek muhatap"
            action={
              <Link href="/hizmetler" className="link-arrow inline-flex items-center gap-1.5 font-semibold text-navy-900 underline-offset-4 hover:underline">
                Tüm hizmetler <ArrowRight aria-hidden className="size-4" />
              </Link>
            }
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[auto_auto]">
            <Link
              href="/ev-boyama"
              data-reveal
              className="group relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-(--radius-xl) bg-navy-900 p-8 text-white md:col-span-2 lg:row-span-2 lg:p-10"
            >
              <div className="zoom-media absolute inset-0 -z-10">
                <Image src="/images/site/salon-acik-renk-koltuk.jpg" alt="Açık renk boyanmış duvarları olan salon" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-950/55 to-navy-950/5" />
              </div>
              <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-[#8cc4f0]">Ana hizmetimiz</p>
              <h3 className="mt-2 font-display text-4xl font-extrabold tracking-[-0.03em] text-white md:text-5xl">Ev Boyama</h3>
              <p className="mt-3 max-w-md text-white/85">1+1, 2+1 ve 3+1 daireler için ilan edilmiş paket fiyatları ve planlı uygulama.</p>
              <span className="link-arrow mt-6 inline-flex items-center gap-2 font-display font-semibold">
                Hizmeti incele <ArrowRight aria-hidden className="size-4" />
              </span>
            </Link>

            {services.map((s, i) => (
              <Link
                key={s.slug}
                href={`/hizmetler/${s.slug}`}
                data-reveal
                style={idx((i % 4) + 1)}
                className={`group flex flex-col justify-between rounded-(--radius-lg) border border-line bg-white p-6 transition-[border-color,box-shadow] duration-(--duration-card) hover:border-navy-900/30 hover:shadow-(--shadow-card) ${i === 6 ? 'md:col-span-2 lg:col-span-4' : ''}`}
              >
                <div className={i === 6 ? 'md:flex md:items-center md:justify-between md:gap-10' : ''}>
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-[-0.015em] text-navy-900 transition-colors duration-(--duration-hover) group-hover:text-ocean-700">
                      {SERVICE_LABELS[s.slug] ?? s.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-[0.9375rem] text-muted">{s.overview}</p>
                  </div>
                  <span className="link-arrow mt-5 inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-navy-900 md:mt-0">
                    İncele <ArrowRight aria-hidden className="size-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* 07 — Neden Ocean: kart yerine ince çizgili editoryal liste */}
      <Section labelledBy="neden-baslik">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <div data-reveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow mb-4">Neden Ocean İnşaat</p>
            <h2 id="neden-baslik" className="text-h2 font-bold">
              İşin başında net, sonunda düzenli.
            </h2>
            <p className="mt-5 text-lead text-muted">Bir ev boyama işinde aradığınız şeyleri sade bir düzene bağlıyoruz: açık fiyat, net kapsam, planlı uygulama.</p>
          </div>
          <ul className="border-t border-line">
            {WHY.map((w, i) => (
              <li key={w.title} data-reveal style={idx(i)} className="grid gap-4 border-b border-line py-7 sm:grid-cols-[auto_1fr] sm:gap-8">
                <span className="grid size-12 place-items-center rounded-full bg-ocean-50 text-ocean-700">
                  <w.icon aria-hidden className="size-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-navy-900">{w.title}</h3>
                  <p className="mt-2 text-muted">{w.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* 08 — Boya deneyimi: görsel + metin */}
      <Section tone="navy" labelledBy="boya-deneyimi-baslik">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div data-reveal="image" className="relative aspect-[4/3] overflow-hidden rounded-(--radius-xl) bg-navy-800 lg:aspect-[5/4]">
            <Image src="/images/site/modern-oturma-alani.jpg" alt="Açık renk boyanmış duvarları olan modern oturma alanı" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div data-reveal style={idx(1)}>
            <p className="eyebrow mb-4">Ev boyama</p>
            <h2 id="boya-deneyimi-baslik" className="text-h2 font-bold">
              İyi bir boya, iyi bir hazırlıkla başlar.
            </h2>
            <p className="mt-5 text-lead text-white/80">
              Sonucu belirleyen çoğu zaman son kat değil, ondan önce yapılanlardır. Dairenizin durumuna göre hazırlığı ve uygulamayı şu başlıklarda ele alıyoruz:
            </p>
            <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {['Yüzey kontrolü ve onarım ihtiyacının belirlenmesi', 'Zemin, doğrama ve eşyaların korunması', 'Gereken yüzeylerde astar ve macun', 'Duvar ve tavan boya uygulaması', 'Renk ve boya türü tercihine göre planlama', 'Uygulama sonrası birlikte kontrol'].map((t) => (
                <li key={t} className="flex gap-3 border-t border-white/15 pt-4 text-[0.9375rem] text-white/90">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-ocean-500" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-white/65">Hangi işlerin teklifinize dahil olduğu, dairenizin durumu değerlendirildikten sonra yazılı olarak netleştirilir.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/ev-boyama" variant="light" size="lg">
                Ev boyama hizmeti
              </ButtonLink>
              <ButtonLink href="/teklif-al?hizmet=ev-boyama" variant="outline-light" size="lg">
                Teklif al
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      {/* 09 — Öncesi / sonrası: yalnızca doğrulanmış gerçek çiftler yayınlandığında görünür */}
      {comparisons.length > 0 && (
        <Section labelledBy="oncesi-sonrasi-baslik">
          <Container>
            <SectionHeader id="oncesi-sonrasi-baslik" eyebrow="Öncesi & sonrası" title="Farkı kendiniz karşılaştırın" lead="Tamamladığımız işlerden gerçek kareler. Çizgiyi sürükleyerek iki durumu karşılaştırabilirsiniz." />
            <div className="grid gap-10 lg:grid-cols-2">
              {comparisons.slice(0, 2).map((c) => (
                <BeforeAfter key={c.id} before={c.beforeSrc} after={c.afterSrc} title={c.title} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* 10 — Fiyatlar */}
      <Section tone="soft" id="fiyatlar" labelledBy="fiyatlar-baslik">
        <Container>
          <SectionHeader
            id="fiyatlar-baslik"
            eyebrow="Şeffaf fiyat"
            title="Ev Boyama Fiyatlarımız"
            lead="Daire tipinize göre ilan edilen paket fiyatları. Nihai teklif, dairenizin durumu ve istediğiniz kapsam değerlendirildikten sonra netleşir."
          />
          <PriceCards packages={packages} />
          <p className="mt-8 text-sm text-muted">
            4+1, dubleks ve diğer daire tipleri için ilan edilmiş paket fiyatı yoktur;{' '}
            <Link href="/teklif-al" className="text-link">
              teklif formundan
            </Link>{' '}
            bilgilerinizi iletmeniz yeterlidir. Ayrıntılar için{' '}
            <Link href="/boya-fiyatlari" className="text-link">
              boya fiyatları sayfasına
            </Link>{' '}
            göz atın.
          </p>
        </Container>
      </Section>

      {/* 11 — Akıllı teklif önizlemesi */}
      <Section labelledBy="secici-baslik">
        <Container className="grid items-center gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
          <div data-reveal>
            <p className="eyebrow mb-4">Teklife başlayın</p>
            <h2 id="secici-baslik" className="text-h2 font-bold">
              Daire tipinizi seçin, teklif formuna hazır geçin.
            </h2>
            <p className="mt-5 text-lead text-muted">Seçtiğiniz paket teklif formunda işaretli gelir. Konumunuzu ve iletişim bilginizi ekleyerek talebinizi birkaç adımda tamamlayabilirsiniz.</p>
          </div>
          <div data-reveal style={idx(1)}>
            <PricingSelector packages={packages.map((p) => ({ slug: p.slug, roomType: p.roomType, name: p.name, price: p.price, currency: p.currency, summary: p.summary }))} />
          </div>
        </Container>
      </Section>

      {/* 12 — Süreç */}
      <ProcessSection />

      {/* 13 — Seçili projeler */}
      {featured.length > 0 && (
        <Section labelledBy="projeler-baslik">
          <Container>
            <SectionHeader
              id="projeler-baslik"
              eyebrow="Projelerimiz"
              title="Görev aldığımız yapı işlerinden seçmeler"
              lead="Konut, kurumsal yapı ve turizm başlıklarında Ocean İnşaat’ın uygulama, koordinasyon ve taşeronluk kapsamında yer aldığı projeler."
              action={
                <Link href="/projeler" className="link-arrow inline-flex items-center gap-1.5 font-semibold text-navy-900 underline-offset-4 hover:underline">
                  Tüm projeler <ArrowRight aria-hidden className="size-4" />
                </Link>
              }
            />
            <div className="grid gap-x-6 gap-y-12 md:grid-cols-3">
              {featured.map((p, i) => (
                <ProjectCard key={p.slug} project={p} index={i % 3} wide={i === 0 || i === 3} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* 14 — Bölgeler */}
      <AreasSection tone="soft" />

      {/* 15 — SSS */}
      <FaqSection scope="home" />

      {/* 16 — Blog */}
      {posts.length > 0 && (
        <Section tone="soft" labelledBy="blog-baslik">
          <Container>
            <SectionHeader
              id="blog-baslik"
              eyebrow="Rehber"
              title="Ev boyama hakkında bilmeniz gerekenler"
              action={
                <Link href="/blog" className="link-arrow inline-flex items-center gap-1.5 font-semibold text-navy-900 underline-offset-4 hover:underline">
                  Tüm yazılar <ArrowRight aria-hidden className="size-4" />
                </Link>
              }
            />
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <BlogCard key={p.slug} post={p} index={i} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* 17 — Kapanış */}
      <CtaSection />
    </>
  );
}
