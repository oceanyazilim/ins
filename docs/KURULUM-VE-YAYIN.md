# Kurulum ve Üretime Alma Rehberi

## 1. Gereksinimler

- Node.js 20.9 veya üzeri (geliştirme Node 24 ile yapıldı)
- PostgreSQL 15 veya üzeri (yönetilen bir servis önerilir)
- Kalıcı disk (teklif fotoğrafları ve medya kütüphanesi için) — bkz. bölüm 4
- HTTPS sonlandırması yapan bir ters vekil veya platform (Nginx, Caddy, Cloudflare vb.)

## 2. Ortam değişkenleri

Tam liste `.env.example` dosyasındadır. Uygulama açılışta değerleri doğrular.

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `DATABASE_URL` | Evet | PostgreSQL bağlantı adresi |
| `SITE_URL` | Evet | `https://oceaninsaat.com.tr` (www’siz, sonda `/` yok). Canonical, sitemap ve JSON-LD bu değerden üretilir |
| `APP_SECRET` | Evet | En az 32 karakter. IP özetleme için kullanılır; üretimde eksikse uygulama çalışmaz |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Önerilir | Yeni talep bildirimleri. Tanımlı değilse talepler kaydedilir, bildirim yalnızca sunucu günlüğüne yazılır |
| `LEAD_NOTIFY_EMAIL` | Önerilir | Bildirim alıcıları, virgülle ayrılır |
| `STORAGE_DIR` | Evet | Yüklenen dosyaların kalıcı dizini (web kökü dışında) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Yalnızca `admin:create` | Uygulama çalışırken okunmaz; `.env` dosyasında tutmayın |

Gizli değerler kaynak koda yazılmamıştır ve `.env` dosyası sürüm kontrolüne alınmaz.

## 3. İlk yayın adımları

```bash
npm ci
npm run db:migrate                 # şemayı oluşturur
npm run db:seed                    # başlangıç içeriği (yalnızca ilk kurulumda)
ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run admin:create
npm run build                      # statik sayfalar üretilir; veritabanı erişilebilir olmalı
npm run start                      # varsayılan 3000 portu; `-- -p 8080` ile değiştirilebilir
```

Sonraki sürümlerde: `npm ci && npm run db:migrate && npm run build`, ardından süreci yeniden başlatın. `db:seed` tekrar çalıştırılsa da mevcut kayıtların üzerine yazmaz.

Süreç yönetimi için systemd veya PM2 kullanılabilir. Sağlık denetimi adresi: `GET /api/health` (veritabanı erişilemezse 503 döner).

## 4. Dosya depolama

Yüklenen görseller `STORAGE_DIR` altına yazılır:

- `leads/…` — teklif fotoğrafları. Herkese açık değildir; yalnızca oturum açmış yetkili kullanıcıya `/api/admin/attachments/:id` üzerinden sunulur.
- `media/…` — medya kütüphanesi. `/media/…` adresinden herkese açık sunulur.

Bu dizin **kalıcı bir birimde** olmalı ve yedeklenmelidir. Sunucusuz/geçici dosya sistemli platformlarda (ör. Vercel) yerel disk kalıcı değildir; bu durumda `src/server/storage.ts` içindeki üç işlev (`storeImage`, `readStored`, `deleteStored`) S3 uyumlu bir nesne deposuna bağlanmalıdır. Bu bağlayıcı henüz yazılmadı (bkz. `KALAN-ISLER.md`).

## 5. Ters vekil ve HTTPS

- Uygulama `X-Forwarded-For` başlığındaki ilk adresi istemci IP’si kabul eder (deneme sınırlandırması için). Vekilinizin bu başlığı **üzerine yazdığından** emin olun; aksi hâlde istemci sahte değer gönderebilir.
- `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` ve `Permissions-Policy` başlıkları uygulama tarafından eklenir (`next.config.ts`).
- `www.oceaninsaat.com.tr` → `oceaninsaat.com.tr` yönlendirmesi uygulamada tanımlıdır; DNS’te her iki ad da sunucuya işaret etmelidir.
- Statik varlıklar (`/_next/static`, `/images`, `/logo`) uzun süreli `immutable` önbellek başlığı taşır; önüne CDN konabilir.
- Yükleme sınırı: istek gövdesi 30 MB (5 fotoğraf × 8 MB). Vekilin `client_max_body_size` değeri buna uygun olmalı.

## 6. Önbellek ve içerik güncellemeleri

Herkese açık sayfalar statik üretilir ve bir saatte bir yenilenir. Yönetim panelinden yapılan her değişiklik bütün siteyi anında yeniler (`revalidatePath('/', 'layout')`). Uygulama birden fazla sunucu örneğinde çalıştırılacaksa Next.js için paylaşımlı bir önbellek işleyicisi yapılandırılmalıdır; tek örnekte ek ayar gerekmez.

## 7. Yedekleme

| Ne | Nasıl | Sıklık |
|---|---|---|
| Veritabanı | `pg_dump --format=custom "$DATABASE_URL" > yedek.dump` (veya yönetilen servisin otomatik yedeği) | Günlük, en az 14 gün saklama |
| `STORAGE_DIR` | Dosya düzeyinde yedek (rsync / nesne deposu sürümleme) | Günlük |
| Geri yükleme provası | `pg_restore` ile boş bir veritabanına | Üç ayda bir |

Yedekler kişisel veri içerir; erişimi sınırlandırın ve saklama süresini KVKK politikanızla uyumlu tutun.

## 8. Zamanlanmış görevler

```
# Her gece 03:30 — sonuçlanmış taleplerin fotoğraflarını 90 gün sonra siler
30 3 * * *  cd /uygulama && RETENTION_DAYS=90 npm run attachments:purge
```

Saklama süresini işletmenin KVKK politikasına göre belirleyin.

## 9. İzleme ve günlükler

- Uygulama hataları ve bildirim gönderim hataları standart çıktıya yazılır; süreç yöneticinizin günlük toplamasını kullanın.
- Çalışma süresi izleme için `/api/health` adresini bir izleme servisine tanımlayın.
- Hata izleme servisi (Sentry vb.) entegre **edilmedi**; önerilir.
- Yönetim panelindeki işlemler `audit_logs` tablosuna yazılır (panel → İşlem Kayıtları).

## 10. Yayın öncesi kontrol listesi

**Bilgi doğrulama (işletme sahibi)**
- [ ] Telefon, WhatsApp numarası ve e-posta adresleri doğru (panel → Ayarlar)
- [ ] Sosyal medya bağlantıları gerçekten işletmeye ait; olmayanlar boşaltıldı
- [ ] Çalışma saatleri güncel
- [ ] Paket kapsam başlıkları (KDV, malzeme, tavan, kat sayısı, süre) kararlaştırıldı ve panelde işaretlendi
- [ ] KVKK, gizlilik, çerez ve kullanım koşulları metinleri bir hukukçu tarafından onaylandı
- [ ] İncelemedeki 14 blog yazısı okundu; uygun olanlar yayınlandı
- [ ] Google İşletme Profili’ndeki ad, telefon, saatler ve hizmet bölgeleri siteyle aynı

**Teknik**
- [ ] `npm run typecheck && npm run lint && npm test && npm run test:e2e` geçiyor
- [ ] Üretim ortam değişkenleri tanımlı; `APP_SECRET` rastgele ve en az 32 karakter
- [ ] Yönetici hesabı güçlü parolayla oluşturuldu; test hesapları yok
- [ ] SMTP ile deneme talebi gönderildi, bildirim e-postası ulaştı
- [ ] Fotoğraflı deneme talebi gönderildi; fotoğraf panelde görünüyor, oturumsuz erişilemiyor
- [ ] `npm run seo:audit -- https://oceaninsaat.com.tr` hata sayısı 0
- [ ] `/teklif-formu` ve `/hizmetler/ic-dis-cephe-boya` 308 dönüyor; `www` çıplak alana yönleniyor
- [ ] GA4 kimliği ve Search Console doğrulama kodu girildi; çerez izni verildiğinde olaylar GA4 DebugView’da görünüyor
- [ ] Telefon ve WhatsApp bağlantıları gerçek bir telefonda denendi
- [ ] PageSpeed Insights ile ana sayfa, fiyat sayfası ve Sancaktepe sayfası ölçüldü
- [ ] Veritabanı ve depolama yedeği zamanlandı; `attachments:purge` görevi kuruldu
- [ ] Search Console adımları tamamlandı (bkz. `SEO-GECIS-RAPORU.md`, bölüm 7)
