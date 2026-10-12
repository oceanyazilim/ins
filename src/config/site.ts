/**
 * İşletme bilgilerinin varsayılanları. Canlı değerler veritabanındaki site_settings
 * tablosundan gelir ve yönetim panelinden (Ayarlar) değiştirilir; burası yalnızca
 * ilk kurulum (seed) ve veritabanında kayıt bulunmadığında kullanılan yedektir.
 */
export type OpeningHours = { days: string; dayCodes: string[]; opens: string | null; closes: string | null };

export type SiteSettings = {
  company: { name: string; legalName: string; foundingYear: number | null; description: string };
  contact: {
    /** E.164 biçiminde: +905330392221 */
    phone: string;
    /** Yalnızca rakam, ülke koduyla: 905330392221. Boşsa WhatsApp bağlantıları gösterilmez. */
    whatsapp: string;
    emails: string[];
  };
  address: { district: string; city: string; country: string; street: string; showStreet: boolean };
  hours: OpeningHours[];
  social: { instagram: string; facebook: string; linkedin: string; youtube: string; x: string };
  analytics: { ga4Id: string; gscVerification: string };
  announcement: string;
};

export const defaultSettings: SiteSettings = {
  company: {
    name: 'Ocean İnşaat',
    legalName: 'Ocean İnşaat Taahhüt ve Ticaret',
    foundingYear: 2014,
    description:
      'Ocean İnşaat; Sancaktepe merkezli olarak ev boyama, boya badana ve tadilat hizmetleri ile konut, enerji ve turizm projelerinde uygulama, taşeronluk ve proje koordinasyonu hizmetleri sunar.',
  },
  contact: {
    phone: '+905330392221',
    whatsapp: '905330392221',
    emails: ['destek@oceaninsaat.com.tr', 'info@oceaninsaat.com.tr'],
  },
  address: { district: 'Sancaktepe', city: 'İstanbul', country: 'TR', street: '', showStreet: false },
  hours: [
    { days: 'Pazartesi – Cuma', dayCodes: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:30' },
    { days: 'Cumartesi', dayCodes: ['Saturday'], opens: '10:00', closes: '15:00' },
    { days: 'Pazar', dayCodes: ['Sunday'], opens: null, closes: null },
  ],
  social: {
    instagram: 'https://instagram.com/oceaninsaat',
    facebook: 'https://facebook.com/oceaninsaat',
    linkedin: 'https://linkedin.com/company/oceaninsaat',
    youtube: 'https://youtube.com/@oceaninsaat',
    x: 'https://x.com/oceaninsaat',
  },
  analytics: { ga4Id: '', gscVerification: '' },
  announcement: 'Sancaktepe ve yakın çevresinde profesyonel ev boyama',
};

/** Hiçbir koşulda hizmet bölgesi olarak tanımlanamayacak adlar (slug biçiminde). */
export const EXCLUDED_AREA_SLUGS: readonly string[] = ['sultanbeyli'];

/** KVKK aydınlatma metni sürümü; metin değiştiğinde artırılır ve rıza kayıtlarına yazılır. */
export const KVKK_TEXT_VERSION = '2026-10';
