import type { AreaSection, QA } from '../../src/db/schema';

export type SeedArea = {
  slug: string;
  name: string;
  tier: 'primary' | 'secondary';
  active: boolean;
  pagePublished: boolean;
  isHub?: boolean;
  h1?: string;
  lead?: string;
  summary?: string;
  sections?: AreaSection[];
  faqs?: QA[];
  neighborhoods?: string[];
  metaTitle?: string;
  metaDescription?: string;
};

/**
 * Hizmet bölgelerinin ilk kurulum verisi.
 * - Sultanbeyli ve Avrupa Yakası ilçeleri bilinçli olarak yoktur ve eklenemez (EXCLUDED_AREA_SLUGS).
 * - active: false olan ilçeler sitede hiçbir yerde görünmez; panelden etkinleştirilebilir.
 * - Lokasyon sayfaları yalnızca o ilçeye özgü içerik yazıldığında (pagePublished) yayınlanır.
 */
export const seedAreas: SeedArea[] = [
  {
    slug: 'sancaktepe',
    name: 'Sancaktepe',
    tier: 'primary',
    active: true,
    pagePublished: true,
    isHub: true,
    h1: 'Sancaktepe Ev Boyama ve Boya Badana Hizmetleri',
    lead: 'Ocean İnşaat’ın merkezi Sancaktepe’dedir. İlçedeki daireler için ev boyama, boya badana ve iç mekân yenileme taleplerini doğrudan merkezimizden planlıyoruz.',
    summary: 'Merkezimizin bulunduğu ilçe. Sarıgazi, Samandıra ve Yenidoğan dahil Sancaktepe genelinde ev boyama.',
    neighborhoods: ['Sarıgazi', 'Samandıra', 'Yenidoğan'],
    sections: [
      {
        heading: 'Sancaktepe’de ev boyama hizmeti',
        body: `Sancaktepe, son yirmi yılda hızla büyüyen ve konut dokusu birbirinden çok farklı yapılardan oluşan bir ilçedir. Samandıra tarafında yeni yapılmış siteler ve rezidans tipi daireler ağırlıktayken, Sarıgazi ve Yenidoğan çevresinde daha eski, müstakil girişli apartmanlar yaygındır. Bu fark, boya işinin niteliğini doğrudan etkiler.

Yeni binalarda genellikle yüzey düzgündür ve iş, mevcut rengin yenilenmesi ya da renk değişimiyle sınırlı kalır. Daha eski apartmanlarda ise önceki boya katmanlarının kabarması, sıva çatlakları ve yer yer nem izleri görülebilir; bu durumda boyadan önce [duvar onarımı ve yüzey hazırlığı](/hizmetler/duvar-onarimi) gündeme gelir. Hangi durumun sizin daireniz için geçerli olduğu, paylaşacağınız fotoğraflar ve gerekirse yerinde değerlendirme ile belirlenir.`,
      },
      {
        heading: 'Merkezimizin Sancaktepe’de olması ne sağlar?',
        body: `Ocean İnşaat Sancaktepe merkezli çalışır. İlçe içindeki talepler için yerinde değerlendirme randevusu ve uygulama takvimi, diğer bölgelere kıyasla daha esnek planlanabilir. Aynı sebeple, uygulama sonrasında ortaya çıkan küçük bir rötuş ihtiyacında da iletişim ve ulaşım kolaydır.

Sancaktepe’de daha önce görev aldığımız yapı işleri arasında konut projeleri de bulunur; [projelerimiz](/projeler) sayfasında bu çalışmalardan örnekleri inceleyebilirsiniz.`,
      },
      {
        heading: 'Sarıgazi, Samandıra ve Yenidoğan',
        body: `- **Sarıgazi:** İlçenin en eski yerleşim alanlarından biridir. Yaşı ilerlemiş dairelerde boya çoğu zaman alçı tamiri ve tavan badanasıyla birlikte ele alınır.
- **Samandıra:** Site içi dairelerde yönetimin belirlediği çalışma saatleri, asansör kullanımı ve malzeme taşıma kuralları uygulama planına dahil edilir. Site yönetiminizin kurallarını talep sırasında iletmeniz planlamayı kolaylaştırır.
- **Yenidoğan:** Aile apartmanları ve müstakil yapılar yaygındır; birden fazla dairenin ya da merdiven boşluğunun birlikte boyanması gibi talepler ayrıca değerlendirilir.`,
      },
    ],
    faqs: [
      { q: 'Sancaktepe’nin hangi mahallelerine hizmet veriyorsunuz?', a: 'Sarıgazi, Samandıra ve Yenidoğan başta olmak üzere Sancaktepe ilçesi genelinde hizmet veriyoruz. Adresinizi teklif formunda belirtmeniz yeterlidir.' },
      { q: 'Sancaktepe’de ev boyama fiyatları farklı mı?', a: 'Hayır. İlan edilen 1+1, 2+1 ve 3+1 paket fiyatları hizmet verdiğimiz bütün bölgelerde aynıdır. Nihai teklif dairenin durumuna göre netleşir.' },
      { q: 'Site içinde oturuyorum, çalışma saatleri sorun olur mu?', a: 'Site yönetimlerinin çalışma saati ve asansör kullanımı kurallarına uyulur. Bu kuralları talep sırasında bildirmeniz, takvimin doğru kurulmasını sağlar.' },
      { q: 'Boya dışında tadilat da yapıyor musunuz?', a: 'Evet. Alçı ve sıva, tesisat, zemin kaplama ve komple ev tadilatı gibi işler de Ocean İnşaat’ın hizmetleri arasındadır.' },
    ],
    metaTitle: 'Sancaktepe Ev Boyama ve Boyacı Hizmeti | Ocean İnşaat',
    metaDescription:
      'Sancaktepe merkezli Ocean İnşaat ile ev boyama ve boya badana. Sarıgazi, Samandıra, Yenidoğan ve çevresi için 1+1, 2+1, 3+1 daire boyama fiyatlarını inceleyin.',
  },
  {
    slug: 'cekmekoy',
    name: 'Çekmeköy',
    tier: 'primary',
    active: true,
    pagePublished: true,
    h1: 'Çekmeköy Ev Boyama ve Boya Badana',
    lead: 'Sancaktepe’ye komşu Çekmeköy, Ocean İnşaat’ın öncelikli hizmet bölgelerindendir. Site daireleri, az katlı konutlar ve villalar için boya taleplerini değerlendiriyoruz.',
    summary: 'Site daireleri, az katlı konutlar ve villa tipi evler için ev boyama ve boya badana.',
    neighborhoods: ['Taşdelen', 'Alemdağ', 'Mimar Sinan', 'Hamidiye', 'Çamlık', 'Mehmet Akif'],
    sections: [
      {
        heading: 'Çekmeköy’de konut tipleri ve boya ihtiyacı',
        body: `Çekmeköy’de standart apartman dairelerinin yanında bahçeli az katlı siteler, dubleksler ve villalar önemli yer tutar. Bu konutlarda yüksek tavanlar, merdiven boşlukları ve galeri duvarları sık görülür; bu tür yüzeyler iskele veya uzatmalı ekipman gerektirebildiği için standart daire paketlerinin kapsamı dışında, ayrıca değerlendirilir.

Düz planlı 1+1, 2+1 ve 3+1 daireler için ilan edilen paket fiyatları Çekmeköy’de de geçerlidir. Dubleks, villa veya 4+1 ve üzeri konutlar için daire bilgilerinizi iletmeniz hâlinde size özel teklif hazırlanır.`,
      },
      {
        heading: 'Nem ve küf izleri',
        body: `İlçenin ormanlık alanlara yakın bölgelerinde, özellikle kuzey cepheli odalarda ve az güneş alan köşelerde nem kaynaklı kararma ve küf izleriyle karşılaşılabilir. Bu izlerin üzerini doğrudan boyamak kalıcı bir çözüm değildir; önce nemin kaynağı anlaşılmalı, yüzey temizlenip uygun şekilde hazırlanmalıdır.

Dairenizde böyle bir sorun varsa teklif formuna fotoğraf eklemeniz, doğru hazırlık yönteminin belirlenmesini sağlar. Sorunun yalıtımla ilgili olduğu durumlarda [ısı yalıtımı](/hizmetler/isi-yalitimi) ve [su yalıtımı](/hizmetler/su-yalitimi) hizmetlerimiz hakkında da bilgi verebiliriz.`,
      },
      {
        heading: 'Site yönetimleri ve uygulama planı',
        body: `Taşdelen, Alemdağ ve Mimar Sinan çevresindeki sitelerde tadilat ve boya çalışmaları için çoğunlukla yönetimden önceden izin alınması, belirli saat aralıklarında çalışılması ve ortak alanların korunması istenir. Uygulama takvimi bu kurallar dikkate alınarak hazırlanır; site yönetiminizden öğrendiğiniz kuralları bizimle paylaşmanız yeterlidir.`,
      },
    ],
    faqs: [
      { q: 'Çekmeköy’de villa ve dubleks boyuyor musunuz?', a: 'Evet. Villa, dubleks ve yüksek tavanlı konutlar için ilan edilmiş bir paket fiyatı yoktur; kapsam değerlendirildikten sonra özel teklif hazırlanır.' },
      { q: 'Çekmeköy için paket fiyatları geçerli mi?', a: 'Evet. 1+1, 2+1 ve 3+1 daireler için ilan edilen paket fiyatları Çekmeköy’de de aynıdır.' },
      { q: 'Duvarımda küf var, üzeri boyanabilir mi?', a: 'Küfün üzerini doğrudan boyamak kalıcı çözüm olmaz. Önce nemin kaynağı değerlendirilir, yüzey temizlenip hazırlanır; ardından boya uygulanır.' },
    ],
    metaTitle: 'Çekmeköy Ev Boyama ve Boya Badana | Ocean İnşaat',
    metaDescription:
      'Çekmeköy’de daire, dubleks ve villa boyama için Ocean İnşaat. Taşdelen, Alemdağ ve çevresinde ev boyama paket fiyatlarını inceleyin, teklif isteyin.',
  },
  {
    slug: 'umraniye',
    name: 'Ümraniye',
    tier: 'primary',
    active: true,
    pagePublished: true,
    h1: 'Ümraniye Ev Boyama Hizmeti',
    lead: 'Ümraniye’de hem konutlar hem de ofisler için boya ve yenileme taleplerini karşılıyoruz. İlçe, Ocean İnşaat’ın öncelikli hizmet bölgelerinden biridir.',
    summary: 'Apartman daireleri, rezidanslar ve ofisler için ev boyama ve iç cephe boya uygulamaları.',
    neighborhoods: ['Atakent', 'Çakmak', 'Ihlamurkuyu', 'Tepeüstü', 'Şerifali', 'Yukarı Dudullu', 'Esenşehir'],
    sections: [
      {
        heading: 'Ümraniye’de daire boyama',
        body: `Ümraniye, Anadolu Yakası’nın en kalabalık ilçelerindendir ve yapı stoku oldukça karışıktır: yıllar önce yapılmış sıra apartmanlar, yenilenen binalar ve yüksek katlı rezidanslar aynı mahallede yan yana bulunabilir.

Eski apartmanlarda daireler çoğu zaman uzun süredir boyanmamış olur; üst üste binmiş boya katmanları, sigara ve soba isi kaynaklı sararma ile tavan köşelerinde çatlaklar görülebilir. Bu dairelerde işin kalitesini boyadan çok ön hazırlık belirler. Yeni rezidanslarda ise yüzeyler düzgündür; burada dikkat edilmesi gereken konu, bina yönetiminin çalışma saatleri ve yük asansörü kullanımına ilişkin kurallarıdır.`,
      },
      {
        heading: 'Ofis ve iş yeri boyama',
        body: `Şerifali ve Dudullu çevresi yoğun bir iş bölgesidir. Ofis, muayenehane ve mağaza gibi iş yerlerinde boya uygulaması çoğunlukla mesai dışında ya da hafta sonu planlanır. Bu tür talepler konut paketlerinin dışında, [iç cephe boyama](/hizmetler/ic-cephe-boyama) ve [ofis tadilatı](/hizmetler/ofis-tadilati) kapsamında değerlendirilir ve işin büyüklüğüne göre teklif hazırlanır.`,
      },
      {
        heading: 'Park ve malzeme taşıma',
        body: `İlçenin yoğun mahallelerinde araç parkı ve malzeme taşıma, uygulama gününün planlanmasında dikkate alınması gereken pratik bir konudur. Binanızda asansör olup olmadığını, kaçıncı katta oturduğunuzu ve bina önünde kısa süreli yükleme yapılıp yapılamadığını talebinizde belirtmeniz iş gününün verimli geçmesini sağlar.`,
      },
    ],
    faqs: [
      { q: 'Ümraniye’de ofis boyama yapıyor musunuz?', a: 'Evet. Ofis ve iş yeri boyama talepleri mesai düzeninize göre planlanır ve kapsam değerlendirildikten sonra teklif hazırlanır.' },
      { q: 'Ümraniye için ev boyama fiyatı ne kadar?', a: '1+1, 2+1 ve 3+1 daireler için ilan edilen paket fiyatları Ümraniye’de de geçerlidir. Güncel tutarları bu sayfadaki fiyat bölümünde görebilirsiniz.' },
      { q: 'Rezidansta oturuyorum, yönetim izni gerekir mi?', a: 'Çoğu rezidansta tadilat ve boya çalışmaları için yönetime önceden bilgi verilmesi istenir. Kuralları bize iletmeniz hâlinde takvim buna göre hazırlanır.' },
    ],
    metaTitle: 'Ümraniye Ev Boyama Hizmeti | Ocean İnşaat',
    metaDescription:
      'Ümraniye’de daire ve ofis boyama için Ocean İnşaat. Atakent, Çakmak, Şerifali ve çevresinde ev boyama fiyatlarını inceleyin, teklif talebi oluşturun.',
  },
  {
    slug: 'kadikoy',
    name: 'Kadıköy',
    tier: 'secondary',
    active: true,
    pagePublished: true,
    h1: 'Kadıköy Ev Boyama ve Boya Badana',
    lead: 'Kadıköy’de eski ve yenilenen binalardaki daireler için ev boyama, boya badana ve yüzey onarımı taleplerini değerlendiriyoruz.',
    summary: 'Eski yapı stokuna uygun yüzey hazırlığı ile daire boyama ve boya badana.',
    neighborhoods: ['Göztepe', 'Erenköy', 'Kozyatağı', 'Bostancı', 'Merdivenköy', 'Acıbadem', 'Koşuyolu'],
    sections: [
      {
        heading: 'Kadıköy’de eski daireleri boyamak',
        body: `Kadıköy’ün konut dokusunun önemli bir bölümü onlarca yıllık apartmanlardan oluşur. Bu dairelerde yüksek tavanlar, kartonpiyerler, ahşap doğrama çevreleri ve yıllar içinde üst üste atılmış boya katmanları olağandır. Böyle bir yüzeyde iyi sonuç almak için işin büyük kısmı boyadan önce yapılır: kabaran katmanların kazınması, çatlakların açılıp doldurulması ve yüzeyin zımparalanarak düzeltilmesi gibi.

Bu nedenle Kadıköy’deki eski dairelerde ilan edilen paket fiyatı bir başlangıç noktasıdır; yüzeyin durumu görüldükten sonra [duvar onarımı](/hizmetler/duvar-onarimi) ve [alçı sıva](/hizmetler/alci-siva) ihtiyacı varsa teklifte ayrıca belirtilir.`,
      },
      {
        heading: 'Yenilenen binalar ve yeni daireler',
        body: `İlçede kentsel dönüşümle yenilenen bina sayısı her yıl artıyor. Yeni teslim edilen dairelerde çoğu zaman inşaat boyası bulunur; ev sahipleri taşınmadan önce renk değişimi ya da daha nitelikli bir son kat tercih eder. Boş dairede çalışmak uygulamayı kolaylaştırdığı için, taşınma tarihinizden önce plan yapmanız yararlı olur.

Ocean İnşaat, Kadıköy’de bir konut projesinin uygulama sürecinde de görev almıştır; ayrıntıları [projelerimiz](/projeler) sayfasında bulabilirsiniz.`,
      },
      {
        heading: 'Apartman kuralları ve ulaşım',
        body: `Kadıköy’ün merkezî mahallelerinde araç parkı sınırlıdır ve pek çok apartmanda tadilat saatleri yönetim kararıyla belirlenmiştir. Uygulama günü için binanın asansör durumu, kat bilgisi ve yönetimin izin verdiği saat aralığı önceden netleştirilir. Bu bilgileri talebinize eklemeniz planlamayı hızlandırır.`,
      },
    ],
    faqs: [
      { q: 'Kadıköy’de hizmet veriyor musunuz?', a: 'Evet. Kadıköy, Ocean İnşaat’ın hizmet verdiği Anadolu Yakası ilçelerinden biridir.' },
      { q: 'Eski binadaki dairem için paket fiyatı geçerli mi?', a: 'Paket fiyatı daire tipine göre ilan edilen başlangıç fiyatıdır. Eski dairelerde yüzey onarımı gerekebileceği için nihai teklif, dairenin durumu değerlendirildikten sonra netleşir.' },
      { q: 'Kartonpiyer ve tavan göbeği boyanır mı?', a: 'Dekoratif alçı elemanlarının boyanması talebe göre kapsamda değerlendirilir. İhtiyacınızı teklif formunda belirtmeniz yeterlidir.' },
    ],
    metaTitle: 'Kadıköy Ev Boyama ve Boya Badana | Ocean İnşaat',
    metaDescription:
      'Kadıköy’de eski ve yeni daireler için ev boyama, boya badana ve yüzey onarımı. Ocean İnşaat paket fiyatlarını inceleyin, daireniz için teklif isteyin.',
  },
  {
    slug: 'uskudar',
    name: 'Üsküdar',
    tier: 'secondary',
    active: true,
    pagePublished: true,
    h1: 'Üsküdar Ev Boyama Hizmeti',
    lead: 'Üsküdar’ın hem tarihî mahallelerindeki eski evler hem de yeni konut bölgelerindeki daireler için ev boyama ve boya badana taleplerini değerlendiriyoruz.',
    summary: 'Tarihî mahallelerden yeni sitelere, Üsküdar genelinde daire boyama ve boya badana.',
    neighborhoods: ['Altunizade', 'Acıbadem', 'Bulgurlu', 'Ünalan', 'Kısıklı', 'Çengelköy', 'Küçükçamlıca'],
    sections: [
      {
        heading: 'Üsküdar’da iki farklı konut dokusu',
        body: `Üsküdar’da boya ihtiyacı mahalleye göre belirgin biçimde değişir. Boğaz hattındaki ve merkeze yakın eski mahallelerde ahşap detaylı, yüksek tavanlı, yaşı ilerlemiş konutlar bulunur. Ünalan, Bulgurlu ve Kısıklı çevresinde ise son yıllarda yapılmış siteler ve apartmanlar ağırlıktadır.

İlk grupta işin önemli bölümünü yüzey hazırlığı oluşturur; eski sıva, önceki boya katmanları ve ahşap çevresindeki derzler özen ister. İkinci grupta iş çoğunlukla standart bir daire boyamasıdır ve ilan edilen paketler bu dairelerin büyük bölümüne uygundur.`,
      },
      {
        heading: 'Boğaz’a yakın konutlarda nem',
        body: `Denize yakın ve az güneş alan konutlarda duvar diplerinde, pencere çevrelerinde ve banyo tavanlarında nem kaynaklı kabarma görülebilir. Bu tür yüzeylerde kalıcı sonuç için önce nemin nedeni değerlendirilmeli, kabaran katman temizlenmeli ve yüzey uygun biçimde hazırlanmalıdır. Sorunlu bölgelerin fotoğrafını talebinize eklemeniz doğru yöntemin belirlenmesine yardımcı olur.`,
      },
      {
        heading: 'Yokuşlu sokaklar ve uygulama günü',
        body: `Üsküdar’ın birçok mahallesinde sokaklar dar ve eğimlidir. Malzemenin taşınması ve aracın bina önüne yanaşabilmesi uygulama gününün planında dikkate alınır. Binanızda asansör bulunup bulunmadığını ve dairenizin katını talep sırasında belirtmeniz yeterlidir.`,
      },
    ],
    faqs: [
      { q: 'Üsküdar’da hizmet veriyor musunuz?', a: 'Evet. Üsküdar, Ocean İnşaat’ın hizmet verdiği Anadolu Yakası ilçelerinden biridir.' },
      { q: 'Üsküdar için fiyatlar farklı mı?', a: 'Hayır. İlan edilen 1+1, 2+1 ve 3+1 paket fiyatları hizmet verdiğimiz bütün bölgelerde aynıdır; nihai teklif dairenin durumuna göre netleşir.' },
      { q: 'Müstakil ev veya köşk boyuyor musunuz?', a: 'Müstakil ve çok katlı konutlar için ilan edilmiş bir paket fiyatı yoktur. Yapının durumu değerlendirildikten sonra özel teklif hazırlanır.' },
    ],
    metaTitle: 'Üsküdar Ev Boyama Hizmeti | Ocean İnşaat',
    metaDescription:
      'Üsküdar’da daire boyama ve boya badana için Ocean İnşaat. Altunizade, Acıbadem, Ünalan ve çevresinde paket fiyatlarını inceleyin, teklif talebi oluşturun.',
  },
  // İkincil ilçeler: yönetim panelinden etkinleştirilene kadar sitede görünmez.
  { slug: 'pendik', name: 'Pendik', tier: 'secondary', active: false, pagePublished: false },
  { slug: 'atasehir', name: 'Ataşehir', tier: 'secondary', active: false, pagePublished: false },
  { slug: 'kartal', name: 'Kartal', tier: 'secondary', active: false, pagePublished: false },
  { slug: 'maltepe', name: 'Maltepe', tier: 'secondary', active: false, pagePublished: false },
];
