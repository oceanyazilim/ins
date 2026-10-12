# Test Sonuçları

Son çalıştırma: 12.10.2026 · Ortam: Windows 11, Node 24.17, gömülü PostgreSQL 18, Chromium (Playwright 1.64). Bütün sonuçlar **yerel ortamda** alınmıştır; canlı alan adında ölçüm yapılmamıştır.

## Özet

| Denetim | Komut | Sonuç |
|---|---|---|
| Tip denetimi | `npm run typecheck` | Hatasız |
| ESLint | `npm run lint` | 0 hata, 1 bilgilendirme uyarısı (React Hook Form `watch()` React Compiler tarafından atlanıyor; işlevsel etkisi yok) |
| Birim + entegrasyon | `npm test` | **74 / 74 geçti** (3 dosya) |
| Uçtan uca | `npm run test:e2e` | **19 / 19 geçti** (üretim derlemesine karşı) |
| SEO kalite kapıları | `npm run seo:audit` | 102 sayfa, **0 hata**, 33 uyarı (bkz. `seo-denetim-raporu.md`) |
| Eski adresler | elle doğrulama betiği | 73 adresin 67’si 200, 6’sı tek atlamalı 308 (hedefler 200; dördü portföyden çıkarılan projeler) |
| Üretim derlemesi | `npm run build` | Başarılı |

## Birim testleri (`tests/unit`)

- Fiyat ve telefon biçimlendirme, WhatsApp bağlantısı üretimi
- Türkçe karakterli slug üretimi ve doğrulaması
- İçerik yer tutucuları (`{{fiyat:…}}`, `{{bolgeler}}`), tanımsız paket için fiyat üretilmemesi
- Yetki kontrolleri (yönetici / editör / oturumsuz)
- Parola özetleme ve doğrulama
- Yönlendirme kuralları: normalleştirme, döngü ve zincir engeli; sabit yönlendirmelerin tek atlamalı olması
- Hizmet bölgesi filtreleme: pasif ilçe ve hariç tutulan bölgenin (serbest metinle dahi) reddedilmesi
- Teklif formu doğrulaması: zorunlu alanlar, KVKK onayı zorunlu / pazarlama izni isteğe bağlı, bal küpü, uzunluk sınırları
- Markdown güvenliği: ham HTML ve `javascript:` bağlantılarının etkisizleştirilmesi
- Metadata üretimi: canonical, başlık şablonu, panel geçersiz kılmaları
- JSON-LD: işletme, hizmet, teklif (Offer), kırıntı, makale; puan/yorum içermemesi; Offer tutarlarının paket fiyatlarıyla eşleşmesi
- Başlangıç verisi kuralları: paket fiyatları (25.000 / 30.000 / 35.000), aktif ve pasif bölgeler, lokasyon sayfalarının ortak cümle içermemesi
- İçerik dosyaları: hariç tutulan bölge ve yasak iddiaların bulunmaması; yalnızca doğrulanmış fiyatların geçmesi

## Entegrasyon testleri (`tests/integration`, gerçek PostgreSQL)

- Paketlerin merkezi kaynaktan okunması, fiyat değişikliğinin geçmişe yazılması, pasif paketin listelenmemesi
- Aktif bölgelerin sırası; pasif ilçenin lokasyon sayfasının bulunmaması; hariç tutulan bölgenin veritabanında olmaması
- Mevcut hizmet adreslerinin korunması; taslak hizmet ve incelemedeki yazıların yayında görünmemesi
- Mevcut blog yazılarının özgün tarihleriyle taşınması; içerikteki fiyatların yer tutucuya çevrilmesi
- Talep kaydı: benzersiz talep numarası, rıza ve durum geçmişi, silmede bağlı kayıtların temizlenmesi
- Yönlendirme arama, kullanım sayacı, pasif kural
- Deneme sınırlandırması
- Dosya yükleme: WebP’ye yeniden kodlama, boyut sınırı; PHP / SVG / GIF / boş dosyanın reddi; dizin dışına çıkan anahtarların okunmaması

## Uçtan uca senaryolar (`e2e/site.spec.ts`)

1. **Teklif akışı:** ana sayfa → 2+1 paketi seçilir → 30.000 TL görülür → teklif formunda seçim korunur → kapsam, durum, Sancaktepe, iletişim → özet → gönderim → talep numarası → yönetim panelinde talep bulunur, ayrıntıları doğrudur → durum güncellenir.
2. 4+1 daire için fiyat gösterilmediği.
3. Sultanbeyli ve pasif ilçelerin form seçeneklerinde, sayfalarda ve site haritasında bulunmadığı; ilgili adreslerin 404 döndüğü.
4. Beş aktif lokasyon sayfasının özgün H1, doğru canonical ve güncel fiyatla yayında olduğu.
5. **Fiyat yönetimi:** yönetici 1+1 fiyatını 26.500 yapar → ana sayfa, fiyat tablosu, paket sayfası, ana sayfa SSS’si ve JSON-LD aynı fiyatı gösterir → fiyat geri alınır.
6. Yönetim panelinin oturumsuz erişime kapalı olduğu; hatalı parolanın reddedildiği; fotoğraf uç noktasının 401 döndüğü.
7. Hariç tutulan bölgenin panelden eklenemediği; panelden eklenen yönlendirmenin 308 döndüğü; zincir oluşturan kuralın reddedildiği.
8. robots.txt, sitemap.xml içeriği; 404 ve 308 durum kodları; panelde `X-Robots-Tag: noindex`.
9. JavaScript **kapalıyken** 18 sayfada benzersiz başlık ve açıklama, doğru canonical, tek ve görünür H1; fiyatların ilk HTML’de bulunduğu.
10. Güncel telefon, e-posta ve WhatsApp bağlantıları; eski numaranın hiçbir yerde kalmadığı.
11. axe-core (WCAG 2.0/2.1/2.2 A ve AA etiketleri): 7 sayfada ciddi veya kritik ihlal yok.
12. 320–1920 px arası 8 genişlikte 4 sayfada yatay taşma yok.
13. Klavye: “İçeriğe geç” bağlantısı; mobil menünün açılıp Esc ile kapanması.

### Testlerin yakaladığı ve düzeltilen gerçek hatalar

- **Erken gönderim:** “Özeti Görüntüle” düğmesine basıldığında React aynı düğme öğesini “Talebi Gönder” için yeniden kullandığından form, özet gösterilmeden gönderiliyordu. Düğmelere ayrı `key` verildi.
- **Yerleşim kayması:** bir alan düzeltilince hata satırı kaybolup alttaki onay kutusunu kaydırıyor, tıklama ıskalanıyordu. Hata satırları için yer sabitlendi.
- **320 px taşması:** üst bilgide logo ve düğme genişliği ekranı aşıyordu.
- **Yetim sayfalar:** `/konum/*` sayfalarına hiçbir sayfadan bağlantı yoktu; Kurumsal sayfasına eklendi.

## Lighthouse (yerel üretim derlemesi, mobil, simüle yavaş 4G + 4× CPU yavaşlatma)

| Sayfa | Performans | Erişilebilirlik | En İyi Uygulamalar | SEO | LCP (simüle) | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/` | 87 | 100 | 100 | 100 | 3,8 sn | 0 | 50 ms |
| `/boya-fiyatlari` | 89 | 100 | 100 | 100 | 3,6 sn | 0 | 60 ms |
| `/ev-boyama` | 89 | 100 | 100 | 100 | 3,6 sn | 0 | 40 ms |
| `/sancaktepe-ev-boyama` | 85 | 100 | 100 | 100 | 4,1 sn | 0 | 110 ms |
| `/teklif-al` | 85 | 100 | 96 | 100 | 4,0 sn | 0 | 130 ms |
| `/blog/salon-icin-boya-renkleri` | 89 | 100 | 100 | 100 | 3,6 sn | 0 | 50 ms |

Değerlendirme:

- Erişilebilirlik ve SEO hedefleri (95+) karşılandı; CLS 0.
- **Performans 90+ hedefi karşılanmadı** (85–89). Simüle edilen LCP 3,6–4,1 sn ile 2,5 sn hedefinin üzerinde. Aynı ölçümlerde kısıtlamasız gözlenen LCP 0,3–1,3 sn’dir; fark, simülasyonun yazı tipi ve betik yüklemesini yavaş ağ üzerinde modellemesinden kaynaklanır.
- Core Web Vitals hedefleri gerçek kullanıcı verisinin 75. yüzdeliğiyle değerlendirilir; bu veri ancak site yayına girdikten sonra (Search Console / CrUX) oluşur. **Saha ölçümü yapılmamıştır.**
- `/teklif-al` sayfasındaki 96, Chrome’un içerik güvenlik politikasıyla ilgili bir “issue” kaydından kaynaklanıyor; konsolda engellenen kaynak gözlenmedi.

## Yapılmayan testler

- Canlı alan adında PageSpeed Insights, Rich Results Test, Schema Markup Validator, Search Console (erişim ve yayın gerektirir)
- Gerçek SMTP sunucusuyla e-posta gönderimi (SMTP bilgisi yok; bildirim içeriği üretimi kodda mevcut, gönderim denenmedi)
- Fotoğraflı teklif gönderiminin tarayıcı üzerinden uçtan uca testi (yükleme mantığı entegrasyon testiyle doğrulandı)
- Editör rolüyle panel kullanımı (yetki kuralları birim testiyle doğrulandı)
- Safari ve Firefox; gerçek mobil cihazlar (yalnızca Chromium ile masaüstü ve mobil görünüm denendi)
- Ekran okuyucuyla elle kullanım testi
- Yük / dayanıklılık testi
