import { readStored } from '@/server/storage';

/** Medya kütüphanesindeki (yönetim panelinden yüklenen) herkese açık görseller. Teklif fotoğrafları buradan sunulmaz. */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const key = (await params).path.join('/');
  if (!key.startsWith('media/')) return new Response('Bulunamadı', { status: 404 });
  const data = await readStored(key);
  if (!data) return new Response('Bulunamadı', { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
  });
}
