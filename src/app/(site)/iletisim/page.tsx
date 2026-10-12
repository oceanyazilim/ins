import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/sections/blocks';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section } from '@/components/ui/primitives';
import { ContactForm } from '@/features/quote/contact-form';
import { formatPhone, whatsappUrl } from '@/lib/format';
import { joinTr } from '@/lib/tokens';
import { JsonLdScript, pageMetadata, SITE_URL } from '@/seo';
import { breadcrumbSchema } from '@/seo/schema';
import { getActiveAreas, getSettings } from '@/server/data';

const PATH = '/iletisim';
const crumbs = [
  { name: 'Ana Sayfa', path: '/' },
  { name: 'İletişim', path: PATH },
];

export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata({ path: PATH, title: 'İletişim', description: 'Ocean İnşaat ile iletişime geçin: telefon, WhatsApp, e-posta ve iletişim formu. Sancaktepe merkezli ev boyama, tadilat ve inşaat hizmetleri.' });

export default async function IletisimPage() {
  const [{ contact, address, hours }, areas] = await Promise.all([getSettings(), getActiveAreas()]);
  return (
    <>
      <PageHero
        crumbs={crumbs}
        eyebrow="İletişim"
        title="Projenizi konuşalım"
        lead="Sorunuzu iletin ya da doğrudan arayın. Ev boyama ve tadilat talepleriniz için teklif formunu kullanmanız süreci hızlandırır."
        actions={
          <ButtonLink href="/teklif-al" size="lg">
            Teklif formuna git <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        }
      />
      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div>
            <h2 className="text-h3 font-bold">İletişim kanallarımız</h2>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              <li className="flex gap-4 py-5">
                <Phone aria-hidden className="mt-1 size-5 shrink-0 text-ocean-600" />
                <div>
                  <p className="text-sm text-muted">Telefon</p>
                  <a href={`tel:${contact.phone}`} data-event="click_phone" data-event-location="contact" className="font-display text-xl font-bold text-navy-900 underline-offset-4 hover:underline">
                    {formatPhone(contact.phone)}
                  </a>
                </div>
              </li>
              {contact.whatsapp && (
                <li className="flex gap-4 py-5">
                  <MessageCircle aria-hidden className="mt-1 size-5 shrink-0 text-whatsapp" />
                  <div>
                    <p className="text-sm text-muted">WhatsApp</p>
                    <a
                      href={whatsappUrl(contact.whatsapp, 'Merhaba Ocean İnşaat, ev boyama hizmetiniz hakkında bilgi almak istiyorum.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-event="click_whatsapp"
                      data-event-location="contact"
                      className="font-semibold text-navy-900 underline underline-offset-4"
                    >
                      WhatsApp üzerinden yazın
                    </a>
                  </div>
                </li>
              )}
              <li className="flex gap-4 py-5">
                <Mail aria-hidden className="mt-1 size-5 shrink-0 text-ocean-600" />
                <div>
                  <p className="text-sm text-muted">E-posta</p>
                  {contact.emails.map((e) => (
                    <a key={e} href={`mailto:${e}`} className="block break-all font-semibold text-navy-900 underline-offset-4 hover:underline">
                      {e}
                    </a>
                  ))}
                </div>
              </li>
              <li className="flex gap-4 py-5">
                <MapPin aria-hidden className="mt-1 size-5 shrink-0 text-ocean-600" />
                <div>
                  <p className="text-sm text-muted">Merkez</p>
                  <p className="font-semibold text-navy-900">
                    {address.showStreet && address.street ? `${address.street}, ` : ''}
                    {address.district} / {address.city}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Ev boyama hizmet bölgeleri: {joinTr(areas.map((a) => a.name))}.{' '}
                    <Link href="/hizmet-bolgeleri" className="text-link">
                      Ayrıntılar
                    </Link>
                  </p>
                </div>
              </li>
              <li className="flex gap-4 py-5">
                <Clock aria-hidden className="mt-1 size-5 shrink-0 text-ocean-600" />
                <div className="flex-1">
                  <p className="text-sm text-muted">Çalışma saatleri</p>
                  <dl className="mt-1 space-y-1">
                    {hours.map((h) => (
                      <div key={h.days} className="flex justify-between gap-6">
                        <dt className="text-navy-900">{h.days}</dt>
                        <dd className="font-semibold text-navy-900">{h.opens && h.closes ? `${h.opens} – ${h.closes}` : 'Kapalı'}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-8 text-h3 font-bold">Bize yazın</h2>
            <ContactForm />
          </div>
        </Container>
      </Section>
      <JsonLdScript data={breadcrumbSchema(SITE_URL, crumbs)} />
    </>
  );
}
