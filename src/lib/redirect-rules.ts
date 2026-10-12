export type RuleLike = { source: string; destination: string };

export function normalizePath(input: string): string {
  let p = input.trim();
  try {
    if (/^https?:\/\//i.test(p)) p = new URL(p).pathname;
  } catch {
    /* geçersiz URL aşağıda reddedilir */
  }
  p = p.split(/[?#]/)[0] ?? '';
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p.toLowerCase();
}

/**
 * Yeni bir yönlendirme kuralının zincir veya döngü oluşturup oluşturmadığını denetler.
 * Kurallar tek atlamalı olmalıdır: hedef başka bir kuralın kaynağı olamaz ve
 * yeni kaynak mevcut bir kuralın hedefi olamaz.
 */
export function validateRedirect(candidate: RuleLike, existing: RuleLike[], reserved: string[] = []): string | null {
  const source = normalizePath(candidate.source);
  const isExternal = /^https?:\/\//i.test(candidate.destination.trim());
  const destination = isExternal ? candidate.destination.trim() : normalizePath(candidate.destination);

  if (source === '/' || source.startsWith('/admin') || source.startsWith('/api')) return 'Bu adres yönlendirme kaynağı olamaz.';
  if (!/^\/[a-z0-9\-._~/%+]*$/.test(source)) return 'Kaynak adres geçersiz karakter içeriyor.';
  if (source === destination) return 'Kaynak ve hedef aynı olamaz (döngü).';
  if (reserved.includes(source)) return 'Bu adreste yayında bir sayfa var; önce sayfayı kaldırın.';
  if (existing.some((r) => normalizePath(r.source) === source)) return 'Bu kaynak adres için zaten bir kural var.';
  if (!isExternal) {
    if (existing.some((r) => normalizePath(r.source) === destination)) return 'Hedef adres başka bir kuralla yönlendiriliyor (zincir). Doğrudan son adrese yönlendirin.';
  }
  if (existing.some((r) => normalizePath(r.destination) === source)) return 'Bu kaynak, başka bir kuralın hedefi (zincir). Önce o kuralı güncelleyin.';
  return null;
}
