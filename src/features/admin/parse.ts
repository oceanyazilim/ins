import type { AreaSection, QA, ScopeItem, ServiceStep } from '@/db/schema';

/** Yönetim panelindeki çok satırlı metin alanlarının yapılandırılmış veriye dönüşümü (ve tersi). */

export const linesToList = (v: string) => v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
export const listToLines = (v: string[]) => v.join('\n');

/** "Başlık | Açıklama" */
export const parseSteps = (v: string): ServiceStep[] =>
  linesToList(v).map((l) => {
    const [title, ...rest] = l.split('|');
    return { title: title!.trim(), desc: rest.join('|').trim() };
  });
export const stepsToText = (v: ServiceStep[]) => v.map((s) => `${s.title} | ${s.desc}`).join('\n');

/** Boş satırla ayrılmış bloklar; ilk satır soru, kalanı cevap. */
export const parseFaqs = (v: string): QA[] =>
  v
    .split(/\r?\n\s*\r?\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      const [q, ...a] = b.split(/\r?\n/);
      return { q: q!.trim(), a: a.join(' ').trim() };
    })
    .filter((f) => f.q && f.a);
export const faqsToText = (v: QA[]) => v.map((f) => `${f.q}\n${f.a}`).join('\n\n');

const SCOPE_WORDS: Record<string, boolean | null> = { dahil: true, 'dahil değil': false, haric: false, hariç: false, belirsiz: null, teklifte: null, '': null };

/** "Kalem | dahil / dahil değil / teklifte | not" */
export const parseScopeItems = (v: string): ScopeItem[] =>
  linesToList(v).map((l) => {
    const [label, state = '', note = ''] = l.split('|').map((s) => s.trim());
    const key = state.toLocaleLowerCase('tr');
    return { label: label!, included: key in SCOPE_WORDS ? SCOPE_WORDS[key]! : null, ...(note ? { note } : {}) };
  });
export const scopeItemsToText = (v: ScopeItem[]) =>
  v.map((s) => `${s.label} | ${s.included === true ? 'dahil' : s.included === false ? 'dahil değil' : 'teklifte'}${s.note ? ` | ${s.note}` : ''}`).join('\n');

/** "## Başlık" satırlarıyla ayrılmış Markdown bölümleri. */
export function parseSections(v: string): AreaSection[] {
  const out: AreaSection[] = [];
  for (const block of v.split(/^##\s+/m).map((b) => b.trim()).filter(Boolean)) {
    const [heading, ...body] = block.split(/\r?\n/);
    out.push({ heading: heading!.trim(), body: body.join('\n').trim() });
  }
  return out;
}
export const sectionsToText = (v: AreaSection[]) => v.map((s) => `## ${s.heading}\n\n${s.body}`).join('\n\n');

/**
 * Lokasyon sayfası yayın kalite kapısı: bölge aktif olmalı ve ilçeye özgü yeterli içerik bulunmalıdır.
 * Kopya / zayıf (doorway) sayfaların yayınlanmasını engeller.
 */
export function areaPageIssues(a: { active: boolean; name: string; lead: string; sections: AreaSection[]; metaDescription?: string | null }): string[] {
  const issues: string[] = [];
  const text = a.sections.map((s) => s.body).join(' ');
  if (!a.active) issues.push('Bölge aktif değil.');
  if (a.lead.trim().length < 60) issues.push('Giriş metni çok kısa (en az 60 karakter).');
  if (a.sections.length < 2) issues.push('En az iki özgün içerik bölümü gerekli.');
  if (text.length < 900) issues.push('İlçeye özgü içerik yetersiz (en az 900 karakter).');
  if (!text.includes(a.name)) issues.push('İçerikte ilçe adı geçmiyor; metin bu ilçeye özgü olmalı.');
  if (!a.metaDescription?.trim()) issues.push('Meta açıklaması boş.');
  return issues;
}
