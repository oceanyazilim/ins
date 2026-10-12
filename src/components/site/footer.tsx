import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import type { SiteSettings } from '@/config/site';
import { formatPhone, whatsappUrl } from '@/lib/format';
import { Logo } from './header';

type LinkItem = { label: string; href: string };

const SOCIAL_LABELS: Record<string, string> = { instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', youtube: 'YouTube', x: 'X' };

function Column({ title, links }: { title: string; links: LinkItem[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white/60">{title}</h2>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[0.9375rem] text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer({
  settings,
  services,
  areas,
}: {
  settings: SiteSettings;
  services: LinkItem[];
  areas: LinkItem[];
}) {
  const { contact, address, hours, social, company } = settings;
  const socials = Object.entries(social).filter(([, url]) => url);
  return (
    <footer className="on-dark bg-navy-950 text-white">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] lg:py-20">
        <div>
          <Link href="/" aria-label="Ocean İnşaat ana sayfa" className="inline-block">
            <Logo variant="white" className="h-10" />
          </Link>
          <p className="mt-6 max-w-xs text-[0.9375rem] leading-relaxed text-white/75">
            {address.district} merkezli ev boyama, boya badana, tadilat ve inşaat hizmetleri.
          </p>
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
              {socials.map(([key, url]) => (
                <li key={key}>
                  <a href={url} rel="noopener noreferrer" target="_blank" className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline">
                    {SOCIAL_LABELS[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Column title="Hizmetler" links={services} />
        <Column title="Hizmet Bölgeleri" links={[...areas, { label: 'Tüm hizmet bölgeleri', href: '/hizmet-bolgeleri' }]} />
        <Column
          title="Kurumsal"
          links={[
            { label: 'Hakkımızda', href: '/kurumsal' },
            { label: 'Projelerimiz', href: '/projeler' },
            { label: 'Çalışma Süreci', href: '/surec' },
            { label: 'Kat Karşılığı İnşaat', href: '/kat-karsiligi' },
            { label: 'Blog', href: '/blog' },
            { label: 'İletişim', href: '/iletisim' },
          ]}
        />

        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white/60">İletişim</h2>
          <ul className="mt-5 space-y-4 text-[0.9375rem]">
            <li>
              <a href={`tel:${contact.phone}`} data-event="click_phone" data-event-location="footer" className="flex items-center gap-3 font-semibold text-white hover:underline">
                <Phone aria-hidden className="size-4 text-ocean-500" />
                {formatPhone(contact.phone)}
              </a>
            </li>
            {contact.whatsapp && (
              <li>
                <a
                  href={whatsappUrl(contact.whatsapp, 'Merhaba Ocean İnşaat, ev boyama hizmetiniz hakkında bilgi almak istiyorum.')}
                  rel="noopener noreferrer"
                  target="_blank"
                  data-event="click_whatsapp"
                  data-event-location="footer"
                  className="flex items-center gap-3 text-white/85 hover:text-white hover:underline"
                >
                  <MessageCircle aria-hidden className="size-4 text-ocean-500" />
                  WhatsApp ile yazın
                </a>
              </li>
            )}
            {contact.emails.map((email) => (
              <li key={email}>
                <a href={`mailto:${email}`} className="flex items-center gap-3 break-all text-white/85 hover:text-white hover:underline">
                  <Mail aria-hidden className="size-4 shrink-0 text-ocean-500" />
                  {email}
                </a>
              </li>
            ))}
            <li className="flex items-start gap-3 text-white/85">
              <MapPin aria-hidden className="mt-1 size-4 shrink-0 text-ocean-500" />
              <span>
                {address.showStreet && address.street ? `${address.street}, ` : ''}
                {address.district} / {address.city}
              </span>
            </li>
          </ul>
          <dl className="mt-6 space-y-1 text-sm text-white/65">
            {hours.map((h) => (
              <div key={h.days} className="flex justify-between gap-4">
                <dt>{h.days}</dt>
                <dd>{h.opens && h.closes ? `${h.opens} – ${h.closes}` : 'Kapalı'}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-4 py-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {company.legalName}. Tüm hakları saklıdır.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              ['KVKK Aydınlatma Metni', '/kvkk-aydinlatma-metni'],
              ['Gizlilik Politikası', '/gizlilik-politikasi'],
              ['Çerez Politikası', '/cerez-politikasi'],
              ['Kullanım Koşulları', '/kullanim-kosullari'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href!} className="underline-offset-4 hover:text-white hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
