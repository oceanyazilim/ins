import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { seedAreas } from '@content/seed/areas';
import { seedFaqs } from '@content/seed/faqs';
import { seedPackages } from '@content/seed/packages';
import { defaultSettings, EXCLUDED_AREA_SLUGS } from '@/config/site';
import { canonicalUrl, composeMetadata, fullTitle } from '@/seo/metadata';
import { articleSchema, breadcrumbSchema, businessSchema, offerSchema, serializeJsonLd, serviceSchema } from '@/seo/schema';

const BASE = 'https://oceaninsaat.com.tr';

describe('metadata üretimi', () => {
  it('canonical mutlak, tek domainde ve parametresizdir', () => {
    expect(canonicalUrl(BASE, '/')).toBe(BASE);
    expect(canonicalUrl(BASE, '/boya-fiyatlari/')).toBe(`${BASE}/boya-fiyatlari`);
    expect(canonicalUrl(BASE, '/teklif-al?paket=2-1-daire-boyama#x')).toBe(`${BASE}/teklif-al`);
  });
  it('başlığa markayı bir kez ekler', () => {
    expect(fullTitle('Ev Boyama Hizmetleri')).toBe('Ev Boyama Hizmetleri | Ocean İnşaat');
    expect(fullTitle('Sancaktepe Ev Boyama | Ocean İnşaat')).toBe('Sancaktepe Ev Boyama | Ocean İnşaat');
  });
  it('şablondan eksiksiz metadata üretir', () => {
    const m = composeMetadata(BASE, { path: '/ev-boyama', title: 'Ev Boyama Hizmetleri', description: 'Açıklama' });
    expect(m.title).toEqual({ absolute: 'Ev Boyama Hizmetleri | Ocean İnşaat' });
    expect(m.alternates?.canonical).toBe(`${BASE}/ev-boyama`);
    expect(m.openGraph?.url).toBe(`${BASE}/ev-boyama`);
    expect(JSON.stringify(m.openGraph?.images)).toContain(`${BASE}/images/og-default.jpg`);
    expect(m.robots).toMatchObject({ index: true, follow: true });
  });
  it('panelden girilen geçersiz kılmalar şablonun önüne geçer', () => {
    const m = composeMetadata(BASE, { path: '/x', title: 'T', description: 'D' }, { title: 'Özel Başlık', description: 'Özel açıklama', canonical: `${BASE}/asil`, noindex: true });
    expect(m.title).toEqual({ absolute: 'Özel Başlık' });
    expect(m.description).toBe('Özel açıklama');
    expect(m.alternates?.canonical).toBe(`${BASE}/asil`);
    expect(m.robots).toEqual({ index: false, follow: false });
  });
  it('boş geçersiz kılma alanları şablona döner', () => {
    const m = composeMetadata(BASE, { path: '/x', title: 'T', description: 'D' }, { title: '  ', description: null, canonical: null, noindex: false });
    expect(m.title).toEqual({ absolute: 'T | Ocean İnşaat' });
    expect(m.description).toBe('D');
  });
});

describe('yapılandırılmış veri', () => {
  const pkgs = seedPackages.map((p) => ({ slug: p.slug, name: p.name, price: p.price, currency: 'TRY' }));
  it('işletme şeması gerçek ayarlardan üretilir, puan/yorum içermez', () => {
    const s = businessSchema(BASE, defaultSettings, ['Sancaktepe', 'Çekmeköy']);
    const json = JSON.stringify(s);
    expect(s.telephone).toBe('+90 533 039 22 21');
    expect(s.email).toBe('destek@oceaninsaat.com.tr');
    expect(json).not.toMatch(/aggregateRating|"review"|ratingValue/);
    expect(json).not.toContain('streetAddress');
    expect(json).not.toMatch(/sultanbeyli/i);
    expect((s.areaServed as unknown[]).length).toBe(2);
  });
  it('sokak adresi yalnızca gösterime açıldığında eklenir', () => {
    const s = businessSchema(BASE, { ...defaultSettings, address: { ...defaultSettings.address, street: 'Örnek Sk. 1', showStreet: true } }, []);
    expect(JSON.stringify(s)).toContain('streetAddress');
  });
  it('teklif (Offer) tutarları paket fiyatlarıyla birebir aynıdır ve para birimi TRY’dir', () => {
    const s = serviceSchema(BASE, { path: '/boya-fiyatlari', name: 'Ev Boyama', description: 'x', packages: pkgs });
    const offers = s.offers as { price: number; priceCurrency: string; url: string }[];
    expect(offers.map((o) => o.price)).toEqual([25000, 30000, 35000]);
    expect(offers.every((o) => o.priceCurrency === 'TRY')).toBe(true);
    expect(offers[1]!.url).toBe(`${BASE}/ev-boyama/2-1-daire-boyama`);
  });
  it('geçerlilik tarihi yalnızca tanımlıysa yazılır', () => {
    expect(offerSchema(BASE, pkgs[0]!)).not.toHaveProperty('priceValidUntil');
    expect(offerSchema(BASE, { ...pkgs[0]!, validUntil: '2026-12-31' })).toHaveProperty('priceValidUntil', '2026-12-31');
  });
  it('kırıntı ve makale şemaları', () => {
    const b = breadcrumbSchema(BASE, [{ name: 'Ana Sayfa', path: '/' }, { name: 'Blog', path: '/blog' }]);
    expect((b.itemListElement as { item: string; position: number }[]).map((i) => [i.position, i.item])).toEqual([[1, BASE], [2, `${BASE}/blog`]]);
    const a = articleSchema(BASE, { path: '/blog/x', title: 'T', description: 'D', publishedAt: new Date('2026-01-01'), updatedAt: new Date('2026-02-01'), authorName: 'Ocean İnşaat' }, defaultSettings);
    expect(a['@type']).toBe('BlogPosting');
    expect(a.dateModified).toBe('2026-02-01T00:00:00.000Z');
  });
  it('JSON-LD çıktısı betik etiketini kapatamaz', () => {
    expect(serializeJsonLd({ x: '</script><script>alert(1)</script>' })).not.toContain('</script>');
  });
});

describe('başlangıç verisi kuralları', () => {
  it('paket fiyatları şartnamedeki tutarlardır', () => {
    expect(Object.fromEntries(seedPackages.map((p) => [p.roomType, p.price]))).toEqual({ '1+1': 25000, '2+1': 30000, '3+1': 35000 });
  });
  it('birincil bölgeler aktiftir; ikincil ilçeler onaylanana kadar pasiftir', () => {
    const active = seedAreas.filter((a) => a.active).map((a) => a.slug);
    expect(active).toEqual(['sancaktepe', 'cekmekoy', 'umraniye', 'kadikoy', 'uskudar']);
    expect(seedAreas.find((a) => a.isHub)?.slug).toBe('sancaktepe');
    for (const s of ['pendik', 'atasehir', 'kartal', 'maltepe']) expect(seedAreas.find((a) => a.slug === s)?.active).toBe(false);
  });
  it('hariç tutulan bölge hiçbir veri kümesinde yoktur', () => {
    for (const a of seedAreas) {
      expect(EXCLUDED_AREA_SLUGS).not.toContain(a.slug);
      expect(JSON.stringify(a).toLocaleLowerCase('tr')).not.toContain('sultanbeyli');
    }
  });
  it('lokasyon sayfaları birbirinin kopyası değildir', () => {
    const pages = seedAreas.filter((a) => a.pagePublished);
    const bodies = pages.map((a) => (a.sections ?? []).map((s) => s.body).join(' '));
    for (let i = 0; i < bodies.length; i++) {
      expect(bodies[i]!.length, pages[i]!.name).toBeGreaterThan(900);
      for (let j = i + 1; j < bodies.length; j++) {
        // İlçe adları çıkarıldığında metinler aynı olmamalı ve ortak cümle oranı düşük kalmalı.
        const norm = (t: string, name: string) => t.replaceAll(name, '').split(/[.!?]\s+/).map((x) => x.trim()).filter((x) => x.length > 40);
        const a = new Set(norm(bodies[i]!, pages[i]!.name));
        const shared = norm(bodies[j]!, pages[j]!.name).filter((x) => a.has(x)).length;
        expect(shared, `${pages[i]!.name} / ${pages[j]!.name}`).toBe(0);
      }
    }
  });
  it('SSS metinlerinde elle yazılmış fiyat yoktur (yalnızca yer tutucu)', () => {
    expect(JSON.stringify(seedFaqs)).not.toMatch(/\d{2}\.\d{3}\s*TL/);
  });
});

describe('içerik dosyaları', () => {
  const read = (dir: string) => fs.readdirSync(dir).map((f) => ({ f, text: fs.readFileSync(path.join(dir, f), 'utf8') }));
  const files = [...read('content/blog'), ...read('content/services')];
  it('hariç tutulan bölge ve yasak iddialar içermez', () => {
    for (const { f, text } of files) {
      const lower = text.toLocaleLowerCase('tr');
      expect(lower, f).not.toContain('sultanbeyli');
      expect(lower, f).not.toContain('avrupa yakası');
      expect(lower, f).not.toMatch(/%\s?100 (müşteri )?memnuniyet|bir numara|en ucuz|türkiye'nin en iyi/);
    }
  });
  it('yalnızca doğrulanmış paket fiyatlarını içerir', () => {
    const allowed = new Set(['25.000', '30.000', '35.000']);
    for (const { f, text } of files) {
      for (const m of text.matchAll(/(\d{1,3}(?:\.\d{3})+|\d+)\s*(?:TL|₺|lira)/gi)) expect(allowed.has(m[1]!), `${f}: ${m[0]}`).toBe(true);
    }
  });
});
