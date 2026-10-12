// Geliştirme yardımcı aracı: node scripts/shot.mjs <yol> <ad> [genişlik] [full]
import { chromium } from '@playwright/test';
const [path = '/', name = 'shot', width = '1440', full = 'full'] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Number(width), height: Number(width) < 700 ? 800 : 900 }, reducedMotion: 'reduce' });
const errors = [];
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
p.on('pageerror', (e) => errors.push(String(e)));
await p.goto(`http://localhost:${process.env.PORT ?? 3100}${path}`, { waitUntil: 'networkidle' });
await p.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-visible')));
await p.waitForTimeout(400);
const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
await p.screenshot({ path: `.shots/${name}.jpg`, fullPage: full === 'full', type: 'jpeg', quality: 60 });
console.log(name, 'overflowX:', overflow, 'errors:', errors.slice(0, 5));
await b.close();
