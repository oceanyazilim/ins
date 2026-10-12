import { describe, expect, it } from 'vitest';
import { staticRedirects } from '@/config/redirects';
import { EXCLUDED_AREA_SLUGS } from '@/config/site';
import { areaPageIssues, parseFaqs, parseScopeItems, parseSections, parseSteps, scopeItemsToText } from '@/features/admin/parse';
import { OTHER_PREFIX, resolveDistrict } from '@/features/quote/district';
import { quoteSchema } from '@/features/quote/schema';
import { formatPhone, formatPrice, normalizeTrPhone, whatsappUrl } from '@/lib/format';
import { renderMarkdown } from '@/lib/markdown';
import { can } from '@/lib/permissions';
import { hashPassword, verifyPassword } from '@/lib/password';
import { normalizePath, validateRedirect } from '@/lib/redirect-rules';
import { isValidSlug, slugify } from '@/lib/slug';
import { fillTokens, joinTr, unlinkMissingPosts } from '@/lib/tokens';

describe('fiyat ve telefon biçimlendirme', () => {
  it('fiyatı Türk lirası biçiminde yazar', () => {
    expect(formatPrice(25000)).toBe('25.000 TL');
    expect(formatPrice(30000)).toBe('30.000 TL');
    expect(formatPrice(35000, 'TRY')).toBe('35.000 TL');
  });
  it('telefonu E.164 biçimine çevirir ve okunur yazar', () => {
    for (const v of ['0533 039 22 21', '+90 533 039 22 21', '905330392221', '5330392221', '0090 533 039 2221']) {
      expect(normalizeTrPhone(v)).toBe('+905330392221');
    }
    expect(formatPhone('+905330392221')).toBe('+90 533 039 22 21');
    expect(normalizeTrPhone('12345')).toBeNull();
    expect(normalizeTrPhone('0933 039 22 21')).toBeNull();
  });
  it('WhatsApp bağlantısı yalnızca sohbet başlatır', () => {
    expect(whatsappUrl('905330392221', 'Merhaba, 2+1 ev boyama paketi için teklif almak istiyorum.')).toBe(
      'https://wa.me/905330392221?text=Merhaba%2C%202%2B1%20ev%20boyama%20paketi%20i%C3%A7in%20teklif%20almak%20istiyorum.',
    );
  });
});

describe('slug üretimi', () => {
  it('Türkçe karakterleri güvenilir biçimde dönüştürür', () => {
    expect(slugify('Çekmeköy Ev Boyama')).toBe('cekmekoy-ev-boyama');
    expect(slugify('Ümraniye Boya Badana Fiyatları')).toBe('umraniye-boya-badana-fiyatlari');
    expect(slugify('IŞIK İĞNE Şöğüt')).toBe('isik-igne-sogut');
    expect(slugify('1+1 Daire Boyama')).toBe('1-1-daire-boyama');
    expect(slugify('  --Alçı & Sıva!  ')).toBe('alci-siva');
  });
  it('slug doğrulaması', () => {
    expect(isValidSlug('sancaktepe-ev-boyama')).toBe(true);
    expect(isValidSlug('Sancaktepe')).toBe(false);
    expect(isValidSlug('a--b')).toBe(false);
  });
});

describe('içerik yer tutucuları (merkezi fiyat)', () => {
  const ctx = { packages: [{ roomType: '1+1', price: 25000, currency: 'TRY' }, { roomType: '2+1', price: 30000, currency: 'TRY' }], areaNames: ['Sancaktepe', 'Çekmeköy', 'Ümraniye'], phone: '+905330392221', email: 'destek@oceaninsaat.com.tr' };
  it('fiyat, bölge, telefon ve e-posta yer tutucularını doldurur', () => {
    expect(fillTokens('1+1: {{fiyat:1+1}}, 2+1: {{fiyat:2+1}}', ctx)).toBe('1+1: 25.000 TL, 2+1: 30.000 TL');
    expect(fillTokens('{{bolgeler}}', ctx)).toBe('Sancaktepe, Çekmeköy ve Ümraniye');
    expect(fillTokens('{{telefon}} / {{eposta}}', ctx)).toBe('+90 533 039 22 21 / destek@oceaninsaat.com.tr');
  });
  it('tanımsız paket için fiyat uydurmaz', () => {
    expect(fillTokens('{{fiyat:4+1}}', ctx)).toBe('güncel fiyat');
  });
  it('joinTr', () => {
    expect(joinTr(['A'])).toBe('A');
    expect(joinTr(['A', 'B'])).toBe('A ve B');
  });
  it('yayında olmayan yazılara bağlantıları kaldırır', () => {
    const md = '[yayında](/blog/a) ve [taslak](/blog/b) ve [hizmet](/ev-boyama)';
    expect(unlinkMissingPosts(md, new Set(['a']))).toBe('[yayında](/blog/a) ve taslak ve [hizmet](/ev-boyama)');
  });
});

describe('yetki kontrolleri', () => {
  it('yönetici her şeyi yapar', () => {
    expect(can('admin', 'pricing.manage')).toBe(true);
    expect(can('admin', 'users.manage')).toBe(true);
  });
  it('editör fiyat, bölge, SEO, ayar ve silme işlemlerine erişemez', () => {
    for (const p of ['pricing.manage', 'areas.manage', 'seo.manage', 'settings.manage', 'users.manage', 'leads.delete', 'audit.view'] as const) {
      expect(can('editor', p)).toBe(false);
    }
    expect(can('editor', 'content.manage')).toBe(true);
    expect(can('editor', 'leads.view')).toBe(true);
  });
  it('oturumsuz kullanıcı hiçbir şey yapamaz', () => {
    expect(can(null, 'leads.view')).toBe(false);
    expect(can(undefined, 'content.manage')).toBe(false);
  });
});

describe('parola özetleme', () => {
  it('doğru parolayı kabul eder, yanlışı reddeder ve tuzlu özet üretir', async () => {
    const a = await hashPassword('Güçlü-Parola-123!');
    const b = await hashPassword('Güçlü-Parola-123!');
    expect(a).not.toBe(b);
    expect(a.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('Güçlü-Parola-123!', a)).toBe(true);
    expect(await verifyPassword('yanlis', a)).toBe(false);
    expect(await verifyPassword('x', 'gecersiz')).toBe(false);
  });
});

describe('yönlendirme kuralları', () => {
  const existing = [{ source: '/a', destination: '/b' }];
  it('yolları normalleştirir', () => {
    expect(normalizePath('https://oceaninsaat.com.tr/Eski-Sayfa/?x=1#y')).toBe('/eski-sayfa');
    expect(normalizePath('eski')).toBe('/eski');
    expect(normalizePath('/')).toBe('/');
  });
  it('geçerli kuralı kabul eder', () => {
    expect(validateRedirect({ source: '/eski', destination: '/yeni' }, existing)).toBeNull();
  });
  it('döngü ve zincirleri engeller', () => {
    expect(validateRedirect({ source: '/x', destination: '/x' }, existing)).toMatch(/döngü/);
    expect(validateRedirect({ source: '/c', destination: '/a' }, existing)).toMatch(/zincir/);
    expect(validateRedirect({ source: '/b', destination: '/d' }, existing)).toMatch(/zincir/);
    expect(validateRedirect({ source: '/a', destination: '/z' }, existing)).toMatch(/zaten/);
  });
  it('korumalı yolları kaynak olarak kabul etmez', () => {
    expect(validateRedirect({ source: '/', destination: '/x' }, [])).not.toBeNull();
    expect(validateRedirect({ source: '/admin/x', destination: '/x' }, [])).not.toBeNull();
  });
  it('sabit yönlendirmeler tek atlamalıdır', () => {
    const sources = new Set(staticRedirects.map((r) => r.source));
    for (const r of staticRedirects) expect(sources.has(r.destination), `${r.source} → ${r.destination} zincir oluşturuyor`).toBe(false);
    expect(sources.size).toBe(staticRedirects.length);
  });
});

describe('hizmet bölgesi filtreleme', () => {
  const active = ['Sancaktepe', 'Çekmeköy', 'Ümraniye', 'Kadıköy', 'Üsküdar'];
  it('aktif ilçeyi kabul eder', () => {
    expect(resolveDistrict('Sancaktepe', active)).toEqual({ ok: true, value: 'Sancaktepe', standard: true });
  });
  it('aktif olmayan ilçeyi standart seçim olarak kabul etmez', () => {
    expect(resolveDistrict('Pendik', active).ok).toBe(false);
    expect(resolveDistrict('Sultanbeyli', active).ok).toBe(false);
  });
  it('“Listede yok” ile yazılan ilçe standart dışı olarak işaretlenir', () => {
    expect(resolveDistrict(`${OTHER_PREFIX}Pendik`, active)).toEqual({ ok: true, value: 'Diğer: Pendik', standard: false });
  });
  it('hariç tutulan bölge serbest metinle de kabul edilmez', () => {
    for (const v of ['Sultanbeyli', 'sultanbeyli', 'SULTANBEYLİ', 'Sultanbeyli Mecidiye']) {
      expect(resolveDistrict(`${OTHER_PREFIX}${v}`, active).ok, v).toBe(false);
    }
  });
  it('hariç tutulan liste Sultanbeyli içerir', () => {
    expect(EXCLUDED_AREA_SLUGS).toContain('sultanbeyli');
  });
});

describe('teklif formu doğrulaması', () => {
  const base = { serviceType: 'ev-boyama', roomType: '2+1', district: 'Sancaktepe', name: 'Ayşe Yılmaz', phone: '0533 123 45 67', kvkk: true };
  it('geçerli talebi kabul eder ve telefonu normalleştirir', () => {
    const r = quoteSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.phone).toBe('+905331234567');
      expect(r.data.marketing).toBe(false);
      expect(r.data.scopeOptions).toEqual([]);
    }
  });
  it('boya hizmetinde daire tipi zorunludur', () => {
    const r = quoteSchema.safeParse({ ...base, roomType: undefined });
    expect(r.success).toBe(false);
  });
  it('tadilat hizmetinde daire tipi zorunlu değildir', () => {
    expect(quoteSchema.safeParse({ ...base, serviceType: 'banyo-tadilati', roomType: undefined }).success).toBe(true);
  });
  it('KVKK onayı zorunlu, pazarlama izni isteğe bağlıdır', () => {
    expect(quoteSchema.safeParse({ ...base, kvkk: false }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...base, marketing: false }).success).toBe(true);
  });
  it('geçersiz telefon, e-posta ve bilinmeyen hizmeti reddeder', () => {
    expect(quoteSchema.safeParse({ ...base, phone: '123' }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...base, email: 'gecersiz' }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...base, serviceType: 'hack' }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...base, scopeOptions: ['bilinmeyen'] }).success).toBe(false);
  });
  it('e-posta tercihi seçildiyse e-posta ister', () => {
    expect(quoteSchema.safeParse({ ...base, contactPreference: 'e-posta' }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...base, contactPreference: 'e-posta', email: 'a@b.com' }).success).toBe(true);
  });
  it('bal küpü alanı doluysa ve metin çok uzunsa reddeder; denetim karakterlerini temizler', () => {
    expect(quoteSchema.safeParse({ ...base, website: 'http://spam' }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...base, message: 'x'.repeat(1501) }).success).toBe(false);
    const r = quoteSchema.safeParse({ ...base, name: 'Ali\u0000 Veli' });
    expect(r.success && r.data.name).toBe('Ali Veli');
  });
});

describe('Markdown güvenliği', () => {
  it('ham HTML ve betikleri kaçışlar', () => {
    const { html } = renderMarkdown('Merhaba <script>alert(1)</script> <img src=x onerror=alert(1)>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img');
  });
  it('güvensiz bağlantı şemalarını kaldırır', () => {
    const { html } = renderMarkdown('[tıkla](javascript:alert(1)) [iç](/ev-boyama) [dış](https://example.com)');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('href="/ev-boyama"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
  it('başlıklara benzersiz kimlik verir ve içindekiler üretir', () => {
    const { html, toc } = renderMarkdown('# Üst\n\n## Hazırlık\n\n## Hazırlık\n\n### Astar');
    expect(html).not.toContain('<h1');
    expect(toc.map((t) => t.id)).toEqual(['ust', 'hazirlik', 'hazirlik-2', 'astar']);
  });
});

describe('yönetim paneli metin dönüşümleri', () => {
  it('kapsam kalemleri: doğrulanmamış kalem taahhüt sayılmaz', () => {
    const items = parseScopeItems('Tavan boyası | dahil\nKDV | teklifte\nMalzeme | dahil değil | müşteri temin eder\nSüre');
    expect(items).toEqual([
      { label: 'Tavan boyası', included: true },
      { label: 'KDV', included: null },
      { label: 'Malzeme', included: false, note: 'müşteri temin eder' },
      { label: 'Süre', included: null },
    ]);
    expect(parseScopeItems(scopeItemsToText(items))).toEqual(items);
  });
  it('aşama, SSS ve bölüm ayrıştırma', () => {
    expect(parseSteps('Hazırlık | Yüzey temizlenir')).toEqual([{ title: 'Hazırlık', desc: 'Yüzey temizlenir' }]);
    expect(parseFaqs('Soru 1?\nCevap 1\n\nSoru 2?\nCevap\n2')).toEqual([{ q: 'Soru 1?', a: 'Cevap 1' }, { q: 'Soru 2?', a: 'Cevap 2' }]);
    expect(parseSections('## A\n\nmetin a\n\n## B\nmetin b')).toEqual([{ heading: 'A', body: 'metin a' }, { heading: 'B', body: 'metin b' }]);
  });
  it('lokasyon sayfası kalite kapısı zayıf içeriği engeller', () => {
    const weak = { active: true, name: 'Pendik', lead: 'Kısa', sections: [{ heading: 'x', body: 'az' }], metaDescription: '' };
    expect(areaPageIssues(weak).length).toBeGreaterThanOrEqual(4);
    const good = { active: true, name: 'Pendik', lead: 'Pendik’teki daireler için ev boyama ve boya badana taleplerini değerlendiriyoruz.', sections: [{ heading: 'a', body: `Pendik ${'özgün içerik '.repeat(40)}` }, { heading: 'b', body: 'özgün içerik '.repeat(40) }], metaDescription: 'Açıklama' };
    expect(areaPageIssues(good)).toEqual([]);
    expect(areaPageIssues({ ...good, active: false })).toContain('Bölge aktif değil.');
  });
});
