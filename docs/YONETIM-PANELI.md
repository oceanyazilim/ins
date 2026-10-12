# Yönetim Paneli Kullanım Kılavuzu

Adres: `/admin` · Giriş: `/admin/giris`

## Roller

| Rol | Yapabildikleri |
|---|---|
| **Yönetici** | Her şey |
| **Editör** | Talepleri görme ve güncelleme, hizmet / blog / proje / SSS içerikleri, medya. Fiyat, bölge, SEO, yönlendirme, ayarlar, kullanıcılar ve kişisel veri silme işlemlerine erişemez |

Oturum 12 saat sürer. 15 dakikada 8 başarısız girişten sonra giriş geçici olarak kilitlenir. Kullanıcı eklemek ve parola yenilemek için: Ayarlar → Kullanıcılar.

## Genel Bakış

Toplam / yeni / bekleyen / tamamlanan talep sayıları, hizmete ve ilçeye göre dağılım, son 8 haftanın talep grafiği, son talepler ve son işlemler. İnceleme bekleyen blog yazısı varsa uyarı gösterilir.

## Talepler

- **Liste:** ad, telefon, e-posta veya talep numarasıyla arama; durum, hizmet ve ilçeye göre filtre; tarihe, ada veya duruma göre sıralama.
- **Talep ayrıntısı:** kişi bilgileri, talep içeriği, yüklenen fotoğraflar, rıza kayıtları, geliş kaynağı (giriş sayfası, yönlendiren site, kampanya parametreleri).
- **Durumlar:** Yeni → İletişime geçildi → Keşif bekliyor → Teklif gönderildi → Kazanıldı / Kaybedildi → Tamamlandı. Her değişiklik geçmişe yazılır.
- **Onaylanan özel teklif:** müşteriye verdiğiniz tutarı girin. Bu alan, talep anında ilan edilen paket fiyatından ayrı tutulur.
- **Notlar:** görüşme notlarınızı ekleyin.
- **KVKK silme talebi:** “Kişisel verileri sil” ad, telefon, e-posta, açıklama, notlar ve fotoğrafları kalıcı olarak siler; istatistik için anonim kayıt kalır. Geri alınamaz.

Listede “Diğer: …” ile başlayan ilçe, müşterinin standart hizmet bölgeleri dışından talep gönderdiğini gösterir.

## Boya Fiyatları

Sitedeki **bütün fiyatlar** bu ekrandan gelir: ana sayfa, fiyat sayfası, paket ve lokasyon sayfaları, teklif formu, SSS ve arama motorlarına gönderilen yapılandırılmış veri.

- **Fiyat:** tam TL tutarı (örn. `30000`). Kaydettiğinizde site birkaç saniye içinde güncellenir; değişiklik fiyat geçmişine ve işlem kayıtlarına yazılır.
- **Geçerlilik tarihi / KDV notu:** doldurursanız sitede gösterilir; boş bırakırsanız hiçbir ifade yer almaz.
- **Kapsam kalemleri:** her satır `Kalem | durum | not`. Durum: `dahil`, `dahil değil` veya `teklifte`. Kararlaştırmadığınız başlıkları `teklifte` bırakın — site bunları taahhüt olarak göstermez.
- **Paket aktif:** kapatırsanız paket siteden, formdan ve yapılandırılmış veriden kalkar.

## Hizmet Bölgeleri

- **Bölge aktif:** yalnızca aktif bölgeler sitede, menüde, teklif formunda ve arama motoru verisinde görünür.
- **Lokasyon sayfası yayında:** `/ilce-ev-boyama` sayfasını yayınlar. Sistem şu koşulları arar: bölge aktif, giriş metni var, en az iki bölüm, yeterli uzunlukta ve ilçe adını içeren özgün içerik, meta açıklaması. Koşullar sağlanmazsa sayfa yayınlanmaz ve eksikler listelenir.
- **İçerik bölümleri:** her bölüm `## Başlık` satırıyla başlar. Başka ilçenin metnini ilçe adını değiştirerek kopyalamayın; arama motorları bunu kopya sayfa sayar.
- **Mahalleler:** her satıra bir mahalle. Teklif formunda öneri olarak ve lokasyon sayfasında görünür.
- **Yeni ilçe:** pasif olarak eklenir. Hizmet kapsamı dışında tanımlı bölgeler (Sultanbeyli) eklenemez.

## Hizmetler, Blog, Projeler

- **Hizmetler:** başlık, metinler, kapsam / aşama / malzeme / fayda listeleri (her satıra bir madde), SSS (bloklar boş satırla ayrılır; ilk satır soru), görsel ve SEO alanları. Taslak hizmetler sitede görünmez.
- **Blog:** Taslak → İncelemede → Yayında → Arşiv. Yayınlamak için içerik, özet ve meta açıklaması gerekir. Gövde Markdown’dır; `##` başlık, `###` alt başlık. Yayında olmayan yazılara verilen bağlantılar sitede otomatik olarak düz metne döner.
- **Projeler:** “Boya / tadilat” türündeki yayınlanmış projeler ev boyama sayfasında kendiliğinden görünür. Görseller yüklenirken yeniden kodlanır ve konum bilgisi temizlenir.
- **Öncesi / Sonrası:** iki görsel yükleyin; karşılaştırma taslak olarak eklenir. Aynı işe ait olduğundan emin olduktan sonra yayınlayın. Yayındaki boya karşılaştırmaları ana sayfada ve ev boyama sayfasında görünür.

**Adres (slug) değiştirirken:** yayındaki bir sayfanın adresini değiştirirseniz Yönlendirmeler ekranından eski adres → yeni adres kuralı ekleyin.

### Yer tutucular

Metinlerde fiyat, bölge ve iletişim bilgisini elle yazmak yerine şunları kullanın; değerler değiştiğinde metin kendiliğinden güncellenir:

| Yer tutucu | Çıktı |
|---|---|
| `{{fiyat:1+1}}`, `{{fiyat:2+1}}`, `{{fiyat:3+1}}` | Güncel paket fiyatı (örn. 30.000 TL) |
| `{{bolgeler}}` | Aktif hizmet bölgeleri |
| `{{telefon}}`, `{{eposta}}` | Güncel telefon ve birincil e-posta |

## SSS

Ana sayfa, Ev Boyama, Boya Fiyatları ve Teklif Al sayfalarındaki sorular. Paket, hizmet ve bölge soruları kendi düzenleme ekranlarındadır.

## Medya

Görsel yükleyin, alternatif metni yazın, oluşan adresi (`/media/…`) kopyalayıp hizmet, blog veya SEO ekranındaki görsel alanına yapıştırın. Yalnızca kullanım hakkına sahip olduğunuz görselleri yükleyin.

## SEO

Dizinlenebilir bütün sayfalar listelenir. Bir sayfayı seçip başlık, açıklama, canonical, paylaşım görseli tanımlayabilir; sayfayı arama motorlarına kapatabilir (noindex) veya site haritasından çıkarabilirsiniz. Boş bırakılan alanlar otomatik üretilir.

## Yönlendirmeler

Eski adres → yeni adres kuralları. Zincir (A→B→C) ve döngü oluşturan kurallar kabul edilmez. Kullanım sayısı sütunu, kuralın kaç kez çalıştığını gösterir. Kural, o adreste yayında bir sayfa yoksa uygulanır.

## Ayarlar

Şirket bilgileri, telefon, WhatsApp, e-postalar, adres, çalışma saatleri, sosyal bağlantılar, üst bilgi çubuğu metni, Google Analytics kimliği ve Search Console doğrulama kodu.

- **WhatsApp** boş bırakılırsa sitede WhatsApp bağlantısı gösterilmez.
- **Sokak adresi:** gerçek bir müşteri kabul adresiniz yoksa boş bırakın; yalnızca ilçe gösterilir.
- Bu bilgileri Google İşletme Profili’nizle aynı tutun.

## İşlem Kayıtları

Girişler, fiyat değişiklikleri, içerik ve ayar güncellemeleri dahil son 300 işlem; kimin, ne zaman yaptığıyla birlikte.
