import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const ADMIN = { email: 'e2e-admin@test.local', password: 'E2E-Parola-Test-2026!' };
const SITE = 'https://oceaninsaat.com.tr';

async function login(page: Page) {
  await page.goto('/admin/giris');
  await page.getByLabel('E-posta').fill(ADMIN.email);
  await page.getByLabel('Parola').fill(ADMIN.password);
  await page.getByRole('button', { name: 'Giriş yap' }).click();
  await expect(page.getByRole('heading', { name: 'Genel Bakış' })).toBeVisible();
}

const jsonLd = (page: Page) =>
  page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.flatMap((e) => JSON.parse(e.textContent ?? '[]')) as Record<string, unknown>[]);

test.describe('Teklif akışı', () => {
  test('2+1 paketi seçilir, 30.000 TL görülür, talep oluşur ve yönetim panelinde görünür', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Yaşam Alanlarınıza Yeni Bir Görünüm.');

    // Paket seçimi
    const selector = page.getByTestId('pricing-selector');
    await selector.scrollIntoViewIfNeeded();
    await selector.getByText('2+1', { exact: true }).click();
    await expect(page.getByTestId('selector-price')).toHaveText('30.000 TL');
    await page.getByTestId('selector-cta').click();

    // Teklif formu: seçim korunur
    await expect(page).toHaveURL(/\/teklif-al\?paket=2-1-daire-boyama/);
    await expect(page.getByTestId('quote-selected-package')).toContainText('30.000 TL');

    // Kapsam (isteğe bağlı)
    await expect(page.getByRole('heading', { name: 'Neleri yaptırmak istiyorsunuz?' })).toBeVisible();
    await page.getByLabel('Duvar boya').check();
    await page.getByLabel('Tavan boya').check();
    await page.getByTestId('quote-next').click();

    // Daire durumu
    await page.getByLabel('Eşyalı').check();
    await page.getByTestId('quote-next').click();

    // Konum: ilçe zorunlu
    await page.getByTestId('quote-next').click();
    await expect(page.getByText('Lütfen ilçe seçin.')).toBeVisible();
    await page.getByLabel(/^İlçe/).selectOption('Sancaktepe');
    await page.getByLabel(/^Mahalle/).fill('Sarıgazi');
    await page.getByLabel(/^Açıklama/).fill('E2E test talebi: salon ve iki oda.');
    await page.getByTestId('quote-next').click();

    // Fotoğraf adımı atlanır
    await expect(page.getByRole('heading', { name: 'Fotoğraf eklemek ister misiniz?' })).toBeVisible();
    await page.getByTestId('quote-next').click();

    // İletişim: doğrulama hataları satır içi gösterilir
    await page.getByTestId('quote-next').click();
    await expect(page.getByText('Lütfen adınızı ve soyadınızı yazın.')).toBeVisible();
    await page.getByLabel(/^Ad soyad/).fill('E2E Test Müşterisi');
    await page.getByRole('textbox', { name: /Telefon/ }).fill('0533 111 22 33');
    await page.getByRole('checkbox', { name: /KVKK Aydınlatma Metni/ }).check();
    await page.getByTestId('quote-next').click();

    // Özet
    const summary = page.getByTestId('quote-summary');
    await expect(summary).toContainText('Ev Boyama');
    await expect(summary).toContainText('2+1');
    await expect(summary).toContainText('30.000 TL');
    await expect(summary).toContainText('Sarıgazi / Sancaktepe / İstanbul');
    await page.getByTestId('quote-submit').click();

    // Teşekkür ekranı ve talep numarası
    await expect(page.getByTestId('quote-success')).toBeVisible();
    const ref = (await page.getByTestId('quote-ref').textContent())!.trim();
    expect(ref).toMatch(/^OCN-\d{4}-[2-9A-Z]{5}$/);

    // Yönetim panelinde görünür
    await login(page);
    await page.goto(`/admin/talepler?q=${ref}`);
    const row = page.getByTestId('lead-row');
    await expect(row).toHaveCount(1);
    await expect(row).toContainText('E2E Test Müşterisi');
    await expect(row).toContainText('Sancaktepe');
    await expect(row).toContainText('30.000 TL');
    await row.getByRole('link', { name: 'Aç' }).click();
    await expect(page.getByTestId('lead-name')).toHaveText('E2E Test Müşterisi');
    await expect(page.getByText('Duvar boya, Tavan boya')).toBeVisible();
    await expect(page.getByText('Ticari ileti: hayır')).toBeVisible();

    // Durum güncellenir
    await page.getByLabel('Durum').selectOption('contacted');
    await page.getByLabel('Not ekle').fill('Telefonla arandı.');
    await page.getByRole('button', { name: 'Güncelle' }).click();
    await expect(page.getByTestId('flash-ok')).toBeVisible();
    await expect(page.getByText('Yeni → İletişime geçildi')).toBeVisible();
  });

  test('4+1 daire için fiyat uydurulmaz', async ({ page }) => {
    await page.goto('/teklif-al?hizmet=ev-boyama');
    await page.getByText('4+1', { exact: true }).click();
    await expect(page.getByTestId('quote-price-note')).toContainText('ilan edilmiş bir paket fiyatı yoktur');
    await expect(page.getByTestId('quote-price-note')).not.toContainText('TL');
  });
});

test.describe('Hizmet bölgeleri', () => {
  test('Sultanbeyli ve pasif ilçeler hiçbir standart seçenekte yoktur', async ({ page }) => {
    await page.goto('/teklif-al?paket=1-1-daire-boyama');
    await page.getByTestId('quote-next').click();
    await page.getByTestId('quote-next').click();
    const options = await page.getByLabel(/^İlçe/).locator('option').allTextContents();
    expect(options).toEqual(['Seçin', 'Sancaktepe', 'Çekmeköy', 'Ümraniye', 'Kadıköy', 'Üsküdar', 'Listede yok']);

    for (const path of ['/', '/hizmet-bolgeleri', '/ev-boyama', '/boya-fiyatlari', '/iletisim', '/sancaktepe-ev-boyama', '/sitemap.xml']) {
      const res = await page.request.get(path);
      const body = (await res.text()).toLocaleLowerCase('tr');
      expect(body, path).not.toContain('sultanbeyli');
      expect(body, path).not.toContain('pendik-ev-boyama');
    }
    for (const path of ['/sultanbeyli-ev-boyama', '/pendik-ev-boyama', '/kartal-ev-boyama']) {
      expect((await page.request.get(path)).status(), path).toBe(404);
    }
  });

  test('aktif lokasyon sayfaları özgün başlıklarla yayındadır', async ({ page }) => {
    const pages = { '/sancaktepe-ev-boyama': 'Sancaktepe Ev Boyama ve Boya Badana Hizmetleri', '/cekmekoy-ev-boyama': 'Çekmeköy Ev Boyama ve Boya Badana', '/umraniye-ev-boyama': 'Ümraniye Ev Boyama Hizmeti', '/kadikoy-ev-boyama': 'Kadıköy Ev Boyama ve Boya Badana', '/uskudar-ev-boyama': 'Üsküdar Ev Boyama Hizmeti' };
    for (const [path, h1] of Object.entries(pages)) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${path}`);
      await expect(page.getByTestId('price-2+1')).toHaveText('30.000 TL');
    }
  });
});

test.describe('Fiyat yönetimi', () => {
  test('yönetici 1+1 fiyatını değiştirir; ana sayfa, fiyat sayfası ve schema aynı fiyatı gösterir', async ({ page }) => {
    await login(page);
    await page.goto('/admin/fiyatlar');
    await page.getByRole('row', { name: /1\+1 Ev Boyama/ }).getByRole('link', { name: 'Düzenle' }).click();
    await page.getByLabel('Fiyat (TRY)').fill('26500');
    await page.getByRole('button', { name: 'Paketi kaydet' }).click();
    await expect(page.getByTestId('flash-ok')).toBeVisible();
    await expect(page.getByTestId('price-history')).toContainText('25.000 TL → 26.500 TL');

    await page.goto('/');
    await expect(page.getByTestId('price-1+1')).toHaveText('26.500 TL');
    await expect(page.locator('main')).not.toContainText('25.000 TL');

    await page.goto('/boya-fiyatlari');
    await expect(page.getByTestId('table-price-1+1')).toHaveText('26.500 TL');
    const offers = (await jsonLd(page)).flatMap((n) => (n.offers as { price: number; priceCurrency: string; name: string }[] | undefined) ?? []);
    expect(offers.map((o) => [o.name, o.price, o.priceCurrency])).toEqual([['1+1 Ev Boyama', 26500, 'TRY'], ['2+1 Ev Boyama', 30000, 'TRY'], ['3+1 Ev Boyama', 35000, 'TRY']]);

    await page.goto('/ev-boyama/1-1-daire-boyama');
    await expect(page.getByTestId('package-price')).toHaveText('26.500 TL');
    // SSS metnindeki yer tutucu da güncellenir
    await page.goto('/');
    await expect(page.locator('#sss')).toContainText('26.500 TL');

    // Fiyat eski değerine döndürülür
    await page.goto('/admin/fiyatlar');
    await page.getByRole('row', { name: /1\+1 Ev Boyama/ }).getByRole('link', { name: 'Düzenle' }).click();
    await page.getByLabel('Fiyat (TRY)').fill('25000');
    await page.getByRole('button', { name: 'Paketi kaydet' }).click();
    await expect(page.getByTestId('flash-ok')).toBeVisible();
    await page.goto('/');
    await expect(page.getByTestId('price-1+1')).toHaveText('25.000 TL');
  });

  test('yönetim paneli oturumsuz erişime kapalıdır', async ({ page, request }) => {
    for (const path of ['/admin', '/admin/talepler', '/admin/fiyatlar', '/admin/ayarlar']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/giris/);
    }
    expect((await request.get('/api/admin/attachments/1')).status()).toBe(401);
    await page.goto('/admin/giris');
    await page.getByLabel('E-posta').fill(ADMIN.email);
    await page.getByLabel('Parola').fill('yanlis-parola');
    await page.getByRole('button', { name: 'Giriş yap' }).click();
    await expect(page.getByTestId('flash-error')).toHaveText('E-posta veya parola hatalı.');
  });

  test('hariç tutulan bölge yönetim panelinden de eklenemez; zincir yönlendirme reddedilir', async ({ page }) => {
    await login(page);
    await page.goto('/admin/bolgeler');
    await page.getByLabel('İlçe adı').fill('Sultanbeyli');
    await page.getByRole('button', { name: 'Ekle' }).click();
    await expect(page.getByTestId('flash-error')).toContainText('eklenemez');

    await page.goto('/admin/yonlendirmeler');
    await page.getByLabel('Eski adres').fill('/eski-boya-sayfasi');
    await page.getByLabel('Yeni adres').fill('/boya-fiyatlari');
    await page.getByRole('button', { name: 'Ekle' }).click();
    await expect(page.getByTestId('flash-ok')).toBeVisible();
    const res = await page.request.get('/eski-boya-sayfasi', { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers().location).toContain('/boya-fiyatlari');

    await page.getByLabel('Eski adres').fill('/baska-eski');
    await page.getByLabel('Yeni adres').fill('/teklif-formu');
    await page.getByRole('button', { name: 'Ekle' }).click();
    await expect(page.getByTestId('flash-error')).toContainText('zincir');
  });
});

test.describe('Teknik SEO', () => {
  test('robots.txt, sitemap.xml ve durum kodları', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Disallow: /admin');
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);

    const sitemap = await (await request.get('/sitemap.xml')).text();
    for (const p of ['', '/ev-boyama', '/boya-fiyatlari', '/ev-boyama/2-1-daire-boyama', '/sancaktepe-ev-boyama', '/cekmekoy-ev-boyama', '/umraniye-ev-boyama', '/hizmetler/ic-cephe-boyama', '/projeler/sancaktepe-atak-apartmani-1', '/blog/anahtar-teslim-insaat-nedir', '/kurumsal']) {
      expect(sitemap, p).toContain(`<loc>${SITE}${p}</loc>`);
    }
    expect(sitemap).not.toContain('/admin');
    expect(sitemap).not.toContain('://www.oceaninsaat');
    // İncelemedeki (yayınlanmamış) yazı site haritasında yer almaz
    expect(sitemap).not.toContain('/blog/ev-boyama-kac-gun-surer');

    expect((await request.get('/olmayan-sayfa')).status()).toBe(404);
    expect((await request.get('/blog/olmayan-yazi')).status()).toBe(404);
    expect((await request.get('/blog/ev-boyama-kac-gun-surer')).status()).toBe(404);
    for (const [from, to] of [['/teklif-formu', '/teklif-al'], ['/hizmetler/ic-dis-cephe-boya', '/hizmetler/ic-cephe-boyama'], ['/hakkimizda', '/kurumsal'], ['/projelerimiz', '/projeler']]) {
      const res = await request.get(from!, { maxRedirects: 0 });
      expect(res.status(), from).toBe(308);
      expect(res.headers().location, from).toBe(to);
    }
    const admin = await request.get('/admin/giris');
    expect(admin.headers()['x-robots-tag']).toContain('noindex');
  });

  test('her önemli sayfada benzersiz başlık, açıklama, canonical ve tek H1 vardır; içerik sunucudan gelir', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    const paths = ['/', '/ev-boyama', '/boya-fiyatlari', '/ev-boyama/1-1-daire-boyama', '/ev-boyama/2-1-daire-boyama', '/ev-boyama/3-1-daire-boyama', '/teklif-al', '/hizmetler', '/hizmetler/boya-badana', '/hizmetler/ev-tadilati', '/projeler', '/blog', '/hizmet-bolgeleri', '/sancaktepe-ev-boyama', '/cekmekoy-ev-boyama', '/umraniye-ev-boyama', '/kurumsal', '/iletisim'];
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const path of paths) {
      await page.goto(path);
      const title = await page.title();
      const desc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(title.length, path).toBeGreaterThan(10);
      expect(desc?.length ?? 0, path).toBeGreaterThan(50);
      expect(titles.has(title), `yinelenen başlık: ${title}`).toBe(false);
      expect(descriptions.has(desc!), `yinelenen açıklama: ${path}`).toBe(false);
      titles.add(title);
      descriptions.add(desc!);
      await expect(page.locator('link[rel="canonical"]'), path).toHaveAttribute('href', path === '/' ? SITE : `${SITE}${path}`);
      await expect(page.locator('h1'), path).toHaveCount(1);
      // JS kapalıyken içerik görünür olmalı (animasyon sınıfları içeriği gizlemez)
      await expect(page.locator('h1'), path).toBeVisible();
      await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute('content', /index, follow/);
    }
    // Fiyatlar JS olmadan ilk HTML'de bulunur
    await page.goto('/boya-fiyatlari');
    await expect(page.getByTestId('price-table')).toContainText('30.000 TL');
    await page.goto('/');
    await expect(page.getByTestId('price-3+1')).toBeVisible();
    await ctx.close();
  });

  test('iletişim bağlantıları güncel numara ve adreslerle çalışır', async ({ page }) => {
    await page.goto('/iletisim');
    await expect(page.locator('main a[href="tel:+905330392221"]').first()).toBeVisible();
    await expect(page.locator('main a[href="mailto:destek@oceaninsaat.com.tr"]')).toBeVisible();
    await expect(page.locator('main a[href="mailto:info@oceaninsaat.com.tr"]')).toBeVisible();
    const wa = await page.locator('main a[href^="https://wa.me/905330392221"]').first().getAttribute('href');
    expect(decodeURIComponent(wa!)).toContain('Merhaba Ocean İnşaat');
    const html = await page.content();
    expect(html).not.toContain('532 766 06 83');
    expect(html).not.toContain('905327660683');
    const business = (await jsonLd(page)).find((n) => Array.isArray(n['@type']) && (n['@type'] as string[]).includes('HousePainter'));
    expect(business?.telephone).toBe('+90 533 039 22 21');
  });
});

test.describe('Erişilebilirlik ve responsive', () => {
  for (const path of ['/', '/boya-fiyatlari', '/ev-boyama', '/teklif-al', '/sancaktepe-ev-boyama', '/blog/salon-icin-boya-renkleri', '/iletisim']) {
    test(`axe: ${path} sayfasında ciddi erişilebilirlik ihlali yok`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
    });
  }

  test('320–1920 px arasında yatay taşma yok', async ({ page }) => {
    for (const width of [320, 360, 390, 430, 768, 1024, 1280, 1920]) {
      await page.setViewportSize({ width, height: 800 });
      for (const path of ['/', '/boya-fiyatlari', '/teklif-al', '/hizmetler']) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${path} @ ${width}px`).toBeLessThanOrEqual(0);
      }
    }
  });

  test('klavye: içeriğe geç bağlantısı ve öncesi/sonrası bileşeni', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'İçeriğe geç' })).toBeFocused();
    // Mobil menü: açılır, Esc ile kapanır
    await page.setViewportSize({ width: 390, height: 800 });
    await page.getByRole('button', { name: 'Menüyü aç' }).click();
    await expect(page.getByRole('dialog', { name: 'Site menüsü' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Site menüsü' })).toBeHidden();
  });
});
