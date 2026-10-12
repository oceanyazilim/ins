import 'server-only';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp, { type Metadata } from 'sharp';
import { MAX_PHOTO_BYTES } from '@/features/quote/options';
import { env } from '@/lib/env';

/**
 * Yerel dosya sistemi depolaması. STORAGE_DIR kalıcı bir birime bağlanmalıdır.
 * Nesne depolamaya (S3 uyumlu) geçiş için yalnızca bu dosyanın değiştirilmesi yeterlidir.
 */
const root = () => path.resolve(env.STORAGE_DIR);

export type StoredImage = { key: string; mime: 'image/webp'; size: number; width: number; height: number };

export class UploadError extends Error {}

const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp']);

/**
 * Yüklenen görseli doğrular ve yeniden kodlar. Dosya uzantısına veya istemcinin bildirdiği
 * MIME türüne güvenilmez; içerik sharp ile çözülür. Yeniden kodlama EXIF/konum verisini ve
 * görsele gömülü olası zararlı içeriği temizler.
 */
export async function storeImage(input: Buffer, folder: 'leads' | 'media', maxWidth = 2400): Promise<StoredImage> {
  if (input.byteLength === 0) throw new UploadError('Dosya boş.');
  if (input.byteLength > MAX_PHOTO_BYTES) throw new UploadError('Dosya boyutu 8 MB sınırını aşıyor.');
  let meta: Metadata;
  try {
    meta = await sharp(input, { limitInputPixels: 50_000_000 }).metadata();
  } catch {
    throw new UploadError('Dosya geçerli bir görsel değil.');
  }
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) throw new UploadError('Yalnızca JPEG, PNG veya WebP yükleyebilirsiniz.');

  const { data, info } = await sharp(input, { limitInputPixels: 50_000_000 })
    .rotate()
    .resize({ width: maxWidth, height: maxWidth, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const now = new Date();
  const key = `${folder}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${randomBytes(16).toString('hex')}.webp`;
  const full = path.join(root(), key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, data, { flag: 'wx' });
  return { key, mime: 'image/webp', size: data.byteLength, width: info.width, height: info.height };
}

/** Yalnızca beklenen biçimdeki anahtarları kabul eder; dizin dışına çıkışı engeller. */
function resolveKey(key: string): string {
  if (!/^(leads|media)\/\d{4}\/\d{2}\/[a-f0-9]{32}\.webp$/.test(key)) throw new UploadError('Geçersiz dosya anahtarı.');
  const full = path.join(root(), key);
  if (!full.startsWith(root() + path.sep)) throw new UploadError('Geçersiz dosya yolu.');
  return full;
}

export async function readStored(key: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(resolveKey(key));
  } catch {
    return null;
  }
}

export async function deleteStored(key: string): Promise<void> {
  try {
    await fs.unlink(resolveKey(key));
  } catch {
    /* dosya zaten yoksa sorun değil */
  }
}
