import { formatPhone, formatPrice } from './format';

export type TokenContext = {
  packages: { roomType: string; price: number; currency: string }[];
  areaNames: string[];
  phone: string;
  email?: string;
};

/** "A, B ve C" */
export function joinTr(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ve ${items[items.length - 1]}`;
}

/**
 * İçerik metinlerindeki yer tutucuları merkezi verilerle doldurur. Böylece SSS, blog ve
 * hizmet metinlerinde fiyat, bölge veya telefon elle yazılmaz ve panelden yapılan değişiklik
 * bütün metinlere yansır.
 *   {{fiyat:2+1}} → "30.000 TL"   {{bolgeler}} → "Sancaktepe, Çekmeköy ve Ümraniye"   {{telefon}}
 * Tanımsız paket için yer tutucu, yanlış fiyat göstermemek adına "güncel fiyat" ifadesine döner.
 */
export function fillTokens(text: string, ctx: TokenContext): string {
  return text
    .replace(/\{\{fiyat:([^}]+)\}\}/g, (_, room: string) => {
      const p = ctx.packages.find((x) => x.roomType === room.trim());
      return p ? formatPrice(p.price, p.currency) : 'güncel fiyat';
    })
    .replace(/\{\{bolgeler\}\}/g, joinTr(ctx.areaNames))
    .replace(/\{\{telefon\}\}/g, formatPhone(ctx.phone))
    .replace(/\{\{eposta\}\}/g, ctx.email ?? '');
}

/** Yayında olmayan blog yazılarına verilen iç bağlantıları düz metne çevirir (kırık bağlantı oluşmaz). */
export function unlinkMissingPosts(markdown: string, publishedSlugs: ReadonlySet<string>): string {
  return markdown.replace(/\[([^\]]+)\]\(\/blog\/([a-z0-9-]+)\/?\)/g, (m, text: string, slug: string) => (publishedSlugs.has(slug) ? m : text));
}
