# SEO Geçiş (Migration) Raporu

Kaynak: canlı `https://oceaninsaat.com.tr` sitesinin 12.10.2026 tarihli taraması (sitemap.xml içindeki 73 adres, tamamı 200).

## 1. Mevcut sitenin durumu (denetim bulguları)

| Başlık | Bulgu |
|---|---|
| Altyapı | Next.js (App Router), sunucu tarafında üretilen HTML, `s-maxage` ile önbellek |
| Konumlandırma | Genel müteahhitlik: “İnşaat, Taşeronluk ve Proje Koordinasyonu”. Ev boyama için özel sayfa, fiyat veya yerel sayfa **yok** |
| Title | Ana sayfada marka iki kez tekrar ediyor (“Ocean İnşaat \| … \| Ocean İnşaat”); proje sayfalarında da aynı hata |
| Dil / hreflang | `?lang=en` ve `?lang=az` için hreflang bildirilmiş, ancak sayfalar aynı Türkçe canonical’a işaret ediyor (tutarsız sinyal) |
| Yapılandırılmış veri | `GeneralContractor`, `WebSite`, `FAQPage`, `Service`, `BreadcrumbList`. Proje sayfalarında `BreadcrumbList` iki kez basılıyor |
| robots.txt | `/api/`, `/admin/`, `/_next/`, `/private/` kapalı. `/_next/` engeli CSS/JS taramasını zorlaştırır |
| Favicon / manifest | Yok (404) |
| www | `www` adresi 200 dönüyor, çıplak alana yönlendirmiyor (yinelenen host) |
| İletişim | Telefon +90 532 766 06 83, yalnızca info@ adresi; WhatsApp aynı numara |
| Sayısal iddialar | “10+ yıl, 50+ proje, 30+ iş ortağı” sayaçları (doğrulanamadı) |
| Öncesi/sonrası | Üç çift görsel; ikisi aynı işe ait görünmüyor (kıyı fotoğrafı / teras, kaba inşaat / 3B görsel) |
| Teklif formu | `/teklif-formu` istemci tarafında yükleniyor (“Form yükleniyor…”), HTML’de içerik yok |
| Eksikler | Fiyat bilgisi, hizmet bölgesi tanımı, boya/tadilat odaklı içerik |

## 2. Geçiş ilkeleri

1. Değeri olan hiçbir adres değiştirilmedi: 73 adresin **67’si aynı adreste** yayında, 6’sı tek atlamalı kalıcı (308) yönlendirmeyle taşındı (dördü, işletmenin isteğiyle portföyden çıkarılan projelerdir).
2. Şartnamede önerilen `/hakkimizda` ve `/projelerimiz` adresleri yerine mevcut `/kurumsal` ve `/projeler` korundu; önerilen adresler bunlara yönlendirildi.
3. Yeni ticari sayfalar mevcut adreslerle çakışmayacak şekilde eklendi; aynı arama niyetine iki sayfa açılmadı (bkz. bölüm 5).
4. Canonical host tektir: `https://oceaninsaat.com.tr`. `www` → çıplak alan 308.
5. `?lang=` parametreli adresler ayrı sayfa değildir; canonical parametresiz adrestir, hreflang kaldırıldı (yalnızca Türkçe yayın var).

## 3. Eski → yeni adres eşlemesi (73 adres)

| Eski adres | Yeni durum | Sayfa | Not |
|---|---|---|---|
| `/` | Aynı adres (200) | Ana sayfa | Yeni konumlandırma: ev boyama öncelikli; title ve H1 değişti |
| `/blog` | Aynı adres (200) | İnşaat, Mimari ve Süreç Rehberleri | İçerik korundu |
| `/cerez-politikasi` | Aynı adres (200) | Çerez Politikası | Metin yeni veri işleme süreçlerine göre yeniden yazıldı (hukuki onay bekliyor) |
| `/gizlilik-politikasi` | Aynı adres (200) | Gizlilik Politikası | Metin yeni veri işleme süreçlerine göre yeniden yazıldı (hukuki onay bekliyor) |
| `/hizmetler` | Aynı adres (200) | Kavramdan Teslime Kadar Her Detay | İçerik korundu |
| `/iletisim` | Aynı adres (200) | Projenizi Konuşalım | İçerik korundu |
| `/kat-karsiligi` | Aynı adres (200) | Arsanızı Güvenli ve Değerli Bir Yatırıma Dönüştürün | İçerik korundu |
| `/kullanim-kosullari` | Aynı adres (200) | Kullanım Koşulları | Metin yeni veri işleme süreçlerine göre yeniden yazıldı (hukuki onay bekliyor) |
| `/kurumsal` | Aynı adres (200) | Sağlam Yapılara Adanmış Bir Ekip | İçerik korundu, ev boyama paragrafı eklendi |
| `/kvkk-aydinlatma-metni` | Aynı adres (200) | KVKK Aydınlatma Metni | Metin yeni veri işleme süreçlerine göre yeniden yazıldı (hukuki onay bekliyor) |
| `/projeler` | Aynı adres (200) | Türkiye'nin Dört Bir Yanında Yükselen Yapılar | İçerik korundu |
| `/surec` | Aynı adres (200) | Her Projede Aynı Disiplin | İçerik korundu |
| `/teklif-formu` | 308 → `/teklif-al` | Teklif ve Bilgilendirme Formu | Çok adımlı yeni teklif sistemi |
| `/hizmetler/alci-siva` | Aynı adres (200) | Alçı ve Sıva Uygulamaları | İçerik birebir korundu |
| `/hizmetler/altyapi` | Aynı adres (200) | Altyapı Çalışmaları | İçerik birebir korundu |
| `/hizmetler/anahtar-teslim-insaat` | Aynı adres (200) | Anahtar Teslim İnşaat | İçerik birebir korundu |
| `/hizmetler/betonarme-yapilar` | Aynı adres (200) | Betonarme Yapılar | İçerik birebir korundu |
| `/hizmetler/bina-guclendirme` | Aynı adres (200) | Bina Güçlendirme | İçerik birebir korundu |
| `/hizmetler/catt-tadilati` | Aynı adres (200) | Çatı Tadilatı | İçerik birebir korundu |
| `/hizmetler/catt-yapimi` | Aynı adres (200) | Çatı Yapımı | İçerik birebir korundu |
| `/hizmetler/celik-konstruksiyon` | Aynı adres (200) | Çelik Konstrüksiyon | İçerik birebir korundu |
| `/hizmetler/dis-cephe-kaplama` | Aynı adres (200) | Dış Cephe Kaplama | İçerik birebir korundu |
| `/hizmetler/dis-cephe-yenileme` | Aynı adres (200) | Dış Cephe Yenileme | İçerik birebir korundu |
| `/hizmetler/elektrik-tesisati` | Aynı adres (200) | Elektrik Tesisatı | İçerik birebir korundu |
| `/hizmetler/ev-tadilati` | Aynı adres (200) | Ev Tadilatı | İçerik birebir korundu |
| `/hizmetler/fabrika-insaati` | Aynı adres (200) | Fabrika ve Endüstriyel Yapılar | İçerik birebir korundu |
| `/hizmetler/hafriyat` | Aynı adres (200) | Hafriyat ve Kazı Çalışmaları | İçerik birebir korundu |
| `/hizmetler/ic-dis-cephe-boya` | 308 → `/hizmetler/ic-cephe-boyama` | İç ve Dış Cephe Boya | İç ve dış cephe ayrı sayfalara bölündü |
| `/hizmetler/ic-mekan-tadilati` | Aynı adres (200) | İç Mekân Tadilatı | İçerik birebir korundu |
| `/hizmetler/insaat-danismanligi` | Aynı adres (200) | İnşaat Danışmanlığı | İçerik birebir korundu |
| `/hizmetler/isi-yalitimi` | Aynı adres (200) | Isı Yalıtımı | İçerik birebir korundu |
| `/hizmetler/kat-karsiligi-insaat` | Aynı adres (200) | Kat Karşılığı İnşaat | İçerik birebir korundu |
| `/hizmetler/kentsel-donusum` | Aynı adres (200) | Kentsel Dönüşüm | İçerik birebir korundu |
| `/hizmetler/konut-insaati` | Aynı adres (200) | Konut ve Apartman İnşaatı | İçerik birebir korundu |
| `/hizmetler/magaza-tadilati` | Aynı adres (200) | Mağaza Tadilatı | İçerik birebir korundu |
| `/hizmetler/mantolama` | Aynı adres (200) | Mantolama ve Isı Yalıtımı | İçerik birebir korundu |
| `/hizmetler/mekanik-tesisat` | Aynı adres (200) | Mekanik Tesisat | İçerik birebir korundu |
| `/hizmetler/mimari-projelendirme` | Aynı adres (200) | Mimari Projelendirme | İçerik birebir korundu |
| `/hizmetler/ofis-tadilati` | Aynı adres (200) | Ofis Tadilatı | İçerik birebir korundu |
| `/hizmetler/otel-tadilati` | Aynı adres (200) | Otel Tadilatı | İçerik birebir korundu |
| `/hizmetler/parke-zemin` | Aynı adres (200) | Parke ve Zemin Kaplama | İçerik birebir korundu |
| `/hizmetler/peyzaj` | Aynı adres (200) | Peyzaj ve Çevre Düzenlemesi | İçerik birebir korundu |
| `/hizmetler/restorasyon` | Aynı adres (200) | Restorasyon ve Yenileme | İçerik birebir korundu |
| `/hizmetler/seramik-fayans` | Aynı adres (200) | Seramik ve Fayans | İçerik birebir korundu |
| `/hizmetler/ses-yalitimi` | Aynı adres (200) | Ses Yalıtımı | İçerik birebir korundu |
| `/hizmetler/sihhi-tesisat` | Aynı adres (200) | Sıhhi Tesisat | İçerik birebir korundu |
| `/hizmetler/statik-projelendirme` | Aynı adres (200) | Statik Projelendirme | İçerik birebir korundu |
| `/hizmetler/su-yalitimi` | Aynı adres (200) | Su Yalıtımı | İçerik birebir korundu |
| `/hizmetler/ticari-yapi-insaati` | Aynı adres (200) | Ticari Yapı İnşaatı | İçerik birebir korundu |
| `/hizmetler/villa-insaati` | Aynı adres (200) | Villa İnşaatı | İçerik birebir korundu |
| `/projeler/avrupa-temper-3-2-mw-ges` | 308 → `/projeler` | Güneş Paneli Projesi | İşletmenin isteğiyle portföyden çıkarıldı |
| `/projeler/cambasi-kayak-merkezi` | Aynı adres (200) | Kayak ve Sosyal Tesis Turizm Projesi | İçerik ve görseller korundu |
| `/projeler/city-avm-projesi` | 308 → `/projeler` | Alışveriş Merkezi Dijital Proje | İşletmenin isteğiyle portföyden çıkarıldı |
| `/projeler/genpark-conax-fabrikasi` | 308 → `/projeler` | Endüstriyel Üretim Fabrikası Projesi | İşletmenin isteğiyle portföyden çıkarıldı |
| `/projeler/kadikoy-merdivenkoy-okay-apartmani` | Aynı adres (200) | Karma Kullanım Konut Projesi | İçerik ve görseller korundu |
| `/projeler/petrol-is-sendikasi-sube-binasi` | Aynı adres (200) | Kurumsal Hizmet Binası Projesi | İçerik ve görseller korundu |
| `/projeler/quattro-istanbul-serifali` | Aynı adres (200) | Yüksek Yapı Karma Kullanım Projesi | İçerik ve görseller korundu |
| `/projeler/sancaktepe-atak-apartmani-1` | Aynı adres (200) | Konut Projesi — Apartman 01 | İçerik ve görseller korundu |
| `/projeler/yg1-cnc-uretim-tesisi` | 308 → `/projeler` | CNC Tesisi | İşletmenin isteğiyle portföyden çıkarıldı |
| `/blog/anahtar-teslim-insaat-nedir` | Aynı adres (200) | Anahtar Teslim İnşaat Nedir? Kapsamı ve Süreci | İçerik ve yayın tarihi korundu |
| `/blog/bina-guclendirme-neden-onemli` | Aynı adres (200) | Bina Güçlendirme Neden Önemli? | İçerik ve yayın tarihi korundu |
| `/blog/dis-cephe-mantolama-avantajlari` | Aynı adres (200) | Dış Cephe Mantolamanın Avantajları | İçerik ve yayın tarihi korundu |
| `/blog/ic-mekan-tadilat-rehberi` | Aynı adres (200) | İç Mekân Tadilat Rehberi | İçerik ve yayın tarihi korundu |
| `/blog/insaat-maliyetleri-2025` | Aynı adres (200) | 2025 Yılı İnşaat Maliyetleri Nasıl Hesaplanır? | İçerik ve yayın tarihi korundu |
| `/blog/kat-karsiligi-insaat-sozlesmesi` | Aynı adres (200) | Kat Karşılığı İnşaat Sözleşmesinde Nelere Dikkat Edilmeli? | İçerik ve yayın tarihi korundu |
| `/blog/kentsel-donusum-nasil-yapilir` | Aynı adres (200) | Kentsel Dönüşüm Süreci Nasıl İşler? | İçerik ve yayın tarihi korundu |
| `/blog/mimari-projelendirme-adimlari` | Aynı adres (200) | Mimari Projelendirme Adımları | İçerik ve yayın tarihi korundu |
| `/konum/gebze-insaat-firmasi` | Aynı adres (200) | Gebze İnşaat Firması | Kurumsal inşaat lokasyon sayfası olarak korundu |
| `/konum/istanbul-insaat-firmasi` | Aynı adres (200) | İstanbul İnşaat Firması | Kurumsal inşaat lokasyon sayfası olarak korundu |
| `/konum/kocaeli-insaat-firmasi` | Aynı adres (200) | Kocaeli İnşaat Firması | Kurumsal inşaat lokasyon sayfası olarak korundu |
| `/konum/pendik-insaat-firmasi` | Aynı adres (200) | Pendik İnşaat Firması | Kurumsal inşaat lokasyon sayfası olarak korundu |
| `/konum/sancaktepe-insaat-firmasi` | Aynı adres (200) | Sancaktepe İnşaat Firması | Kurumsal inşaat lokasyon sayfası olarak korundu |
| `/konum/umraniye-insaat-firmasi` | Aynı adres (200) | Ümraniye İnşaat Firması | Kurumsal inşaat lokasyon sayfası olarak korundu |

## 4. Yeni eklenen adresler

| Adres | Amaç |
|---|---|
| `/ev-boyama` | Ana ticari hizmet sayfası (pillar) |
| `/boya-fiyatlari` | Fiyat araştırması niyeti; tablo + etkenler + SSS |
| `/ev-boyama/1-1-daire-boyama`, `/ev-boyama/2-1-daire-boyama`, `/ev-boyama/3-1-daire-boyama` | Daire tipine özgü paket sayfaları |
| `/teklif-al` | Çok adımlı teklif sistemi (eski `/teklif-formu` buraya yönlenir) |
| `/sancaktepe-ev-boyama`, `/cekmekoy-ev-boyama`, `/umraniye-ev-boyama`, `/kadikoy-ev-boyama`, `/uskudar-ev-boyama` | Aktif hizmet bölgelerinin özgün lokasyon sayfaları |
| `/hizmet-bolgeleri` | Hizmet bölgeleri dizini |
| `/hizmetler/ic-cephe-boyama`, `boya-badana`, `dekoratif-boya`, `duvar-onarimi`, `dis-cephe-boyama`, `mutfak-tadilati`, `banyo-tadilati`, `alcipan-asma-tavan`, `ev-dekorasyonu` | Yeni hizmet sayfaları |
| `/blog/kategori/*`, `/blog/sayfa/*` | Taranabilir blog arşivi |
| 6 yeni blog yazısı (yayında) + 14 yazı (incelemede) | Ev boyama içerik kümesi |

## 5. Yönlendirmeler ve birleştirmeler (anahtar kelime çakışmasını önleme)

| Kaynak | Hedef | Gerekçe |
|---|---|---|
| `/teklif-formu` | `/teklif-al` | Yeni teklif sistemi |
| `/hizmetler/ic-dis-cephe-boya` | `/hizmetler/ic-cephe-boyama` | Tek sayfa iki niyete hizmet ediyordu; iç ve dış cephe ayrıldı |
| `/hizmetler/komple-ev-tadilati` | `/hizmetler/ev-tadilati` | Şartnamedeki adres yerine mevcut adres korundu |
| `/hizmetler/su-tesisati` | `/hizmetler/sihhi-tesisat` | Aynı |
| `/hizmetler/parke-doseme` | `/hizmetler/parke-zemin` | Aynı |
| `/hakkimizda`, `/projelerimiz` | `/kurumsal`, `/projeler` | Aynı |
| `www.oceaninsaat.com.tr/*` | `oceaninsaat.com.tr/*` | Tek canonical host |

Kurallar tek atlamalıdır; zincir oluşmadığı birim testiyle, canlı davranış uçtan uca testle doğrulanır. Sonradan gereken yönlendirmeler yönetim panelinden (Yönlendirmeler) eklenir; panel zincir ve döngüyü reddeder.

Ev boyama kümesindeki niyet ayrımı: `/ev-boyama` (hizmet + paketler), `/boya-fiyatlari` (fiyat araştırması), paket sayfaları (daire tipine özgü), `/hizmetler/ic-cephe-boyama` (yüzey/malzeme, iş yerleri), `/hizmetler/boya-badana` (tavan, kısmi boyama, taşınma öncesi), lokasyon sayfaları (ilçe + hizmet).

## 6. Değişen sinyaller ve riskler

- **Ana sayfa konumu değişti** (inşaat → ev boyama). Marka aramalarında etkisi olmaz; “inşaat firması” türü genel sorgularda ana sayfanın yerini `/kurumsal`, `/hizmetler/*` ve `/konum/*` sayfaları alır. İlk haftalarda bu sorgularda dalgalanma beklenmelidir.
- **Doğrulanmamış sayaçlar** (10+ yıl vb.) yeni sitede gösterilmiyor; kuruluş yılı (2014) korunuyor.
- **Hukuki metinler** yeniden yazıldı; bu sayfalarda içerik değişimi sıralama açısından önemsizdir.
- **FAQPage şeması** kaldırıldı (Google bu zengin sonucu çoğu site için göstermiyor); SSS içerikleri sayfada görünür olarak duruyor.
- **Görsel adresleri**: proje görselleri aynı yollarla (`/images/projects/...`) sunulur.
- **`/konum/*` sayfaları** (İstanbul, Kocaeli, Gebze, Pendik, Sancaktepe, Ümraniye) kurumsal inşaat sayfaları olarak korundu. Ev boyama hizmet bölgelerinden bağımsızdır ve bu sayfalarda ev boyama vaadi yoktur.

## 7. Yayın günü kontrol listesi (Google Search Console)

1. Yayından önce: mevcut sitenin Search Console “Performans” ve “Sayfalar” raporlarını dışa aktarın (karşılaştırma için).
2. Geçişten hemen sonra `npm run seo:audit -- https://oceaninsaat.com.tr` çalıştırın; hata sayısı 0 olmalı.
3. `https://oceaninsaat.com.tr/sitemap.xml` adresini Search Console’a yeniden gönderin.
4. URL Denetimi ile şu adresleri test edip dizine ekleme isteyin: `/`, `/ev-boyama`, `/boya-fiyatlari`, `/sancaktepe-ev-boyama`, `/cekmekoy-ev-boyama`, `/umraniye-ev-boyama`, `/teklif-al`.
5. `/teklif-formu` ve `/hizmetler/ic-dis-cephe-boya` adreslerinin 308 döndüğünü doğrulayın.
6. Zengin Sonuçlar Testi ile `/boya-fiyatlari` (Service + Offer) ve bir blog yazısını (BlogPosting) kontrol edin.
7. İlk iki hafta her gün, sonra haftalık: “Sayfalar” raporunda 404 ve “Yönlendirmeli sayfa” artışını izleyin; beklenmeyen 404’ler için panelden yönlendirme ekleyin.
8. 28. günde: eski dönemle tıklama/gösterim karşılaştırması yapın (bkz. `SEO-PLANI.md`).

## 8. Doğrulama durumu

| Kontrol | Durum |
|---|---|
| 73 eski adresin tamamının 200 veya tek atlamalı 308 dönmesi | Doğrulandı (yerel üretim derlemesi; uçtan uca test + SEO denetimi) |
| Site haritası yalnızca yayındaki canonical adresleri içeriyor (102 adres) | Doğrulandı |
| Kırık iç bağlantı / yönlendirmeye giden iç bağlantı / yetim sayfa | 0 (bkz. `seo-denetim-raporu.md`) |
| Canlı alan adında Search Console, Rich Results Test, PageSpeed Insights | **Yapılmadı** — canlıya alındıktan sonra, hesap erişimiyle yapılmalı |
