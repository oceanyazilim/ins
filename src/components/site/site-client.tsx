'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';
import { captureAttribution, CONSENT_KEY, getConsent, track, type AnalyticsEvent, type Consent } from '@/analytics/events';
import { buttonClass } from '@/components/ui/button';

const CONSENT_EVENT = 'ocean:consent';
function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function loadGa(id: string) {
  if (document.getElementById('ga4-src')) return;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, { anonymize_ip: true });
  const s = document.createElement('script');
  s.id = 'ga4-src';
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}

/**
 * Sitenin tek küresel istemci bileşeni:
 *  - [data-reveal] öğelerini tek bir IntersectionObserver ile görünür yapar (scroll listener yok),
 *  - [data-event] taşıyan bağlantıların tıklamalarını ölçer,
 *  - çerez tercihi alınana kadar analitik yüklemez.
 */
export function SiteClient({ ga4Id }: { ga4Id: string }) {
  const pathname = usePathname();
  // Tercih tarayıcı deposundan okunur; sunucu çıktısında (ve hidrasyonda) bilinmiyor kabul edilir.
  const consent = useSyncExternalStore<Consent | null | 'unknown'>(subscribeConsent, getConsent, () => 'unknown');

  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    if (consent === 'granted' && ga4Id) loadGa(ga4Id);
  }, [consent, ga4Id]);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-event]');
      if (!el) return;
      track(el.dataset.event as AnalyticsEvent, { location: el.dataset.eventLocation, label: el.dataset.eventLabel });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const decide = (value: Consent) => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* tercih saklanamazsa oturum boyunca geçerli olur */
    }
    window.dispatchEvent(new Event(CONSENT_EVENT));
  };

  // Analitik tanımlı değilse izin istenecek bir çerez yoktur; bant gösterilmez.
  if (!ga4Id || consent !== null) return null;

  return (
    <div
      role="region"
      aria-label="Çerez tercihi"
      className="no-print fixed inset-x-3 bottom-20 z-(--z-toast) mx-auto max-w-xl rounded-(--radius-lg) border border-line bg-white p-5 shadow-(--shadow-lift) lg:bottom-6 lg:left-6 lg:right-auto lg:mx-0"
    >
      <p className="text-sm text-ink">
        Sitenin çalışması için gerekli çerezler dışında, yalnızca izin verirseniz ziyaret istatistikleri için analitik çerezler kullanırız.{' '}
        <Link href="/cerez-politikasi" className="text-link">
          Çerez Politikası
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => decide('granted')} className={buttonClass('primary', 'sm')}>
          Kabul et
        </button>
        <button type="button" onClick={() => decide('denied')} className={buttonClass('outline', 'sm')}>
          Reddet
        </button>
      </div>
    </div>
  );
}

/** Sayfa görüntüleme türündeki olaylar için (ör. view_pricing). Yol başına bir kez gönderilir. */
export function TrackView({ event, label }: { event: AnalyticsEvent; label?: string }) {
  const pathname = usePathname();
  useEffect(() => {
    track(event, { label, path: pathname }, pathname);
  }, [event, label, pathname]);
  return null;
}
