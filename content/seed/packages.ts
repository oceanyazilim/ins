import type { QA, ScopeItem } from '../../src/db/schema';

/**
 * İlan edilen paket fiyatlarının ilk kurulum değerleri. Canlı fiyatlar veritabanındadır ve
 * yalnızca yönetim panelinden (Boya Fiyatları) değiştirilir; kodun başka hiçbir yerinde fiyat yazılmaz.
 */
export type SeedPackage = {
  slug: string;
  roomType: string;
  name: string;
  price: number;
  summary: string;
  description: string;
  body: string;
  faqs: QA[];
  metaTitle: string;
  metaDescription: string;
};

/**
 * Henüz işletme tarafından doğrulanmamış kapsam başlıkları. included: null → sitede
 * "teklif aşamasında netleşir" olarak gösterilir; doğrulandıkça panelden dahil / dahil değil yapılır.
 */
export const defaultScopeItems: ScopeItem[] = [
  { label: 'Boya malzemesi ve marka tercihi', included: null },
  { label: 'Tavan boyası', included: null },
  { label: 'Uygulanacak kat sayısı', included: null },
  { label: 'Duvar onarımı, macun ve yüzey hazırlığı', included: null },
  { label: 'Eşyalı dairede koruma ve eşya düzeni', included: null },
  { label: 'Uygulama süresi ve takvim', included: null },
  { label: 'KDV', included: null },
];

export const defaultScopeNote =
  'Paket fiyatı ilan edilen başlangıç fiyatıdır. İşin kapsamı ve nihai teklif, dairenin durumu değerlendirildikten sonra yazılı olarak netleşir.';

export const seedPackages: SeedPackage[] = [
  {
    slug: '1-1-daire-boyama',
    roomType: '1+1',
    name: '1+1 Ev Boyama',
    price: 25000,
    summary: 'Tek yatak odalı daireler, stüdyo büyüklüğündeki evler ve yatırım amaçlı küçük daireler için.',
    description:
      '1+1 daireler metrekare olarak küçük olsa da salon, yatak odası, mutfak, banyo ve hol gibi birbirinden farklı yüzeyleri bir arada barındırır. Paket, bu daire tipinde ev boyama hizmeti almak isteyenler için ilan edilen başlangıç fiyatını gösterir.',
    body: `## 1+1 daire boyamada işi belirleyen etkenler

Küçük dairelerde boyanacak duvar alanı sınırlıdır; buna karşılık köşe, kapı kasası, pencere çevresi ve dolap arkası gibi detay isteyen noktaların toplam işe oranı yüksektir. Bu yüzden 1+1 dairelerde işin süresini ve emeğini metrekareden çok yüzeyin durumu ve dairenin eşyalı olup olmadığı belirler.

- **Kiracı değişimi öncesi yenileme:** Boş dairede çivi delikleri, askı izleri ve mobilya sürtünmeleri en sık karşılaşılan kusurlardır. Bunların onarımı teklif aşamasında ayrıca değerlendirilir.
- **Açık mutfaklı planlar:** Salonla birleşik mutfaklarda yağ ve buhar etkisiyle sararmış yüzeyler görülebilir; bu yüzeyler boyadan önce uygun şekilde temizlenmeli ve gerekirse astarlanmalıdır.
- **Renk değişimi:** Koyu bir renkten açık tona dönülecekse daha fazla hazırlık gerekebilir. Mevcut ve istenen rengi teklif formunda belirtmeniz değerlendirmeyi hızlandırır.

## Bu paket kimler için uygun?

Kendi oturduğu evi yenilemek isteyenler, dairesini kiraya vermeden ya da satışa çıkarmadan önce toparlamak isteyen ev sahipleri ve taşınmadan önce temiz bir başlangıç yapmak isteyen kiracılar bu paketi tercih eder. Daire tipiniz 1+1 olmakla birlikte tavan yüksekliği, galeri katı veya geniş teras duvarı gibi standart dışı özellikler varsa bunu talebinizde belirtin; kapsam buna göre değerlendirilir.

## Teklif öncesinde hazırlamanız iyi olur

1. Dairenin boş mu eşyalı mı olduğu bilgisi
2. Duvarlardaki belirgin çatlak, kabarma veya nem izlerinin birkaç fotoğrafı
3. Düşündüğünüz renkler ya da mevcut rengin korunup korunmayacağı
4. Uygulama için uygun olduğunuz tarih aralığı`,
    faqs: [
      { q: '1+1 ev boyama fiyatı ne kadar?', a: 'Ocean İnşaat’ın 1+1 daireler için ilan ettiği ev boyama paket fiyatı bu sayfada gösterilen tutardır. Nihai teklif, dairenin durumu ve istenen kapsam değerlendirildikten sonra netleşir.' },
      { q: 'Stüdyo (1+0) daireler bu pakete girer mi?', a: 'Stüdyo daireler için ayrı bir paket ilan edilmemiştir. Daire bilgilerinizi teklif formundan iletmeniz hâlinde kapsam değerlendirilerek size özel teklif hazırlanır.' },
      { q: 'Eşyalı 1+1 daire boyanabilir mi?', a: 'Evet. Eşyalı dairelerde eşyaların korunması ve çalışma düzeni önceden planlanır. Eşya yoğunluğu işin süresini ve kapsamını etkileyebildiği için teklif aşamasında ayrıca değerlendirilir.' },
      { q: 'Tek bir odayı boyatmak istersem ne olur?', a: 'Kısmi boyama talepleri paket kapsamında değil, ayrı bir iş olarak değerlendirilir. Teklif formunda “Boya Badana” hizmetini seçip ihtiyacınızı açıklayabilirsiniz.' },
    ],
    metaTitle: '1+1 Ev Boyama Fiyatı ve Daire Boyama Hizmeti',
    metaDescription:
      '1+1 daireler için Ocean İnşaat ev boyama paketi: ilan edilen fiyat, işi etkileyen etkenler ve teklif süreci. Sancaktepe ve çevresinde hizmet.',
  },
  {
    slug: '2-1-daire-boyama',
    roomType: '2+1',
    name: '2+1 Ev Boyama',
    price: 30000,
    summary: 'İki yatak odalı aile daireleri için; en sık talep edilen daire boyama paketi.',
    description:
      '2+1 daireler, çocuklu aileler ve evden çalışanlar için en yaygın konut tipidir. Odaların farklı amaçlarla kullanılması, her oda için farklı renk ve yüzey beklentisini beraberinde getirir. Paket, bu daire tipi için ilan edilen başlangıç fiyatını gösterir.',
    body: `## 2+1 dairelerde planlama neden önemli?

2+1 daireler çoğunlukla içinde yaşanırken boyanır. Bu, işin tekniği kadar sırasının da iyi planlanmasını gerektirir: hangi odadan başlanacağı, eşyaların nereye toplanacağı ve ailenin uygulama sırasında evi nasıl kullanacağı baştan konuşulmalıdır.

- **Oda oda ilerleme:** Eşyalı evlerde odalar sırayla boşaltılıp boyanarak günlük yaşamın tamamen durması önlenebilir.
- **Çocuk odası:** Silinebilir yüzey beklentisi, duvar çıkartması izleri ve kalem lekeleri bu odalarda sık görülür. Renk ve boya türü tercihinizi teklif aşamasında belirtin.
- **Koridor ve hol:** En çok temas alan, en hızlı kirlenen yüzeylerdir; evin geri kalanından farklı bir yüzey tercihi düşünülebilir.

## Renk seçimi

İki yatak odalı bir evde tek bir açık ton tüm mekânı bütünleştirir; odalara özel renkler ise her alana kendi karakterini verir. Kararsızsanız salon ve koridoru aynı tonda tutup odalarda değişiklik yapmak dengeli bir başlangıçtır. Renk kararı için [salon için boya renkleri](/blog/salon-icin-boya-renkleri) rehberine göz atabilirsiniz.

## Bu paketin dışında kalabilecek durumlar

Geniş balkon ve teras duvarları, yüksek tavanlı dubleks planlar, yoğun rutubet veya dökülen sıva gibi yüzey sorunları standart bir daire boyamasının ötesinde çalışma gerektirebilir. Böyle bir durum varsa talebinizde fotoğrafla paylaşmanız, teklifin gerçekçi hazırlanmasını sağlar.`,
    faqs: [
      { q: '2+1 daire boyama fiyatı nedir?', a: 'Ocean İnşaat’ın 2+1 daireler için ilan ettiği ev boyama paket fiyatı bu sayfada gösterilen tutardır. Nihai teklif, dairenin durumu ve istenen kapsam değerlendirildikten sonra netleşir.' },
      { q: 'Evde yaşarken 2+1 daire boyanabilir mi?', a: 'Evet, çoğu 2+1 daire içinde yaşanırken boyanır. Odaların sırası ve eşya düzeni uygulama öncesinde birlikte planlanır.' },
      { q: 'Her odaya farklı renk seçebilir miyim?', a: 'Renk tercihlerinizi teklif formunda ya da görüşme sırasında iletebilirsiniz. Birden fazla renk kullanımının kapsama etkisi teklif aşamasında netleştirilir.' },
      { q: 'Balkon ve dış duvarlar pakete dahil mi?', a: 'Paket iç mekân boyamasına yöneliktir. Balkon, teras veya dış cephe yüzeyleri için ihtiyacınızı belirtmeniz hâlinde ayrıca değerlendirme yapılır.' },
    ],
    metaTitle: '2+1 Ev Boyama Fiyatı ve Daire Boyama Hizmeti',
    metaDescription:
      '2+1 daireler için Ocean İnşaat ev boyama paketi: ilan edilen fiyat, eşyalı evde planlama, renk seçimi ve teklif süreci hakkında bilgi alın.',
  },
  {
    slug: '3-1-daire-boyama',
    roomType: '3+1',
    name: '3+1 Ev Boyama',
    price: 35000,
    summary: 'Üç yatak odalı geniş daireler için; oda sayısı ve yüzey alanı fazla olan evlere yönelik paket.',
    description:
      '3+1 dairelerde oda sayısı, koridor uzunluğu ve çoğu zaman ikinci banyo ile ebeveyn bölümü, boyanacak yüzeyi belirgin biçimde artırır. Paket, bu daire tipi için ilan edilen başlangıç fiyatını gösterir.',
    body: `## 3+1 dairelerde kapsamı ne büyütür?

Geniş dairelerde iş yalnızca “bir oda fazla” demek değildir. Uzun koridorlar, giyinme bölümleri, kiler ve ikinci ıslak hacim gibi alanlar toplam yüzeyi artırır; eşya miktarı da buna paralel olarak fazladır.

- **Ebeveyn bölümü ve giyinme odası:** Dolap içleri ve arkaları boyanacaksa bunu baştan belirtin.
- **İki ayrı ıslak hacim:** Banyo ve tuvalet tavanlarında nem kaynaklı kabarma görülebilir; bu yüzeyler boyadan önce ayrıca ele alınmalıdır.
- **Geniş salon:** Büyük ve kesintisiz duvarlarda yüzey düzgünlüğü daha çok göze çarpar; ışığın yandan vurduğu duvarlardaki dalgalanmalar için ek yüzey hazırlığı gerekebilir.

## Uygulamayı aşamalara bölmek

Üç odalı bir evde tüm eşyayı aynı anda toplamak zordur. Uygulama çoğu durumda bölümlere ayrılır: önce yatak odaları, ardından ortak alanlar gibi. Hangi sıranın sizin için uygun olduğu teklif görüşmesinde belirlenir. Hazırlık adımları için [ev boyama öncesi hazırlık rehberini](/blog/ev-boyama-oncesi-hazirlik-rehberi) inceleyebilirsiniz.

## Boyayla birlikte düşünülen işler

Geniş dairelerde boya çoğu zaman daha kapsamlı bir yenilemenin parçasıdır. Kartonpiyer, [alçı ve sıva onarımı](/hizmetler/alci-siva), priz ve anahtar yenileme ya da [komple ev tadilatı](/hizmetler/ev-tadilati) düşünüyorsanız bunları aynı talepte belirtmeniz iş sırasının doğru kurulmasını sağlar.`,
    faqs: [
      { q: '3+1 ev boyama fiyatı ne kadar?', a: 'Ocean İnşaat’ın 3+1 daireler için ilan ettiği ev boyama paket fiyatı bu sayfada gösterilen tutardır. Nihai teklif, dairenin durumu ve istenen kapsam değerlendirildikten sonra netleşir.' },
      { q: '4+1 veya dubleks daireler için fiyat var mı?', a: '4+1, dubleks ve daha büyük konutlar için ilan edilmiş bir paket fiyatı yoktur. Bu daire tipleri için bilgilerinizi iletmeniz hâlinde kapsam değerlendirilerek özel teklif hazırlanır.' },
      { q: 'Dolap arkaları ve içleri boyanır mı?', a: 'Sabit dolapların arkası ve içi standart olarak varsayılmaz. İstiyorsanız teklif formunda belirtin; kapsam buna göre netleştirilir.' },
      { q: 'Boya ile birlikte tadilat da yaptırabilir miyim?', a: 'Evet. Ocean İnşaat boya dışında alçı, tesisat, zemin ve tadilat hizmetleri de sunar. İhtiyaçlarınızı tek talepte iletirseniz işler doğru sırayla planlanır.' },
    ],
    metaTitle: '3+1 Ev Boyama Fiyatı ve Daire Boyama Hizmeti',
    metaDescription:
      '3+1 daireler için Ocean İnşaat ev boyama paketi: ilan edilen fiyat, geniş dairelerde kapsamı etkileyen etkenler ve aşamalı uygulama planı.',
  },
];
