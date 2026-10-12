import { Clock, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { FaqSection } from '@/components/sections/blocks';
import { Breadcrumbs, Container } from '@/components/ui/primitives';
import { SERVICE_TYPES } from '@/features/quote/options';
import { QuoteForm } from '@/features/quote/quote-form';
import { formatPhone, whatsappUrl } from '@/lib/format';
import { JsonLdScript, pageMetadata, SITE_URL } from '@/seo';
import { breadcrumbSchema } from '@/seo/schema';
import { getActiveAreas, getPackages, getSettings } from '@/server/data';

const PATH = '/teklif-al';
const crumbs = [
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Teklif Al', path: PATH },
];

export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata({
    path: PATH,
    title: 'Ev Boyama ve Tadilat Teklifi Al',
    description: 'Ocean İnşaat’tan ev boyama, boya badana ve tadilat için teklif isteyin. Daire tipinizi ve konumunuzu paylaşın, talebiniz birkaç adımda bize ulaşsın.',
  });

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function TeklifAlPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [packages, areas, settings] = await Promise.all([getPackages(), getActiveAreas(), getSettings()]);

  // ?paket=2-1-daire-boyama, ?hizmet=ev-boyama ve ?ilce=sancaktepe ile ön seçim
  const pkg = packages.find((p) => p.slug === one(sp.paket));
  const service = SERVICE_TYPES.find((s) => s.value === one(sp.hizmet))?.value;
  const area = areas.find((a) => a.slug === one(sp.ilce));
  const { contact } = settings;

  return (
    <>
      <div className="bg-soft">
        <Container className="grid grid-cols-1 gap-10 py-10 md:py-14 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:py-16">
          <div>
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-8 text-h1 font-extrabold">Teklif Al</h1>
            <p className="mt-5 text-lead text-muted">Birkaç kısa adımda ihtiyacınızı paylaşın. Talebiniz kaydedilir, size bir talep numarası verilir ve ekibimiz sizinle iletişime geçer.</p>

            <ul className="mt-8 space-y-4 text-[0.9375rem]">
              <li className="flex gap-3">
                <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-ocean-600" />
                Formu doldurmak yaklaşık iki dakika sürer; yalnızca gerekli bilgileri istiyoruz.
              </li>
              <li className="flex gap-3">
                <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-ocean-600" />
                Bilgileriniz yalnızca talebinizi değerlendirmek için kullanılır.
              </li>
            </ul>

            <div className="mt-10 border-t border-line-strong pt-6">
              <p className="text-sm font-semibold text-navy-900">Formu doldurmak istemiyor musunuz?</p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                <a href={`tel:${contact.phone}`} data-event="click_phone" data-event-location="quote" className="flex items-center gap-2 font-semibold text-navy-900 underline-offset-4 hover:underline">
                  <Phone aria-hidden className="size-4 text-ocean-600" />
                  {formatPhone(contact.phone)}
                </a>
                {contact.whatsapp && (
                  <a
                    href={whatsappUrl(
                      contact.whatsapp,
                      pkg ? `Merhaba, ${pkg.roomType} ev boyama paketi için teklif almak istiyorum.` : 'Merhaba Ocean İnşaat, ev boyama hizmetiniz hakkında bilgi almak istiyorum.',
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-event="click_whatsapp"
                    data-event-location="quote"
                    className="flex items-center gap-2 font-semibold text-navy-900 underline-offset-4 hover:underline"
                  >
                    <MessageCircle aria-hidden className="size-4 text-whatsapp" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>

          <QuoteForm
            packages={packages.map((p) => ({ slug: p.slug, roomType: p.roomType, name: p.name, price: p.price, currency: p.currency }))}
            areas={areas.map((a) => ({ name: a.name, neighborhoods: a.neighborhoods.map((n) => n.name) }))}
            phone={contact.phone}
            whatsapp={contact.whatsapp}
            initial={{ serviceType: pkg ? 'ev-boyama' : service, roomType: pkg?.roomType, district: area?.name }}
          />
        </Container>
      </div>
      <FaqSection scope="teklif-al" title="Teklif süreci hakkında" />
      <JsonLdScript data={breadcrumbSchema(SITE_URL, crumbs)} />
    </>
  );
}
