# Kalan İşler, Varsayımlar ve Doğrulanması Gerekenler

Bu belge, yapılmayan ya da işletme onayı bekleyen her şeyi açıkça listeler.

## 1. İşletmenin doğrulaması gereken bilgiler

| Konu | Şu anki durum | Nereden değiştirilir |
|---|---|---|
| **WhatsApp numarası** | Yeni telefon (+90 533 039 22 21) WhatsApp numarası olarak **varsayıldı**. Mevcut sitede WhatsApp eski numaraya bağlıydı. Farklıysa düzeltin; yoksa boş bırakın | Panel → Ayarlar |
| Sosyal medya bağlantıları | Mevcut siteden aynen alındı (instagram.com/oceaninsaat vb.). Hesapların gerçekten işletmeye ait olduğu **doğrulanmadı** | Panel → Ayarlar |
| Çalışma saatleri | Mevcut siteden alındı (Hafta içi 09:00–18:30, Cumartesi 10:00–15:00) | Panel → Ayarlar |
| Kuruluş yılı (2014) ve kurumsal zaman çizelgesi | Mevcut siteden alındı | Ayarlar · `content/corporate.ts` |
| **Paket kapsamı** | KDV, boya malzemesi ve markası, tavan, kat sayısı, duvar onarımı, süre, eşyalı ev koşulları “teklifte netleşir” olarak gösteriliyor. Karar verildikçe işaretlenmeli; fiyat arayan kullanıcı için en önemli eksik bilgi budur | Panel → Boya Fiyatları |
| Fiyat geçerlilik tarihi | Tanımlı değil (gösterilmiyor) | Panel → Boya Fiyatları |
| Kadıköy ve Üsküdar | İstek üzerine **aktif** bölge olarak eklendi ve özgün lokasyon sayfaları yayınlandı; öncelik “ikincil” | Panel → Hizmet Bölgeleri |
| Lokasyon sayfalarındaki ilçe anlatımları | İlçelerin konut dokusuna dair genel bilgiye dayanır; işletmenin sahadaki deneyimiyle gözden geçirilmeli | Panel → Hizmet Bölgeleri |
| Mahalle listeleri | Sancaktepe için şartnamedeki üç yer; diğer ilçeler için bilinen mahalleler eklendi. Hizmet verilmeyenleri çıkarın | Panel → Hizmet Bölgeleri |
| Hukuki metinler | KVKK, gizlilik, çerez, kullanım koşulları yeni veri işleme süreçlerine göre yeniden yazıldı. **Hukukçu onayı gerekir.** Saklama süreleri genel ifadeyle yazıldı | `content/legal.ts` |
| Mevcut siteden taşınan hizmet metinleri | 36 hizmet sayfası birebir korundu; içlerindeki süre ve kapsam ifadeleri (ör. teslim süreleri) mevcut sitenin beyanıdır | Panel → Hizmetler |

## 2. İçerik onayı

- **20 yeni blog yazısından 6’sı yayında, 14’ü “İncelemede”.** Yazılar yapay zekâ desteğiyle hazırlandı. Otomatik denetimlerden geçti (yalnızca doğrulanmış fiyatlar, hariç tutulan bölge ve yasak iddiaların bulunmaması, geçerli iç bağlantılar), ancak **satır satır editoryal okuma yapılmadı**. Yayındaki 6 yazıyı da okuyup onaylamanız, 14 yazıyı inceledikten sonra yayınlamanız önerilir.
- **9 yeni hizmet sayfası** (iç cephe boyama, boya badana, dekoratif boya, duvar onarımı, dış cephe boyama, mutfak, banyo, alçıpan, dekorasyon) aynı yöntemle hazırlandı ve yayında; aynı gözden geçirme önerilir.
- “Ev boyama kaç gün sürer?” yazısı genel sektör gözlemine dayanan süre ifadeleri içerir (firma taahhüdü olmadığı notuyla); incelemede bırakıldı.

## 3. Gerçek varlık bekleyen bölümler

- **Boya projeleri:** gerçek boya işi portföyü yok. Bölüm hazır; panelden “Boya / tadilat” türünde proje eklendiğinde ev boyama sayfasında kendiliğinden görünür.
- **Öncesi / sonrası:** sürüklenebilir karşılaştırma bileşeni hazır ve erişilebilir, ancak sitede **görünmüyor**: mevcut sitedeki üç çiftten ikisi aynı işe ait görünmediği, üçüncüsü doğrulanamadığı için yayınlanmadı. Gerçek çiftler panelden eklenip yayınlandığında ana sayfada ve ev boyama sayfasında görünür.
- **Stok görseller:** kahraman (hero) ve hizmet görselleri CC0 lisanslı stok fotoğraflardır, yaklaşık 1000 px genişliğindedir (büyük ekranlarda keskinlik sınırlı). Gerçek iş fotoğraflarıyla değiştirilmeli.
- **Müşteri yorumları, puanlar, sayaçlar:** doğrulanmış veri olmadığı için sitede yok. Mevcut sitedeki “10+ yıl / 50+ proje / 30+ iş ortağı” sayaçları taşınmadı.

## 4. Erişim gerektirdiği için yapılamayanlar

- Canlıya alma, DNS ve barındırma yapılandırması
- Google Search Console (doğrulama, site haritası gönderimi, dizine ekleme istekleri)
- Google Analytics 4 mülkü ve dönüşüm tanımları (altyapı hazır; kimlik girilince çalışır)
- Google İşletme Profili düzenlemeleri
- Canlı adreste PageSpeed Insights, Rich Results Test, Schema Markup Validator
- SMTP ile gerçek e-posta gönderimi (bilgiler girilince çalışacak şekilde hazır; denenmedi)
- Anahtar kelime hacmi ve zorluk verileri (SEO aracı erişimi yok; “araştırılacak” olarak bırakıldı)
- Mevcut sitenin kaynak kodu ve Git deposu (çalışma dizini boştu; denetim canlı site üzerinden yapıldı)

## 5. Şartnameden bilinçli sapmalar

| Şartname | Yapılan | Gerekçe |
|---|---|---|
| `/hakkimizda`, `/projelerimiz` | Mevcut `/kurumsal` ve `/projeler` korundu, önerilen adresler yönlendirildi | Mevcut arama görünürlüğünü riske atmamak |
| `/hizmetler/komple-ev-tadilati`, `su-tesisati`, `parke-doseme` | Mevcut eşdeğer adreslere yönlendirildi | Aynı |
| Motion for React (Framer Motion) | Kullanılmadı; CSS + tek IntersectionObserver | Aynı görsel sonuç, daha az JavaScript |
| shadcn/ui, Radix | Kullanılmadı; yerel `<details>` / `<dialog>` | Gereksiz bağımlılıktan kaçınma |
| Hazır kimlik doğrulama kütüphanesi | Özel oturum sistemi (scrypt özet, veritabanı oturumları, httpOnly çerez, deneme sınırı) | Tek rollü küçük panel için yeterli; iki adımlı doğrulama **yok** |
| Shared element / View Transitions | Uygulanmadı; sayfa geçişinde kısa CSS giriş animasyonu | Şartname “yalnızca gerçekten iyi çalışıyorsa” diyor; deneysel API’ye bağımlılık eklenmedi |
| FAQPage şeması | Eklenmedi | Zengin sonuç garantisi yok; şartname de vaat edilmemesini istiyor |
| Sayaç animasyonları | Yok | Doğrulanmış sayısal veri yok |
| Fiyat kartlarında “en popüler” vb. rozet | Yok | Dayanak yok |
| Git | Depo başlatılmadı, commit atılmadı | İstenmedi; `.gitignore` hazır |

## 6. Eksik veya sınırlı özellikler

**Yönetim paneli**
- Menü (navigasyon) ve ana sayfa / kurumsal sayfa metinleri panelden düzenlenemez; kod ve `content/` dosyalarındadır. Panelden yönetilenler: fiyatlar, bölgeler, hizmetler, blog, projeler, karşılaştırmalar, SSS, medya, SEO geçersiz kılmaları, yönlendirmeler, ayarlar.
- “İç bağlantı önerileri” yok (yetim sayfa ve kırık bağlantı denetimi `npm run seo:audit` ile yapılır).
- Şema (JSON-LD) ayarları panelden değiştirilemez; şema, görünen veriden otomatik üretilir.
- Medya kütüphanesinde “ilişkili sayfalar” ve çoklu boyut sürümleri tutulmaz (boyutlandırmayı Next.js görsel optimizasyonu yapar).
- Talep durum listesi sabittir (kod içinde); panelden yeni durum eklenemez.
- Bildirim zili ve panel içi anlık bildirim yok; yeni talep sayısı menüde rozet olarak görünür, bildirim e-postayla gider.
- Blog yazarı tektir (“Ocean İnşaat”); panelden yazar yönetimi yok.
- İki adımlı doğrulama ve parola sıfırlama e-postası yok (parola, yönetici tarafından veya `admin:create` ile yenilenir).

**Altyapı**
- **Nesne depolama bağlayıcısı yok.** Dosyalar yerel diske yazılır; kalıcı diski olmayan platformlarda `src/server/storage.ts` uyarlanmalıdır.
- Hata izleme servisi (Sentry vb.) bağlı değil.
- Birden fazla sunucu örneği için paylaşımlı önbellek yapılandırılmadı.
- İçerik güvenlik politikası betikler için `'unsafe-inline'` içerir (Next.js satır içi betikleri nedeniyle); nonce tabanlı politikaya geçilebilir.
- Deneme sınırlandırması IP’ye dayanır; ters vekilin `X-Forwarded-For` başlığını doğru ayarlaması gerekir.
- CAPTCHA yok; bot koruması bal küpü alanı + deneme sınırı ile sağlanır.

**Performans**
- Lighthouse performans puanı 85–89 (hedef 90+); simüle LCP 3,6–4,1 sn. Gerçek kullanıcı verisi yok. İyileştirme adayları: daha yüksek kaliteli ve doğru boyutlu kahraman görseli, yazı tipi alt kümeleme, CDN.
- Ana sayfanın HTML’i yaklaşık 243 KB (sıkıştırılmamış).

**Kapsam**
- Mahalle düzeyinde sayfa açılmadı (bilinçli; özgün içerik birikince değerlendirilir).
- Pendik, Ataşehir, Kartal, Maltepe pasif; sayfaları yok.
- Tavan boyama ve kartonpiyer gibi alt başlıklar ayrı sayfa değil, ilgili hizmet sayfalarının içinde.
- Blog kategori arşivlerinde sayfalama yok (kategori başına 60 yazıya kadar tek sayfa); ana blog arşivinde var.
- İngilizce / Azerbaycanca sürüm yok (mevcut sitedeki `?lang=` parametresi kaldırıldı).

## 7. Yayından sonra ilk yapılacaklar

1. `KURULUM-VE-YAYIN.md` bölüm 10’daki kontrol listesi
2. `SEO-GECIS-RAPORU.md` bölüm 7’deki Search Console adımları
3. Paket kapsamının netleştirilip panelde işaretlenmesi
4. İlk gerçek boya işlerinin fotoğraflarıyla proje ve öncesi/sonrası eklenmesi
5. İncelemedeki yazıların okunup yayınlanması
