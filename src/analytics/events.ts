/**
 * Ölçüm olayları. Olaylar yalnızca kullanıcı analitik çerezlerine izin verdiyse ve GA4 kimliği
 * tanımlıysa gönderilir. Birincil dönüşüm: complete_quote. İkincil: click_phone, click_whatsapp.
 */
export type AnalyticsEvent =
  | 'view_painting_service'
  | 'view_pricing'
  | 'select_painting_package'
  | 'start_quote'
  | 'quote_step'
  | 'abandon_quote'
  | 'complete_quote'
  | 'click_phone'
  | 'click_whatsapp'
  | 'view_local_service'
  | 'submit_contact_form';

export const CONSENT_KEY = 'ocean_consent_v1';
export type Consent = 'granted' | 'denied';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

const sent = new Set<string>();

/**
 * @param dedupeKey Verilirse aynı anahtarla olay sayfa oturumu boyunca yalnızca bir kez gönderilir
 *                  (yeniden render ve çift tıklama kaynaklı tekrar kayıtları önler).
 */
export function track(event: AnalyticsEvent, params: Record<string, string | number | undefined> = {}, dedupeKey?: string): void {
  if (typeof window === 'undefined') return;
  if (dedupeKey) {
    const key = `${event}:${dedupeKey}`;
    if (sent.has(key)) return;
    sent.add(key);
  }
  if (getConsent() !== 'granted' || typeof window.gtag !== 'function') return;
  window.gtag('event', event, params);
}

const UTM_KEY = 'ocean_attr_v1';
export type Attribution = { landingPage?: string; referrer?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string };

/** İlk giriş sayfası ve kampanya parametreleri; yalnızca sekme oturumunda (sessionStorage) tutulur. */
export function captureAttribution(): void {
  try {
    if (sessionStorage.getItem(UTM_KEY)) return;
    const q = new URLSearchParams(location.search);
    const ref = document.referrer && !document.referrer.startsWith(location.origin) ? new URL(document.referrer).hostname : undefined;
    const data: Attribution = {
      landingPage: location.pathname.slice(0, 255),
      referrer: ref,
      utmSource: q.get('utm_source')?.slice(0, 120) || undefined,
      utmMedium: q.get('utm_medium')?.slice(0, 120) || undefined,
      utmCampaign: q.get('utm_campaign')?.slice(0, 120) || undefined,
    };
    sessionStorage.setItem(UTM_KEY, JSON.stringify(data));
  } catch {
    /* depolama kapalıysa ilişkilendirme yapılmaz */
  }
}

export function readAttribution(): Attribution {
  try {
    return JSON.parse(sessionStorage.getItem(UTM_KEY) ?? '{}') as Attribution;
  } catch {
    return {};
  }
}
