export const serviceCategories = [
  { slug: 'boya-yuzey', name: 'Boya ve Yüzey İşlemleri', description: 'İç cephe boya, boya badana, dekoratif boya, alçı, sıva ve yüzey onarımı.' },
  { slug: 'ic-mekan', name: 'İç Mekân Tadilatı', description: 'Komple ev tadilatı, mutfak ve banyo yenileme, alçıpan, asma tavan ve dekorasyon.' },
  { slug: 'tesisat', name: 'Tesisat ve Teknik Hizmetler', description: 'Elektrik, sıhhi ve mekanik tesisat uygulamaları.' },
  { slug: 'zemin', name: 'Zemin ve Kaplama', description: 'Parke, seramik ve fayans uygulamaları.' },
  { slug: 'dis-cephe', name: 'Dış Cephe ve Yalıtım', description: 'Dış cephe boya, cephe yenileme, mantolama, yalıtım ve çatı işleri.' },
  { slug: 'kurumsal-insaat', name: 'Kurumsal İnşaat', description: 'Anahtar teslim inşaat, kat karşılığı, konut ve ticari yapı projeleri.' },
  { slug: 'yapi-muhendislik', name: 'Yapı ve Mühendislik', description: 'Güçlendirme, betonarme, çelik, altyapı ve projelendirme hizmetleri.' },
] as const;

/** Mevcut sitedeki hizmet sayfalarının (URL'leri korunarak) yeni kategorilere dağılımı. */
export const legacyServiceCategory: Record<string, string> = {
  'alci-siva': 'boya-yuzey',
  'ic-mekan-tadilati': 'ic-mekan',
  'ev-tadilati': 'ic-mekan',
  'ofis-tadilati': 'ic-mekan',
  'magaza-tadilati': 'ic-mekan',
  'otel-tadilati': 'ic-mekan',
  'elektrik-tesisati': 'tesisat',
  'mekanik-tesisat': 'tesisat',
  'sihhi-tesisat': 'tesisat',
  'seramik-fayans': 'zemin',
  'parke-zemin': 'zemin',
  'dis-cephe-kaplama': 'dis-cephe',
  'dis-cephe-yenileme': 'dis-cephe',
  mantolama: 'dis-cephe',
  'isi-yalitimi': 'dis-cephe',
  'su-yalitimi': 'dis-cephe',
  'ses-yalitimi': 'dis-cephe',
  'catt-yapimi': 'dis-cephe',
  'catt-tadilati': 'dis-cephe',
  'anahtar-teslim-insaat': 'kurumsal-insaat',
  'kat-karsiligi-insaat': 'kurumsal-insaat',
  'konut-insaati': 'kurumsal-insaat',
  'villa-insaati': 'kurumsal-insaat',
  'ticari-yapi-insaati': 'kurumsal-insaat',
  'fabrika-insaati': 'kurumsal-insaat',
  'kentsel-donusum': 'kurumsal-insaat',
  'insaat-danismanligi': 'kurumsal-insaat',
};

/** Yeni siteye taşınmayan (yönlendirilen) eski hizmet sayfaları. */
export const droppedLegacyServices = ['ic-dis-cephe-boya'];

/** Öne çıkan hizmetlerin sıralaması (kategori içinde). */
export const serviceOrder = [
  'ic-cephe-boyama', 'boya-badana', 'dekoratif-boya', 'duvar-onarimi', 'alci-siva',
  'ev-tadilati', 'mutfak-tadilati', 'banyo-tadilati', 'alcipan-asma-tavan', 'ev-dekorasyonu', 'ic-mekan-tadilati',
  'elektrik-tesisati', 'sihhi-tesisat', 'dis-cephe-boyama',
  'anahtar-teslim-insaat', 'kat-karsiligi-insaat', 'konut-insaati',
];

export const serviceImages: Record<string, { src: string; alt: string }> = {
  'ic-cephe-boyama': { src: '/images/site/modern-oturma-alani.jpg', alt: 'Açık renk boyanmış duvarları olan modern oturma alanı' },
  'boya-badana': { src: '/images/site/bos-oda-duvar.jpg', alt: 'Boyaya hazır, boş bir odanın duvarları ve penceresi' },
  'dekoratif-boya': { src: '/images/site/renk-kartelasi.jpg', alt: 'Yan yana açılmış renk kartelaları' },
  'duvar-onarimi': { src: '/images/site/duvar-boyama-uygulama.jpg', alt: 'Rulo ile duvar boyayan usta' },
  'alci-siva': { src: '/images/site/alci-siva-yuzey.jpg', alt: 'Düzgün uygulanmış açık renk sıva yüzeyi' },
  'ev-tadilati': { src: '/images/site/ev-ici-yenileme.jpg', alt: 'Yenilenmiş, ferah bir evin giriş ve oturma alanı' },
  'ic-mekan-tadilati': { src: '/images/site/tadilat-calismasi.jpg', alt: 'İç mekânda devam eden tadilat çalışması' },
  'mutfak-tadilati': { src: '/images/site/mutfak-beyaz-dolap.jpg', alt: 'Beyaz dolaplı, aydınlık modern mutfak' },
  'banyo-tadilati': { src: '/images/site/banyo-modern.jpg', alt: 'Serbest duran küvetli modern banyo' },
  'alcipan-asma-tavan': { src: '/images/site/ferah-beyaz-ic-mekan.jpg', alt: 'Beyaz tavan ve duvarlara sahip ferah iç mekân' },
  'ev-dekorasyonu': { src: '/images/site/ic-mekan-dekorasyon.jpg', alt: 'Açık renk duvarlar ve ahşap zeminle dekore edilmiş ev' },
  'elektrik-tesisati': { src: '/images/site/elektrik-priz-montaj.jpg', alt: 'Duvara priz montajı yapan elektrik ustası' },
  'dis-cephe-boyama': { src: '/images/projects/sancaktepe-atak-apartmani-1/sancaktepe-atak-apartmani-1-01.jpeg', alt: 'Dış cephesi tamamlanmış apartman' },
};

export const blogCategories = [
  { slug: 'ev-boyama', name: 'Ev Boyama', description: 'Daire boyama süreci, hazırlık ve planlama rehberleri.' },
  { slug: 'boya-fiyatlari', name: 'Boya Fiyatları', description: 'Ev boyama fiyatlarını etkileyen etkenler ve teklif süreci.' },
  { slug: 'boya-badana', name: 'Boya Badana', description: 'Boya badana uygulamaları, eşyalı ve boş ev boyama.' },
  { slug: 'ev-dekorasyonu', name: 'Ev Dekorasyonu', description: 'İç mekân dekorasyonu ve boya uyumu.' },
  { slug: 'ev-tadilati', name: 'Ev Tadilatı', description: 'Tadilat planlama, iş sırası ve yenileme rehberleri.' },
  { slug: 'ic-cephe', name: 'İç Cephe', description: 'İç cephe boyaları, astar ve yüzey hazırlığı.' },
  { slug: 'renk-rehberi', name: 'Renk Rehberi', description: 'Oda oda renk seçimi önerileri.' },
  { slug: 'insaat-ve-yapi', name: 'İnşaat ve Yapı', description: 'İnşaat, kentsel dönüşüm ve yapı rehberleri.' },
] as const;

export const legacyPostCategory: Record<string, string> = { 'ic-mekan-tadilat-rehberi': 'ev-tadilati' };

export const blogCovers: Record<string, { src: string; alt: string }> = {
  'ev-boyama': { src: '/images/site/duvar-boyama-uygulama.jpg', alt: 'Rulo ile duvar boyayan usta' },
  'boya-fiyatlari': { src: '/images/site/salon-acik-renk-koltuk.jpg', alt: 'Açık renk duvarlı salon ve beyaz koltuk' },
  'boya-badana': { src: '/images/site/bos-oda-duvar.jpg', alt: 'Boyaya hazır boş oda' },
  'ev-dekorasyonu': { src: '/images/site/dekorasyon-detay.jpg', alt: 'Beyaz duvar önünde sade dekorasyon detayı' },
  'ev-tadilati': { src: '/images/site/tadilat-calismasi.jpg', alt: 'İç mekânda tadilat çalışması' },
  'ic-cephe': { src: '/images/site/modern-oturma-alani.jpg', alt: 'Açık renk duvarlı modern oturma alanı' },
  'renk-rehberi': { src: '/images/site/renk-secimi-kartela.jpg', alt: 'Renk seçimi için açılmış boya kartelası' },
};

/** Yazıya özel kapaklar (kategori kapağının yerine geçer). */
export const postCovers: Record<string, { src: string; alt: string }> = {
  'salon-icin-boya-renkleri': { src: '/images/site/salon-beyaz-duvar.jpg', alt: 'Beyaz duvarlı aydınlık salon' },
  'kucuk-odalar-icin-renk-secimi': { src: '/images/site/yatak-odasi-beyaz.jpg', alt: 'Beyaz duvarlı küçük yatak odası' },
  'banyo-yenileme-plani': { src: '/images/site/banyo-modern.jpg', alt: 'Modern banyo' },
  'mutfak-tadilati-nasil-planlanir': { src: '/images/site/mutfak-beyaz-dolap.jpg', alt: 'Beyaz dolaplı modern mutfak' },
  'alci-sonrasi-boya-uygulamasi': { src: '/images/site/alci-siva-yuzey.jpg', alt: 'Alçı sıva yüzeyi' },
  'duvar-boyasi-turleri': { src: '/images/site/renk-kartelasi.jpg', alt: 'Renk kartelaları' },
  '1-1-daire-boyama-rehberi': { src: '/images/site/yemek-kosesi-beyaz-duvar.jpg', alt: 'Beyaz duvarlı küçük dairede yemek köşesi' },
  'ev-tadilatinda-is-sirasi': { src: '/images/site/ev-ici-yenileme.jpg', alt: 'Yenilenmiş ev içi' },
  'boya-ve-dekorasyon-uyumu': { src: '/images/site/ic-mekan-dekorasyon.jpg', alt: 'Açık renk duvarlı dekore edilmiş ev' },
};

/**
 * İlk kurulumda yayınlanan yazılar. Diğer yeni yazılar "İncelemede" durumunda eklenir ve
 * yönetim panelinden kontrol edilip onaylandıktan sonra yayınlanır.
 */
export const initiallyPublishedPosts = [
  'ev-boyama-fiyatlari-nasil-belirlenir',
  'ev-boyama-oncesi-hazirlik-rehberi',
  'esyali-ev-boyama-nasil-planlanir',
  'ic-cephe-boyasi-nasil-secilir',
  'salon-icin-boya-renkleri',
  'boya-oncesi-astar-gerekli-mi',
];

/**
 * Proje slug → görsel klasörü (eski sitedeki dosya adları korunur).
 * Güneş paneli, fabrika, alışveriş merkezi ve CNC tesisi projeleri işletmenin isteğiyle portföyden çıkarıldı;
 * eski adresleri /projeler sayfasına yönlendirilir (src/config/redirects.ts).
 */
export const projectImageFolders: Record<string, string> = {
  'sancaktepe-atak-apartmani-1': 'sancaktepe-atak-apartmani-1',
  'kadikoy-merdivenkoy-okay-apartmani': 'kadikoy-merdivenkoy-okay-apartmani',
  'quattro-istanbul-serifali': 'quattro-istanbul-serifali',
  'petrol-is-sendikasi-sube-binasi': 'petrol-is-gebze-subesi',
  'cambasi-kayak-merkezi': 'cambasi-kayak-merkezi',
};
export const projectOrder = Object.keys(projectImageFolders);
