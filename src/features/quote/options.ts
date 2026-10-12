export const SERVICE_TYPES = [
  { value: 'ev-boyama', label: 'Ev Boyama' },
  { value: 'boya-badana', label: 'Boya Badana' },
  { value: 'komple-tadilat', label: 'Komple Tadilat' },
  { value: 'mutfak-tadilati', label: 'Mutfak Tadilatı' },
  { value: 'banyo-tadilati', label: 'Banyo Tadilatı' },
  { value: 'elektrik-tesisati', label: 'Elektrik Tesisatı' },
  { value: 'su-tesisati', label: 'Su Tesisatı' },
  { value: 'diger', label: 'Diğer' },
] as const;

/** Paket fiyatı yalnızca veritabanında aktif paketi olan daire tipleri için gösterilir. */
export const ROOM_TYPES = ['1+1', '2+1', '3+1', '4+1', 'Diğer'] as const;

export const SCOPE_OPTIONS = [
  { value: 'duvar-boya', label: 'Duvar boya' },
  { value: 'tavan-boya', label: 'Tavan boya' },
  { value: 'yuzey-onarimi', label: 'Yüzey onarımı' },
  { value: 'renk-degisimi', label: 'Renk değişimi' },
  { value: 'dekoratif-islem', label: 'Ek dekoratif işlem' },
  { value: 'diger', label: 'Diğer' },
] as const;

export const PROPERTY_STATES = [
  { value: 'bos', label: 'Boş' },
  { value: 'esyali', label: 'Eşyalı' },
  { value: 'yeni-yapi', label: 'Yeni yapı' },
  { value: 'kullanimda', label: 'Kullanımda' },
  { value: 'diger', label: 'Diğer' },
] as const;

export const CONTACT_PREFERENCES = [
  { value: 'telefon', label: 'Telefon' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'e-posta', label: 'E-posta' },
] as const;

export const PAINTING_SERVICES: readonly string[] = ['ev-boyama', 'boya-badana'];

export const LEAD_STATUSES = [
  { value: 'new', label: 'Yeni' },
  { value: 'contacted', label: 'İletişime geçildi' },
  { value: 'survey_pending', label: 'Keşif bekliyor' },
  { value: 'quote_sent', label: 'Teklif gönderildi' },
  { value: 'won', label: 'Kazanıldı' },
  { value: 'lost', label: 'Kaybedildi' },
  { value: 'completed', label: 'Tamamlandı' },
] as const;

export const labelOf = (list: readonly { value: string; label: string }[], v: string | null | undefined) =>
  list.find((o) => o.value === v)?.label ?? v ?? '—';

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const PHOTO_MIMES: readonly string[] = ['image/jpeg', 'image/png', 'image/webp'];
