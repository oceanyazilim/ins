import { ArrowRight, MapPin, MessageCircle, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { MobilePriceStrip, type PackageCardData } from '@/components/sections/cards';
import { ButtonAnchor, ButtonLink } from '@/components/ui/button';
import { Accordion, Breadcrumbs, Container, Section, SectionHeader, type Crumb } from '@/components/ui/primitives';
import { formatPhone, whatsappUrl } from '@/lib/format';
import { fillTokens } from '@/lib/tokens';
import { areaPath, getActiveAreas, getFaqs, getSettings } from '@/server/data';
import { getTokenContext } from '@/server/content';

const idx = (i: number) => ({ '--reveal-index': i }) as CSSProperties;

/* ---------------- İç sayfa başlığı ---------------- */

export function PageHero({
  crumbs,
  eyebrow,
  title,
  lead,
  image,
  actions,
  prices,
  tone = 'soft',
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  image?: { src: string; alt: string } | null;
  actions?: ReactNode;
  /** Verilirse mobilde başlığın hemen altında fiyat şeridi gösterilir (fiyatlar ilk ekranda). */
  prices?: PackageCardData[];
  tone?: 'soft' | 'navy';
}) {
  const dark = tone === 'navy';
  return (
    <div className={dark ? 'on-dark bg-navy-900 text-white' : 'bg-soft'}>
      <Container className={`grid items-center gap-5 py-6 md:py-14 lg:gap-10 ${image ? 'lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-20' : 'lg:py-20'}`}>
        <div className="flex flex-col">
          <Breadcrumbs items={crumbs} light={dark} />
          {eyebrow && <p className="eyebrow mt-4 lg:mt-8">{eyebrow}</p>}
          <h1 className={`mt-2 max-w-[18ch] text-h1 font-extrabold lg:mt-4 ${dark ? 'text-white' : ''} animate-(--animate-hero-in)`}>{title}</h1>
          {lead && (
            <p className={`order-last mt-5 max-w-2xl text-lead lg:order-none lg:mt-6 ${dark ? 'text-white/80' : 'text-muted'} animate-(--animate-hero-in) [animation-delay:80ms]`}>{lead}</p>
          )}
          {prices && prices.length > 0 && <MobilePriceStrip packages={prices} location="page-hero" className="mt-4" />}
          {actions && <div className="mt-4 flex flex-wrap gap-2 animate-(--animate-hero-in) [animation-delay:160ms] lg:mt-8 lg:gap-3">{actions}</div>}
        </div>
        {image && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-(--radius-lg) bg-line lg:aspect-[4/3] lg:rounded-(--radius-xl)">
            <Image src={image.src} alt={image.alt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
        )}
      </Container>
    </div>
  );
}

/* ---------------- SSS ---------------- */

export async function FaqSection({
  scope,
  items,
  title = 'Sık Sorulan Sorular',
  eyebrow = 'Merak edilenler',
  tone = 'paper',
  id = 'sss',
}: {
  scope?: string;
  items?: { q: string; a: string }[];
  title?: string;
  eyebrow?: string;
  tone?: 'paper' | 'soft';
  id?: string;
}) {
  const [rows, ctx] = await Promise.all([scope ? getFaqs(scope) : Promise.resolve([]), getTokenContext()]);
  const list = [...(items ?? []), ...rows.map((r) => ({ q: r.question, a: r.answer }))].map((f) => ({ q: fillTokens(f.q, ctx), a: fillTokens(f.a, ctx) }));
  if (list.length === 0) return null;
  return (
    <Section tone={tone} id={id} labelledBy={`${id}-baslik`}>
      <Container className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div data-reveal>
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h2 id={`${id}-baslik`} className="text-h2 font-bold">
            {title}
          </h2>
          <p className="mt-5 text-muted">
            Aradığınız yanıtı bulamadıysanız{' '}
            <Link href="/iletisim" className="text-link">
              bize ulaşın
            </Link>
            .
          </p>
        </div>
        <Accordion items={list.map((f) => ({ q: f.q, a: <p>{f.a}</p> }))} />
      </Container>
    </Section>
  );
}

/* ---------------- Süreç ---------------- */

const PROCESS = [
  { title: 'İhtiyacınızı Paylaşın', text: 'Daire tipinizi, konumunuzu ve beklentinizi teklif formundan ya da telefonla iletin.' },
  { title: 'Kapsamı Değerlendirelim', text: 'Dairenin durumu, yüzey ihtiyaçları ve istekleriniz birlikte gözden geçirilir.' },
  { title: 'Teklif ve Planlama', text: 'Kapsamı açıkça gösteren teklif hazırlanır; uygun tarih birlikte belirlenir.' },
  { title: 'Uygulama ve Teslim', text: 'İş planlandığı sırayla yürütülür ve tamamlandığında sizinle birlikte kontrol edilir.' },
];

/** Masaüstünde yatay zaman çizgisi, mobilde dikey ilerleme. */
export function ProcessSection({ tone = 'soft' as 'soft' | 'paper', steps = PROCESS, title = 'Dört Adımda Ev Boyama Süreci' }) {
  return (
    <Section tone={tone} labelledBy="surec-baslik">
      <Container>
        <SectionHeader id="surec-baslik" eyebrow="Nasıl çalışıyoruz" title={title} />
        <ol className="relative grid gap-10 md:grid-cols-4 md:gap-8">
          <span aria-hidden className="absolute left-[1.35rem] top-2 h-[calc(100%-1rem)] w-px bg-line-strong md:left-0 md:top-[1.35rem] md:h-px md:w-full" />
          {steps.map((s, i) => (
            <li key={s.title} data-reveal style={idx(i)} className="relative pl-16 md:pl-0 md:pt-16">
              <span className="absolute left-0 top-0 grid size-11 place-items-center rounded-full border border-navy-900 bg-white font-display text-sm font-bold text-navy-900">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-lg font-bold text-navy-900">{s.title}</h3>
              <p className="mt-2 text-[0.9375rem] text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

/* ---------------- Hizmet bölgeleri ---------------- */

export async function AreasSection({
  title = 'Sancaktepe ve Yakın Çevresinde Hizmet',
  lead = 'Merkezimiz Sancaktepe’dedir. Aşağıdaki ilçelerde ev boyama ve boya badana hizmeti veriyoruz.',
  tone = 'paper' as 'paper' | 'soft',
  exclude,
}: {
  title?: string;
  lead?: string;
  tone?: 'paper' | 'soft';
  exclude?: string;
}) {
  const areas = (await getActiveAreas()).filter((a) => a.slug !== exclude);
  if (areas.length === 0) return null;
  return (
    <Section tone={tone} labelledBy="bolgeler-baslik">
      <Container>
        <SectionHeader
          id="bolgeler-baslik"
          eyebrow="Hizmet bölgeleri"
          title={title}
          lead={lead}
          action={
            <Link href="/hizmet-bolgeleri" className="link-arrow inline-flex items-center gap-1.5 font-semibold text-navy-900 underline-offset-4 hover:underline">
              Tüm bölgeler <ArrowRight aria-hidden className="size-4" />
            </Link>
          }
        />
        <ul className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((a, i) => {
            const inner = (
              <>
                <span className="flex items-center gap-2 text-sm font-semibold text-ocean-700">
                  <MapPin aria-hidden className="size-4" />
                  {a.isHub ? 'Merkez' : 'İstanbul · Anadolu Yakası'}
                </span>
                <span className="mt-3 block font-display text-2xl font-bold tracking-[-0.02em] text-navy-900">{a.name}</span>
                <span className="mt-2 block text-[0.9375rem] text-muted">{a.summary}</span>
                {a.pagePublished && (
                  <span className="link-arrow mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900">
                    {a.name} ev boyama <ArrowRight aria-hidden className="size-4" />
                  </span>
                )}
              </>
            );
            return (
              <li key={a.slug} data-reveal style={idx(i)} className="border-b border-r border-line">
                {a.pagePublished ? (
                  <Link href={areaPath(a.slug)} className="group block h-full p-7 transition-colors duration-(--duration-hover) hover:bg-soft md:p-9">
                    {inner}
                  </Link>
                ) : (
                  <div className="h-full p-7 md:p-9">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

/* ---------------- Kapanış çağrısı ---------------- */

export async function CtaSection({
  title = 'Evinizin Yeni Görünümü İçin İlk Adımı Atın.',
  text = 'Daire tipinizi ve konumunuzu paylaşın; kapsamı birlikte netleştirip size özel teklifinizi hazırlayalım.',
  quoteHref = '/teklif-al',
  whatsappMessage = 'Merhaba Ocean İnşaat, ev boyama hizmetiniz hakkında bilgi almak istiyorum.',
}: {
  title?: string;
  text?: string;
  quoteHref?: string;
  whatsappMessage?: string;
}) {
  const { contact } = await getSettings();
  return (
    <section aria-labelledby="cta-baslik" className="on-dark relative overflow-hidden bg-navy-900 text-white">
      <div aria-hidden className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(60%_80%_at_70%_30%,rgb(255_255_255/0.09),transparent_70%)] lg:block" />
      <Container className="relative py-(--spacing-section)">
        <div data-reveal className="max-w-3xl">
          <p className="eyebrow mb-5">Teklif alın</p>
          <h2 id="cta-baslik" className="text-h1 font-extrabold text-white">
            {title}
          </h2>
          <p className="mt-6 max-w-xl text-lead text-white/80">{text}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={quoteHref} variant="light" size="lg">
              Teklif Talep Et <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            <ButtonAnchor href={`tel:${contact.phone}`} variant="outline-light" size="lg" data-event="click_phone" data-event-location="cta">
              <Phone aria-hidden className="size-4" /> {formatPhone(contact.phone)}
            </ButtonAnchor>
            {contact.whatsapp && (
              <ButtonAnchor
                href={whatsappUrl(contact.whatsapp, whatsappMessage)}
                variant="outline-light"
                size="lg"
                rel="noopener noreferrer"
                target="_blank"
                data-event="click_whatsapp"
                data-event-location="cta"
              >
                <MessageCircle aria-hidden className="size-4" /> WhatsApp
              </ButtonAnchor>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
