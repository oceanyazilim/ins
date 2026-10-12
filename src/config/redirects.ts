/**
 * Eski siteden ve önerilen alternatif adreslerden kalıcı (308) yönlendirmeler.
 * Tek atlamalı olmalı: hedef asla başka bir kaynağa işaret etmez (tests/redirects.test.ts doğrular).
 * Yönetim panelinden eklenen kurallar veritabanında tutulur (redirect_rules).
 */
export type StaticRedirect = { source: string; destination: string; reason: string };

export const staticRedirects: StaticRedirect[] = [
  { source: '/teklif-formu', destination: '/teklif-al', reason: 'Eski teklif formu → yeni çok adımlı teklif sistemi' },
  { source: '/hizmetler/ic-dis-cephe-boya', destination: '/hizmetler/ic-cephe-boyama', reason: 'Birleşik boya sayfası iç/dış cephe olarak ayrıldı' },
  { source: '/hakkimizda', destination: '/kurumsal', reason: 'Mevcut kurumsal URL korunuyor' },
  { source: '/projelerimiz', destination: '/projeler', reason: 'Mevcut proje arşivi URL’si korunuyor' },
  { source: '/projelerimiz/:slug', destination: '/projeler/:slug', reason: 'Mevcut proje URL’leri korunuyor' },
  { source: '/hizmetler/komple-ev-tadilati', destination: '/hizmetler/ev-tadilati', reason: 'Mevcut ev tadilatı URL’si korunuyor' },
  { source: '/hizmetler/su-tesisati', destination: '/hizmetler/sihhi-tesisat', reason: 'Mevcut sıhhi tesisat URL’si korunuyor' },
  { source: '/hizmetler/parke-doseme', destination: '/hizmetler/parke-zemin', reason: 'Mevcut parke/zemin URL’si korunuyor' },
  { source: '/projeler/avrupa-temper-3-2-mw-ges', destination: '/projeler', reason: 'Proje portföyden çıkarıldı' },
  { source: '/projeler/genpark-conax-fabrikasi', destination: '/projeler', reason: 'Proje portföyden çıkarıldı' },
  { source: '/projeler/city-avm-projesi', destination: '/projeler', reason: 'Proje portföyden çıkarıldı' },
  { source: '/projeler/yg1-cnc-uretim-tesisi', destination: '/projeler', reason: 'Proje portföyden çıkarıldı' },
  { source: '/fiyatlar', destination: '/boya-fiyatlari', reason: 'Kısa adres' },
  { source: '/ev-boyama-fiyatlari', destination: '/boya-fiyatlari', reason: 'Alternatif yazım' },
  { source: '/teklif', destination: '/teklif-al', reason: 'Kısa adres' },
];
