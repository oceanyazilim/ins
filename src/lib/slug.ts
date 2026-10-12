const MAP: Record<string, string> = {
  ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', I: 'i', İ: 'i', ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u', â: 'a', î: 'i', û: 'u',
};

/** Türkçe karakterleri güvenilir biçimde ASCII'ye indirger: "Çekmeköy Ev Boyama" → "cekmekoy-ev-boyama" */
export function slugify(input: string): string {
  return input
    .replace(/[çÇğĞıIİöÖşŞüÜâîû]/g, (c) => MAP[c] ?? c)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export const isValidSlug = (s: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
