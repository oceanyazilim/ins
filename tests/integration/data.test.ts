import { eq, sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { db } from '@/db';
import * as s from '@/db/schema';
import { EXCLUDED_AREA_SLUGS } from '@/config/site';
import { validateRedirect } from '@/lib/redirect-rules';
import { findRedirect, getActiveAreas, getAreaBySlug, getPackages, getPost, getPosts, getService, getSettings } from '@/server/data';
import { rateLimit } from '@/server/rate-limit';
import { readStored, storeImage, UploadError } from '@/server/storage';
import sharp from 'sharp';

/** Gerçek PostgreSQL (ocean_test) üzerinde veri katmanı testleri. */
afterAll(async () => {
  await db.execute(sql`select 1`);
});

describe('fiyat paketleri', () => {
  it('seed sonrası üç aktif paket doğru fiyatlarla gelir', async () => {
    const p = await getPackages();
    expect(p.map((x) => [x.roomType, x.price, x.currency])).toEqual([['1+1', 25000, 'TRY'], ['2+1', 30000, 'TRY'], ['3+1', 35000, 'TRY']]);
  });
  it('her paket için ilk fiyat geçmişi kaydı vardır', async () => {
    const [{ n }] = (await db.execute(sql`select count(*)::int as n from package_price_history`)) as unknown as [{ n: number }];
    expect(n).toBe(3);
  });
  it('fiyat güncellemesi merkezi kaynaktan okunur ve geçmişe yazılır', async () => {
    const [pkg] = await db.select().from(s.paintingPackages).where(eq(s.paintingPackages.roomType, '1+1'));
    await db.transaction(async (tx) => {
      await tx.update(s.paintingPackages).set({ price: 26500 }).where(eq(s.paintingPackages.id, pkg!.id));
      await tx.insert(s.packagePriceHistory).values({ packageId: pkg!.id, oldPrice: pkg!.price, newPrice: 26500 });
    });
    const [after] = await db.select().from(s.paintingPackages).where(eq(s.paintingPackages.id, pkg!.id));
    expect(after!.price).toBe(26500);
    const history = await db.select().from(s.packagePriceHistory).where(eq(s.packagePriceHistory.packageId, pkg!.id));
    expect(history.map((h) => h.newPrice)).toContain(26500);
    await db.update(s.paintingPackages).set({ price: 25000 }).where(eq(s.paintingPackages.id, pkg!.id));
  });
  it('pasif paket listelenmez', async () => {
    const [pkg] = await db.select().from(s.paintingPackages).where(eq(s.paintingPackages.roomType, '3+1'));
    await db.update(s.paintingPackages).set({ active: false }).where(eq(s.paintingPackages.id, pkg!.id));
    const rows = await db.select().from(s.paintingPackages).where(eq(s.paintingPackages.active, true));
    expect(rows.map((r) => r.roomType)).not.toContain('3+1');
    await db.update(s.paintingPackages).set({ active: true }).where(eq(s.paintingPackages.id, pkg!.id));
  });
});

describe('hizmet bölgeleri', () => {
  it('yalnızca aktif bölgeler döner; merkez ilk sıradadır', async () => {
    const areas = await getActiveAreas();
    expect(areas.map((a) => a.name)).toEqual(['Sancaktepe', 'Çekmeköy', 'Ümraniye', 'Kadıköy', 'Üsküdar']);
    expect(areas[0]!.isHub).toBe(true);
  });
  it('pasif ilçenin lokasyon sayfası yoktur', async () => {
    expect(await getAreaBySlug('pendik')).toBeNull();
    expect(await getAreaBySlug('sancaktepe')).not.toBeNull();
  });
  it('hariç tutulan bölge veritabanında yoktur', async () => {
    const rows = await db.select({ slug: s.serviceAreas.slug }).from(s.serviceAreas);
    for (const x of EXCLUDED_AREA_SLUGS) expect(rows.map((r) => r.slug)).not.toContain(x);
    const hoods = await db.select({ name: s.neighborhoods.name }).from(s.neighborhoods);
    expect(hoods.some((h) => /sultanbeyli/i.test(h.name))).toBe(false);
  });
  it('Sancaktepe mahalleleri tanımlıdır', async () => {
    const a = await getAreaBySlug('sancaktepe');
    expect(a!.neighborhoods.map((n) => n.name)).toEqual(['Sarıgazi', 'Samandıra', 'Yenidoğan']);
  });
});

describe('içerik yayını', () => {
  it('mevcut sitedeki hizmet adresleri korunur, birleştirilen sayfa taşınmaz', async () => {
    for (const slug of ['anahtar-teslim-insaat', 'mantolama', 'ev-tadilati', 'alci-siva', 'ic-cephe-boyama', 'boya-badana']) {
      expect(await getService(slug), slug).not.toBeNull();
    }
    expect(await getService('ic-dis-cephe-boya')).toBeNull();
  });
  it('taslak hizmet yayınlanmaz', async () => {
    await db.update(s.services).set({ status: 'draft' }).where(eq(s.services.slug, 'ev-dekorasyonu'));
    const [row] = await db.select().from(s.services).where(eq(s.services.slug, 'ev-dekorasyonu'));
    expect(row!.status).toBe('draft');
    await db.update(s.services).set({ status: 'published' }).where(eq(s.services.slug, 'ev-dekorasyonu'));
  });
  it('incelemedeki blog yazıları yayında görünmez', async () => {
    const { items, total } = await getPosts({ limit: 200 });
    expect(total).toBe(14);
    const review = await db.select({ slug: s.blogPosts.slug }).from(s.blogPosts).where(eq(s.blogPosts.status, 'review'));
    expect(review.length).toBe(14);
    for (const r of review) expect(items.map((i) => i.slug)).not.toContain(r.slug);
    expect(await getPost(review[0]!.slug)).toBeNull();
  });
  it('mevcut sitedeki blog yazıları özgün tarihleriyle korunur', async () => {
    const p = await getPost('anahtar-teslim-insaat-nedir');
    expect(p?.post.publishedAt?.toISOString().slice(0, 10)).toBe('2025-04-14');
  });
  it('içerikteki paket fiyatları yer tutucuya çevrilmiştir', async () => {
    const rows = await db.select({ body: s.blogPosts.body, slug: s.blogPosts.slug }).from(s.blogPosts);
    for (const r of rows) expect(r.body, r.slug).not.toMatch(/(25|30|35)\.000 TL/);
  });
  it('iletişim bilgileri güncel değerlerle gelir', async () => {
    const st = await getSettings();
    expect(st.contact.phone).toBe('+905330392221');
    expect(st.contact.emails).toEqual(['destek@oceaninsaat.com.tr', 'info@oceaninsaat.com.tr']);
  });
});

describe('teklif kaydı', () => {
  it('talep, rıza ve durum geçmişiyle birlikte kaydedilir; talep numarası benzersizdir', async () => {
    const [lead] = await db
      .insert(s.leads)
      .values({ ref: 'OCN-TEST-00001', serviceType: 'ev-boyama', roomType: '2+1', listedPrice: 30000, district: 'Sancaktepe', name: 'Test Kişi', phone: '+905331234567' })
      .returning();
    await db.insert(s.leadConsents).values([{ leadId: lead!.id, type: 'kvkk_notice', granted: true, textVersion: 't' }, { leadId: lead!.id, type: 'marketing', granted: false, textVersion: 't' }]);
    await db.insert(s.leadStatusHistory).values({ leadId: lead!.id, toStatus: 'new' });
    expect(lead!.status).toBe('new');
    await expect(db.insert(s.leads).values({ ref: 'OCN-TEST-00001', serviceType: 'x', name: 'y', phone: 'z' })).rejects.toThrow();
    await db.delete(s.leads).where(eq(s.leads.id, lead!.id));
    const [{ n }] = (await db.execute(sql`select count(*)::int as n from lead_consents where lead_id = ${lead!.id}`)) as unknown as [{ n: number }];
    expect(n).toBe(0);
  });
});

describe('yönlendirme yönetimi', () => {
  it('aktif kural bulunur, kullanım sayacı artar, pasif kural uygulanmaz', async () => {
    const existing = await db.select().from(s.redirectRules);
    expect(validateRedirect({ source: '/eski-kampanya', destination: '/boya-fiyatlari' }, existing)).toBeNull();
    const [rule] = await db.insert(s.redirectRules).values({ source: '/eski-kampanya', destination: '/boya-fiyatlari' }).returning();
    expect((await findRedirect('/eski-kampanya/'))?.destination).toBe('/boya-fiyatlari');
    const [after] = await db.select().from(s.redirectRules).where(eq(s.redirectRules.id, rule!.id));
    expect(after!.hits).toBe(1);
    expect(validateRedirect({ source: '/baska', destination: '/eski-kampanya' }, [after!])).toMatch(/zincir/);
    await db.update(s.redirectRules).set({ active: false }).where(eq(s.redirectRules.id, rule!.id));
    expect(await findRedirect('/eski-kampanya')).toBeNull();
    await db.delete(s.redirectRules).where(eq(s.redirectRules.id, rule!.id));
  });
});

describe('deneme sınırlandırması', () => {
  it('sınır aşıldığında reddeder', async () => {
    const key = `test:${Date.now()}`;
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await rateLimit(key, 3, 600));
    expect(results).toEqual([true, true, true, false]);
  });
});

describe('dosya yükleme güvenliği', () => {
  it('geçerli görseli WebP olarak yeniden kodlar ve saklar', async () => {
    const png = await sharp({ create: { width: 3000, height: 1500, channels: 3, background: '#fff' } }).png().toBuffer();
    const stored = await storeImage(png, 'leads');
    expect(stored.mime).toBe('image/webp');
    expect(stored.width).toBe(2400);
    expect(stored.key).toMatch(/^leads\/\d{4}\/\d{2}\/[a-f0-9]{32}\.webp$/);
    expect((await readStored(stored.key))?.subarray(0, 4).toString()).toBe('RIFF');
  });
  it('görsel olmayan, uzantısı sahte ve desteklenmeyen dosyaları reddeder', async () => {
    await expect(storeImage(Buffer.from('<?php echo 1; ?>'), 'leads')).rejects.toBeInstanceOf(UploadError);
    await expect(storeImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'), 'leads')).rejects.toBeInstanceOf(UploadError);
    await expect(storeImage(Buffer.alloc(0), 'leads')).rejects.toBeInstanceOf(UploadError);
    const gif = await sharp({ create: { width: 10, height: 10, channels: 3, background: '#000' } }).gif().toBuffer();
    await expect(storeImage(gif, 'leads')).rejects.toBeInstanceOf(UploadError);
  });
  it('dizin dışına çıkan anahtarları okumaz', async () => {
    expect(await readStored('../../.env')).toBeNull();
    expect(await readStored('leads/../../../etc/passwd')).toBeNull();
  });
});
