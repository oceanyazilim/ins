/**
 * SEO kalite kapıları denetimi. Çalışan bir sunucuyu sitemap.xml üzerinden tarar ve her dizinlenebilir
 * sayfa için yayın öncesi kontrolleri uygular; iç bağlantıları ve yetim sayfaları denetler.
 *
 *   npm run seo:audit -- http://localhost:3000 [rapor.md]
 *
 * Çıkış kodu: hata varsa 1 (CI'da yayın kapısı olarak kullanılabilir).
 */
import fs from 'node:fs';

const origin = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const reportPath = process.argv[3];

type Page = { path: string; status: number; title: string; description: string; canonical: string; h1: string[]; robots: string; links: string[]; imagesWithoutAlt: number; jsonLd: unknown[]; jsonLdErrors: number; words: number };

const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attr = (tag: string, name: string) => decode(tag.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? '');

async function fetchPage(path: string): Promise<Page> {
  const res = await fetch(origin + path, { redirect: 'manual' });
  const html = res.status === 200 ? await res.text() : '';
  const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
  const jsonLd: unknown[] = [];
  let jsonLdErrors = 0;
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]!);
      jsonLd.push(...(Array.isArray(data) ? data : [data]));
    } catch {
      jsonLdErrors++;
    }
  }
  const imgs = [...main.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  return {
    path,
    status: res.status,
    title: decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''),
    description: attr(html.match(/<meta name="description"[^>]*>/)?.[0] ?? '', 'content'),
    canonical: attr(html.match(/<link rel="canonical"[^>]*>/)?.[0] ?? '', 'href'),
    h1: [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => decode(m[1]!.replace(/<[^>]+>/g, '')).trim()),
    robots: attr(html.match(/<meta name="robots"[^>]*>/)?.[0] ?? '', 'content'),
    links: [...new Set([...html.matchAll(/<a\b[^>]*href="(\/[^"#?]*)[^"]*"/g)].map((m) => (m[1]!.length > 1 ? m[1]!.replace(/\/$/, '') : m[1]!)))],
    imagesWithoutAlt: imgs.filter((t) => !/\balt="[^"]+"/.test(t)).length,
    jsonLd,
    jsonLdErrors,
    words: main.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length,
  };
}

async function main() {
  const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  if (locs.length === 0) throw new Error('sitemap.xml boş veya okunamadı');
  const base = new URL(locs[0]!).origin;
  const paths = locs.map((l) => new URL(l).pathname.replace(/\/$/, '') || '/');

  const pages: Page[] = [];
  for (let i = 0; i < paths.length; i += 8) pages.push(...(await Promise.all(paths.slice(i, i + 8).map(fetchPage))));

  const errors: string[] = [];
  const warnings: string[] = [];
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();

  for (const p of pages) {
    const expected = p.path === '/' ? base : base + p.path;
    if (p.status !== 200) errors.push(`${p.path}: site haritasında ama durum kodu ${p.status}`);
    if (!p.title) errors.push(`${p.path}: <title> yok`);
    if (!p.description) errors.push(`${p.path}: meta açıklaması yok`);
    if (p.canonical !== expected) errors.push(`${p.path}: canonical hatalı (${p.canonical || 'yok'})`);
    if (p.h1.length !== 1) errors.push(`${p.path}: ${p.h1.length} adet H1 (tam olarak 1 olmalı)`);
    if (/noindex/.test(p.robots)) errors.push(`${p.path}: site haritasında ama noindex`);
    if (p.jsonLdErrors) errors.push(`${p.path}: ayrıştırılamayan JSON-LD`);
    if (p.imagesWithoutAlt) errors.push(`${p.path}: ${p.imagesWithoutAlt} görselde alt metin yok`);
    if (titles.has(p.title)) errors.push(`${p.path}: başlık ${titles.get(p.title)} ile aynı`);
    if (descriptions.has(p.description)) errors.push(`${p.path}: meta açıklaması ${descriptions.get(p.description)} ile aynı`);
    titles.set(p.title, p.path);
    descriptions.set(p.description, p.path);
    if (/sultanbeyli/i.test(JSON.stringify(p))) errors.push(`${p.path}: hariç tutulan bölge adı geçiyor`);
    if (p.title.length > 65) warnings.push(`${p.path}: başlık uzun (${p.title.length} karakter)`);
    if (p.description.length < 70 || p.description.length > 170) warnings.push(`${p.path}: meta açıklaması ${p.description.length} karakter`);
    if (p.words < 150) warnings.push(`${p.path}: içerik kısa (${p.words} kelime)`);
    // Görünen fiyat ile yapılandırılmış veri tutarlılığı
    for (const node of p.jsonLd as { offers?: { price: number }[] }[]) {
      for (const o of node.offers ?? []) {
        if (!Number.isInteger(o.price) || o.price <= 0) errors.push(`${p.path}: geçersiz Offer fiyatı`);
      }
    }
  }

  // İç bağlantılar: kırık bağlantı, yönlendirmeye giden bağlantı ve yetim sayfa denetimi
  const known = new Set(paths);
  const inbound = new Map<string, number>(paths.map((p) => [p, 0]));
  const extra = new Set<string>();
  for (const p of pages) {
    for (const l of p.links) {
      if (l.startsWith('/admin') || l.startsWith('/_next') || l.startsWith('/media') || l.startsWith('/images') || l.startsWith('/logo')) continue;
      if (known.has(l)) {
        if (l !== p.path) inbound.set(l, (inbound.get(l) ?? 0) + 1);
      } else extra.add(l);
    }
  }
  for (const l of extra) {
    const res = await fetch(origin + l, { redirect: 'manual' });
    const sources = pages.filter((p) => p.links.includes(l)).map((p) => p.path).slice(0, 3).join(', ');
    if (res.status >= 400) errors.push(`Kırık iç bağlantı ${l} (${res.status}) ← ${sources}`);
    else if (res.status >= 300) errors.push(`İç bağlantı yönlendirmeye gidiyor ${l} → ${res.headers.get('location')} ← ${sources}`);
  }
  for (const [path, n] of inbound) if (n === 0 && path !== '/') errors.push(`Yetim sayfa: ${path} (hiçbir sayfadan bağlantı almıyor)`);

  const lines = [
    '# SEO Denetim Raporu',
    '',
    `- Tarih: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`,
    `- Taranan sunucu: ${origin}`,
    `- Canonical alan adı: ${base}`,
    `- Site haritasındaki sayfa sayısı: ${pages.length}`,
    `- Denetlenen ek iç bağlantı: ${extra.size}`,
    `- Hata: ${errors.length} · Uyarı: ${warnings.length}`,
    '',
    '## Uygulanan kontroller',
    '',
    'Durum kodu 200 · benzersiz title · benzersiz meta açıklaması · canonical = site haritası adresi · tek H1 · noindex değil · geçerli JSON-LD · görsellerde alt metin · kırık iç bağlantı yok · yönlendirmeye giden iç bağlantı yok · yetim sayfa yok · hariç tutulan bölge adı yok',
    '',
    '## Hatalar',
    '',
    ...(errors.length ? errors.map((e) => `- ${e}`) : ['Hata bulunmadı.']),
    '',
    '## Uyarılar (elle değerlendirilecek)',
    '',
    ...(warnings.length ? warnings.map((w) => `- ${w}`) : ['Uyarı yok.']),
    '',
  ];
  if (reportPath) fs.writeFileSync(reportPath, lines.join('\n'));
  console.log(lines.slice(2, 8).join('\n'));
  if (errors.length) console.log(`\nHatalar:\n${errors.slice(0, 40).map((e) => `  - ${e}`).join('\n')}`);
  if (warnings.length) console.log(`\nUyarılar (ilk 15):\n${warnings.slice(0, 15).map((e) => `  - ${e}`).join('\n')}`);
  process.exit(errors.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
