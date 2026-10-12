// Geliştirme yardımcı aracı: verilen genişlikte yatay taşmaya neden olan öğeleri listeler.
import { chromium } from '@playwright/test';
const [path = '/', width = '320'] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Number(width), height: 800 } });
await p.goto(`http://localhost:${process.env.PORT ?? 3100}${path}`, { waitUntil: 'networkidle' });
const out = await p.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  return [...document.querySelectorAll('body *')]
    .map((e) => ({ e, r: e.getBoundingClientRect() }))
    .filter(({ r }) => r.right > vw + 1 && r.width > 0)
    .slice(0, 12)
    .map(({ e, r }) => `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 70)} right=${Math.round(r.right)} w=${Math.round(r.width)} :: ${(e.textContent ?? '').trim().slice(0, 40)}`);
});
console.log(out.join('\n') || 'taşma yok');
await b.close();
