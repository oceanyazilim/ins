// Paylaşım görseli ve site ikonlarını resmi beyaz logodan üretir: node scripts/build-assets.mjs
import sharp from 'sharp';
const NAVY = '#0b0b0d';
const logo = 'public/logo/ocean-insaat-logo-white.svg';

// 1200×630 Open Graph görseli
const logoBuf = await sharp(logo, { density: 300 }).resize({ width: 560 }).png().toBuffer();
const text = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect x="96" y="408" width="72" height="4" fill="#2585d5"/>
  <text x="96" y="474" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700" fill="#ffffff">Ev Boyama · Tadilat · İnşaat</text>
  <text x="96" y="528" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#b9c7d6">Sancaktepe / İstanbul · oceaninsaat.com.tr</text>
</svg>`);
await sharp({ create: { width: 1200, height: 630, channels: 3, background: NAVY } })
  .composite([{ input: logoBuf, left: 84, top: 120 }, { input: text, left: 0, top: 0 }])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile('public/images/og-default.jpg');

// İkonlar: logodaki "O" harfi (orijinal çizimden kırpılır, yeniden tasarlanmaz)
const full = await sharp(logo, { density: 400 }).resize({ width: 3280 }).png().toBuffer();
const meta = await sharp(full).metadata();
const cut = await sharp(full).extract({ left: 0, top: 0, width: Math.round(meta.width * 0.188), height: meta.height }).png().toBuffer();
const o = await sharp(cut).trim().png().toBuffer();
for (const [size, file] of [[512, 'src/app/icon.png'], [180, 'src/app/apple-icon.png']]) {
  const glyph = await sharp(o).resize({ width: Math.round(size * 0.62), height: Math.round(size * 0.62), fit: 'inside' }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: NAVY } }).composite([{ input: glyph, gravity: 'center' }]).png().toFile(file);
}
console.log('ok');
