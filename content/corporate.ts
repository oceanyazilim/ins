/**
 * Mevcut siteden (oceaninsaat.com.tr) korunarak taşınan kurumsal içerikler.
 * Sayısal iddialar (deneyim yılı, proje ve iş ortağı sayısı) doğrulanana kadar yeni sitede gösterilmez.
 */
export const about = {
  h1: 'Sağlam Yapılara Adanmış Bir Ekip',
  lead: 'Ocean İnşaat, mühendislik disiplinlerini teknik yetkinlikle birleştirerek her ölçekte projeyi güvenle üretir.',
  heading: 'Ocean İnşaat: Marmara Bölgesi’nde güvenilir yapı ortağı.',
  paragraphs: [
    'Ocean İnşaat; konut, enerji ve turizm projelerinde taşeronluk, aracılık, uygulama ve koordinasyon hizmetleri sunar. Merkez ekibimiz mühendis, mimar ve saha teknisyenlerinden oluşur; şantiye organizasyonları deneyimli inşaat mühendisleri tarafından yürütülür.',
    'Yapıya, çevreye, çalışana ve iş ortağına karşı sorumluluğumuz her kararımızda ölçüttür. Şeffaf sözleşme, düzenli raporlama, zamanında teslim ve satış sonrası destek Ocean İnşaat kültürünün ayrılmaz parçalarıdır.',
    'Bu birikimi bugün Sancaktepe merkezli ev boyama, boya badana ve tadilat hizmetlerimize de taşıyoruz: bir yapının tamamında uyguladığımız planlama ve işçilik disiplinini, tek bir dairenin duvarlarında da aynı özenle uyguluyoruz.',
  ],
  mission: 'Yatırımcılarımıza güvenle inşa edilmiş, uzun ömürlü ve enerji verimli yapılar teslim ederek Türkiye’nin yapı standartlarının yükselmesine katkı sağlamak.',
  vision: 'Konut, enerji ve turizm projelerinde tercih edilen; taşeronluk, aracılık ve koordinasyon başlıklarında referans gösterilen bir çözüm ortağı olmak.',
  values: ['Güven', 'Kalite', 'Şeffaflık', 'Sorumluluk', 'Yenilikçilik', 'Sürdürülebilirlik', 'Zamanında Teslim', 'Müşteri Memnuniyeti'],
  principles: [
    { title: 'Kalite Politikası', text: 'Her fazda malzeme, işçilik ve uygulama kalitesini bağımsız kontrol raporları ile belgeleyen bir yaklaşım benimseriz. Süreç boyunca gelen tüm geri bildirimler kalite sistemimizi geliştirmek için kullanılır.' },
    { title: 'Çevresel Sorumluluk', text: 'Şantiye çevresinde toz, gürültü ve atık yönetimini yönetmeliklere uygun şekilde yürütür; enerji verimli malzemeleri önceliklendiririz.' },
    { title: 'İş Güvenliği', text: 'İş sağlığı ve güvenliği kültürünü tüm ekiplerimize benimseterek sıfır ölümcül kaza hedefiyle çalışırız.' },
  ],
  capabilities: ['BIM tabanlı projelendirme', 'Zemin ve karot test koordinasyonu', 'İş programı yazılımları ile takip', 'ERP entegre satın alma', 'Şantiye kamera sistemleri', 'Enerji simülasyonu ve BEP-TR'],
  team: [
    ['İnşaat Mühendisleri', 'Şantiye ve proje yönetimi'],
    ['Mimarlar', 'Konsept ve uygulama projeleri'],
    ['Statik Mühendisleri', 'Deprem yönetmeliği uyumu'],
    ['Mekanik Mühendisleri', 'Isıtma, soğutma ve havalandırma'],
    ['Elektrik Mühendisleri', 'Kuvvetli ve zayıf akım'],
    ['İş Güvenliği Uzmanları', 'Şantiye İSG denetimi'],
    ['Peyzaj Mimarları', 'Dış alan ve peyzaj tasarımı'],
    ['Kalite Kontrol Uzmanları', 'Malzeme ve uygulama denetimi'],
  ],
  timeline: [
    ['2014', 'Ocean İnşaat Kuruldu', 'Konut projeleriyle Marmara Bölgesi’nde faaliyete başladı.'],
    ['2016', 'Kat Karşılığı Projeler', 'Arsa sahipleri ile kat karşılığı işbirlikleri hız kazandı.'],
    ['2018', 'İlk Endüstriyel Yapı', 'İlk endüstriyel üretim tesisi taşeron uygulama kapsamında tamamlandı.'],
    ['2020', 'Kentsel Dönüşüm', 'Riskli yapı raporlu projelerde uçtan uca hizmet başladı.'],
    ['2022', 'Enerji Projeleri', 'Çatı üstü güneş enerjisi santrali projelerinde uygulama deneyimi kazanıldı.'],
    ['2024', 'Turizm Yapıları', 'Turizm ve sosyal tesis projelerinde uygulama ve koordinasyon kapsamı genişledi.'],
  ],
};

export const processPage = {
  h1: 'Her Projede Aynı Disiplin',
  lead: 'Görüşmeden teslime kadar sürecin her aşaması net tanımlı çıktılara ve raporlamalara sahiptir.',
  heading: 'Doğru Süreç, Öngörülebilir Sonuç',
  intro: 'Her fazın öncesinde ne olacağı ve sonucunda hangi çıktının teslim edileceği bellidir. Aşağıdaki dokuz adım, inşaat ve kapsamlı tadilat projelerinde izlediğimiz yolu anlatır.',
  steps: [
    { title: 'İlk Görüşme ve İhtiyaç Analizi', text: 'Projenin amacı, beklentileri ve ölçeği hakkında ilk bilgiler alınır; birlikte çalışılıp çalışılamayacağı konusunda ön değerlendirme yapılır.', outputs: ['Proje briefi', 'Kaba bütçe aralığı', 'Ön iş programı'] },
    { title: 'Yerinde Keşif', text: 'Teknik ekip arsa veya mevcut yapı üzerinde inceleme yapar; zemin, çevre yapı, altyapı ve imar durumu değerlendirilir.', outputs: ['Keşif raporu', 'Fotoğraflı tespit', 'Ölçüm çıktısı'] },
    { title: 'Projelendirme ve Fizibilite', text: 'Mimari, statik, mekanik ve elektrik disiplinleri birlikte çalışır; farklı senaryolar için fizibilite hazırlanır.', outputs: ['Avan proje', 'Kaba metraj', 'Maliyet-değer analizi'] },
    { title: 'Bütçe ve Teklif Hazırlığı', text: 'Detaylı teknik şartname üzerinden bütçe kalemleri çıkarılır ve nihai teklif hazırlanır.', outputs: ['Detaylı teklif', 'Ödeme planı', 'Alternatif malzeme seçenekleri'] },
    { title: 'Sözleşme ve İş Programı', text: 'Karşılıklı görüşme sonrasında sözleşme imzalanır; iş programı ve kalite planı devreye alınır.', outputs: ['Sözleşme', 'Ayrıntılı iş programı', 'Kalite planı'] },
    { title: 'İnşaat ve Uygulama', text: 'Şantiye kurulur; hafriyat, kaba yapı, ince işler, tesisat ve cephe işleri iş programına uygun yürütülür.', outputs: ['Haftalık ilerleme raporu', 'Fotoğraflı takip', 'İş güvenliği raporu'] },
    { title: 'Kalite Kontrol', text: 'Her fazda kalite kontrol denetimleri yapılır; malzeme testleri ve saha kontrolleri raporlanır.', outputs: ['Kalite raporları', 'Test sonuçları', 'Kontrol tutanakları'] },
    { title: 'Teslim ve Son Kontroller', text: 'Yapı, tesisat ve güvenlik testleri yapılır; eksikler kapatılır ve teslim tutanağı hazırlanır.', outputs: ['Teslim tutanağı', 'İskân dokümanları', 'Kullanım kılavuzları'] },
    { title: 'Satış Sonrası Destek', text: 'Teslim sonrasında teknik destek sağlanır; periyodik kontroller ve bakım hizmetleri sunulur.', outputs: ['Garanti dokümanı', 'Periyodik bakım planı', 'Teknik destek hattı'] },
  ],
};

export const katKarsiligi = {
  h1: 'Arsanızı Güvenli ve Değerli Bir Yatırıma Dönüştürün',
  lead: 'Şeffaf pay dağılımı, noter onaylı sözleşme ve anahtar teslim yaklaşımı ile kat karşılığı süreci Ocean İnşaat çatısı altında.',
  heading: 'Doğru Ortakla Riski Azaltın, Değeri Artırın',
  intro: 'Ocean İnşaat, arsanızın değerine ulaşması için imar hakkını verimli şekilde kullanır. Sürecin her aşaması sizin için tanımlı, izlenebilir ve yazılıdır.',
  pillars: [
    ['Arsa ve İmar Analizi', 'İmar durumu, çekme mesafeleri ve TAKS/KAKS analizleri.'],
    ['Fizibilite Çalışması', 'Pay dağılım simülasyonu ve maliyet-değer karşılaştırması.'],
    ['Noter Onaylı Sözleşme', 'Tüm süreç hukuki güvence altında ilerler.'],
    ['Kaba Yapı ve İnce İşler', 'Deprem yönetmeliğine uygun kaliteli uygulama.'],
    ['Anahtar Teslim', 'İskân ve tapu süreçleri dahil eksiksiz teslim.'],
    ['Satış Sonrası Destek', 'Teslim sonrasında teknik ve idari destek.'],
  ],
  steps: [
    ['Ön Görüşme', 'Arsa sahibinin beklentileri ve arsanın konumu değerlendirilir.'],
    ['İmar İncelemesi', 'İmar durumu, çekme mesafeleri, TAKS/KAKS analizi yapılır.'],
    ['Fizibilite', 'Bölgesel pazar değerleri, satış potansiyeli ve pay dağılım simülasyonu.'],
    ['Sözleşme', 'Pay oranı, teslim süresi ve teknik şartname noter huzurunda imzalanır.'],
    ['Projelendirme', 'Mimari ve mühendislik projeleri sözleşmede belirlenen kaliteye göre üretilir.'],
    ['Ruhsat ve Kaba Yapı', 'Belediye onayları alınır, temel ve iskelet imalatı başlar.'],
    ['İnce İşler', 'Cephe, tesisat, seramik, boya ve doğrama işleri tamamlanır.'],
    ['İskân ve Tapu', 'İskân belgesi alınır, arsa sahibi ve müteahhit payları tapuya işlenir.'],
  ],
  reasons: ['Arsa sahibinden nakit talep edilmez', 'Noter onaylı sözleşme ile hukuki güvence', 'Şeffaf pay dağılımı ve daire seçim planı', 'İmar hakkının verimli şekilde kullanılması', 'Anahtar teslim ve tapulu daire teslimi'],
  parcels: ['Merkez ve alt bölgelerdeki müsait imarlı arsalar', 'Eski yapıların bulunduğu dönüşüm alanları', 'Ortak arsa sahipliği bulunan parseller'],
  faqs: [
    { q: 'Kat karşılığı inşaat süreci nasıl ilerler?', a: 'Kat karşılığı süreç; arsa incelemesi, imar analizi, pay dağılımı, noter onaylı sözleşme, ruhsat, inşaat, iskân ve tapu devri aşamalarından oluşur.' },
    { q: 'Teklif almak için hangi bilgileri iletmeliyim?', a: 'Arsanın konumu, imar durumu ve yaklaşık büyüklüğünü iletmeniz ön değerlendirme için yeterlidir.' },
  ],
};
