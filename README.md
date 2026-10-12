# Ocean İnşaat — Web Platformu v3

Sancaktepe merkezli ev boyama, boya badana, tadilat ve inşaat hizmetleri için kurumsal web sitesi, teklif toplama sistemi ve yönetim paneli.

- **Canlı alan adı:** https://oceaninsaat.com.tr
- **Teknoloji:** Next.js 16 (App Router, React 19), TypeScript, Tailwind CSS 4, PostgreSQL, Drizzle ORM, Zod, React Hook Form, Vitest, Playwright

## Hızlı başlangıç (yerel)

```bash
npm install
cp .env.example .env            # APP_SECRET değerini doldurun: openssl rand -hex 32
npm run db:start                # gömülü PostgreSQL (ayrı terminalde açık kalır; kurulum gerektirmez)
npm run db:setup                # migration + başlangıç verisi
ADMIN_EMAIL=siz@ornek.com ADMIN_PASSWORD='en-az-12-karakter' npm run admin:create
npm run dev                     # http://localhost:3000  ·  panel: /admin
```

Windows PowerShell’de ortam değişkeni: `$env:ADMIN_EMAIL='…'; $env:ADMIN_PASSWORD='…'; npm run admin:create`

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` / `build` / `start` | Geliştirme sunucusu / üretim derlemesi / üretim sunucusu |
| `npm run db:start` | Yerel gömülü PostgreSQL (54329 portu, veriler `.data/pg`) |
| `npm run db:generate` | Şema değişikliğinden yeni migration üretir (`drizzle/`) |
| `npm run db:migrate` · `db:seed` · `db:setup` | Migration uygular · başlangıç verisini yükler · ikisi birden |
| `npm run admin:create` | Yönetici/editör hesabı oluşturur veya parolasını yeniler |
| `npm run typecheck` · `lint` | TypeScript · ESLint |
| `npm test` | Birim + entegrasyon testleri (izole `ocean_test` veritabanı) |
| `npm run test:e2e` | Uçtan uca testler (üretim derlemesine karşı, Playwright) |
| `npm run seo:audit -- <adres> [rapor.md]` | SEO kalite kapıları, kırık bağlantı ve yetim sayfa denetimi |
| `npm run attachments:purge` | Sonuçlanmış taleplerin fotoğraflarını saklama süresi sonunda siler |
| `npm run assets:build` | Paylaşım görseli ve ikonları resmi logodan yeniden üretir |

`db:seed` var olan kayıtların üzerine yazmaz (panelden yapılan değişiklikler korunur). `npx tsx scripts/seed.ts --reset` içerik tablolarını boşaltıp yeniden kurar; talepleri ve kullanıcıları silmez.

## Dizin yapısı

```
content/            Başlangıç içeriği
  blog/             20 rehber yazısı (Markdown + frontmatter)
  services/         9 yeni hizmet sayfası (JSON)
  legacy/           Mevcut siteden taşınan içerik (hizmet, proje, blog, lokasyon)
  seed/             Paketler, bölgeler, SSS, kategoriler
  corporate.ts      Kurumsal, süreç, kat karşılığı içerikleri
  legal.ts          KVKK, gizlilik, çerez, kullanım koşulları
drizzle/            SQL migration dosyaları
e2e/                Playwright senaryoları
scripts/            Veritabanı, yönetici, SEO denetimi, varlık üretimi
src/
  app/(site)/       Herkese açık sayfalar (Server Components)
  app/admin/        Yönetim paneli
  app/api/          Sağlık denetimi, kimlik doğrulamalı fotoğraf sunumu
  analytics/        Ölçüm olayları, çerez izni, kampanya ilişkilendirme
  components/       Arayüz bileşenleri (ui, sections, interactive, site)
  config/           İşletme varsayılanları, menü, sabit yönlendirmeler
  db/               Drizzle şeması ve bağlantı
  features/quote/   Teklif formu, doğrulama şeması, sunucu işlemleri
  features/admin/   Panel işlemleri, form bileşenleri, metin dönüştürücüler
  lib/              Saf yardımcılar (biçimlendirme, slug, markdown, yetki, yer tutucular)
  seo/              Metadata, JSON-LD, dizinlenebilir yol listesi
  server/           Sunucuya özel modüller (veri erişimi, oturum, depolama, e-posta)
tests/              Vitest: unit + integration
```

## Temel tasarım kararları

- **Fiyatın tek kaynağı veritabanıdır** (`painting_packages`). Bileşenlerde, içerikte veya şemada elle fiyat yazılmaz; metinlerde `{{fiyat:2+1}}` yer tutucusu kullanılır. Panelden yapılan değişiklik ana sayfa, fiyat sayfası, paket sayfaları, lokasyon sayfaları, teklif formu, SSS ve JSON-LD’ye aynı anda yansır.
- **Hizmet bölgeleri veriyle yönetilir.** Yalnızca `active` bölgeler sitede, menüde, teklif formunda ve yapılandırılmış veride görünür. Hariç tutulan bölgeler (`EXCLUDED_AREA_SLUGS`) seed, panel ve form doğrulamasında reddedilir.
- **Doğrulanmamış ticari bilgi taahhüt olarak gösterilmez.** KDV, malzeme, tavan, kat sayısı, süre gibi başlıklar “teklifte netleşir” durumundadır; panelden dahil / dahil değil olarak işaretlenebilir.
- **SEO içeriği sunucudan gelir.** Bütün başlıklar, metinler, fiyatlar ve bağlantılar ilk HTML’dedir; kaydırma animasyonları JavaScript yoksa içeriği gizlemez.
- **Animasyon kütüphanesi yok.** Hareket sistemi CSS geçişleri, tek bir `IntersectionObserver` ve birkaç küçük istemci bileşeninden oluşur; `prefers-reduced-motion` tercihinde devre dışıdır.
- **shadcn/ui ve Radix kullanılmadı.** Akordeon, diyalog ve çekmece için yerel `<details>` / `<dialog>` öğeleri yeterli erişilebilirliği sağladığından ek bağımlılık eklenmedi.

## Belgeler

| Belge | İçerik |
|---|---|
| [docs/KURULUM-VE-YAYIN.md](docs/KURULUM-VE-YAYIN.md) | Üretime alma, ortam değişkenleri, yedekleme, yayın öncesi kontrol listesi |
| [docs/YONETIM-PANELI.md](docs/YONETIM-PANELI.md) | Panel kullanım kılavuzu |
| [docs/SEO-GECIS-RAPORU.md](docs/SEO-GECIS-RAPORU.md) | Mevcut site denetimi, 73 adresin eşlemesi, Search Console kontrol listesi |
| [docs/SEO-PLANI.md](docs/SEO-PLANI.md) | Anahtar kelime eşlemesi, içerik kümeleri, 90 günlük yol haritası |
| [docs/TEST-SONUCLARI.md](docs/TEST-SONUCLARI.md) | Çalıştırılan testler ve sonuçları |
| [docs/seo-denetim-raporu.md](docs/seo-denetim-raporu.md) | Son SEO denetimi çıktısı |
| [docs/KALAN-ISLER.md](docs/KALAN-ISLER.md) | Eksikler, doğrulanması gereken bilgiler, yapılmayanlar |
| [docs/GORSEL-LISANSLARI.md](docs/GORSEL-LISANSLARI.md) | Görsel kaynakları ve lisanslar |
