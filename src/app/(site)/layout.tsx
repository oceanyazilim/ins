import { FileText, MessageCircle, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Footer } from '@/components/site/footer';
import { Header } from '@/components/site/header';
import { SiteClient } from '@/components/site/site-client';
import { buildNavigation, footerServiceLinks } from '@/config/navigation';
import { formatPhone, whatsappUrl } from '@/lib/format';
import { JsonLdScript, SITE_URL } from '@/seo';
import { businessSchema, websiteSchema } from '@/seo/schema';
import { areaPath, getActiveAreas, getAreaPages, getPackages, getSettings } from '@/server/data';

// Yönetim panelindeki değişiklikler revalidatePath ile anında yansır; bu süre yalnızca emniyet payıdır.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return s.analytics.gscVerification ? { verification: { google: s.analytics.gscVerification } } : {};
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, packages, areas, areaPages] = await Promise.all([getSettings(), getPackages(), getActiveAreas(), getAreaPages()]);
  const { contact } = settings;
  const phoneDisplay = formatPhone(contact.phone);
  const nav = buildNavigation(packages, areas);

  return (
    <div className="has-floating-bar-wrapper flex min-h-dvh flex-col">
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-(--z-toast) focus:rounded-full focus:bg-navy-900 focus:px-5 focus:py-3 focus:text-white"
      >
        İçeriğe geç
      </a>

      {/* Bilgi çubuğu */}
      <div className="on-dark hidden bg-navy-900 text-white md:block">
        <div className="container-page flex h-10 items-center justify-between gap-4 text-[0.8125rem]">
          <p className="truncate text-white/85">{settings.announcement}</p>
          <div className="hidden shrink-0 items-center gap-5 md:flex">
            <a href={`tel:${contact.phone}`} data-event="click_phone" data-event-location="utility" className="flex items-center gap-1.5 font-semibold hover:underline">
              <Phone aria-hidden className="size-3.5" />
              {phoneDisplay}
            </a>
            <Link href="/teklif-al" className="font-semibold text-[#8cc4f0] hover:underline">
              Teklif Al
            </Link>
          </div>
        </div>
      </div>

      <Header nav={nav} phone={contact.phone} phoneDisplay={phoneDisplay} />

      <main id="icerik" className="flex-1 pb-18 lg:pb-0">
        {children}
      </main>

      <Footer settings={settings} services={footerServiceLinks} areas={areaPages.map((a) => ({ label: `${a.name} Ev Boyama`, href: areaPath(a.slug) }))} />

      {/* Mobil sabit iletişim çubuğu: tek satır, içerik için altta boşluk ayrılır */}
      <nav
        aria-label="Hızlı iletişim"
        className="no-print fixed inset-x-0 bottom-0 z-(--z-floating) border-t border-line bg-white/96 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className={`grid ${contact.whatsapp ? 'grid-cols-3' : 'grid-cols-2'} divide-x divide-line`}>
          <li>
            <a href={`tel:${contact.phone}`} data-event="click_phone" data-event-location="floating" className="flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-navy-900">
              <Phone aria-hidden className="size-5 text-ocean-600" />
              Ara
            </a>
          </li>
          {contact.whatsapp && (
            <li>
              <a
                href={whatsappUrl(contact.whatsapp, 'Merhaba Ocean İnşaat, ev boyama hizmetiniz hakkında bilgi almak istiyorum.')}
                rel="noopener noreferrer"
                target="_blank"
                data-event="click_whatsapp"
                data-event-location="floating"
                className="flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-navy-900"
              >
                <MessageCircle aria-hidden className="size-5 text-whatsapp" />
                WhatsApp
              </a>
            </li>
          )}
          <li>
            <Link href="/teklif-al" className="flex h-16 flex-col items-center justify-center gap-1 bg-navy-900 text-xs font-semibold text-white">
              <FileText aria-hidden className="size-5" />
              Teklif Al
            </Link>
          </li>
        </ul>
      </nav>

      <SiteClient ga4Id={settings.analytics.ga4Id} />
      <JsonLdScript data={[businessSchema(SITE_URL, settings, areas.map((a) => a.name)), websiteSchema(SITE_URL, settings)]} />
    </div>
  );
}
