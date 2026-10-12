import { Marked, type Tokens } from 'marked';
import { slugify } from './slug';

export type TocItem = { id: string; text: string; level: 2 | 3 };

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const SAFE_HREF = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i;

/**
 * Yönetim panelinden girilen Markdown'ı HTML'e çevirir. Ham HTML kaçışlanır,
 * bağlantılarda yalnızca güvenli şemalara izin verilir, başlıklara içindekiler için id eklenir.
 */
export function renderMarkdown(source: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Map<string, number>();
  const marked = new Marked({ gfm: true, breaks: false });

  marked.use({
    renderer: {
      html(token: Tokens.HTML | Tokens.Tag) {
        return escapeHtml(token.text);
      },
      heading(this: { parser: { parseInline(t: Tokens.Generic[]): string } }, token: Tokens.Heading) {
        const inner = this.parser.parseInline(token.tokens);
        // Sayfa başlığı (h1) şablondan gelir; içerikteki h1'ler h2'ye indirilir.
        const depth = Math.min(Math.max(token.depth, 2), 4);
        const plain = token.text.replace(/[*_`[\]]/g, '');
        let id = slugify(plain) || 'bolum';
        const n = used.get(id) ?? 0;
        used.set(id, n + 1);
        if (n > 0) id = `${id}-${n + 1}`;
        if (depth === 2 || depth === 3) toc.push({ id, text: plain, level: depth });
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
      link(this: { parser: { parseInline(t: Tokens.Generic[]): string } }, token: Tokens.Link) {
        const text = this.parser.parseInline(token.tokens);
        if (!SAFE_HREF.test(token.href)) return text;
        const external = /^https?:\/\//i.test(token.href);
        return `<a href="${escapeHtml(token.href)}"${external ? ' rel="noopener noreferrer" target="_blank"' : ''}>${text}</a>`;
      },
      image() {
        return '';
      },
      table(this: { parser: { parseInline(t: Tokens.Generic[]): string } }, token: Tokens.Table) {
        const cell = (c: Tokens.TableCell, tag: 'th' | 'td') => `<${tag}>${this.parser.parseInline(c.tokens)}</${tag}>`;
        const head = `<thead><tr>${token.header.map((c) => cell(c, 'th')).join('')}</tr></thead>`;
        const body = `<tbody>${token.rows.map((r) => `<tr>${r.map((c) => cell(c, 'td')).join('')}</tr>`).join('')}</tbody>`;
        return `<div class="table-wrap" tabindex="0" role="region" aria-label="Tablo"><table>${head}${body}</table></div>\n`;
      },
    },
  });

  const html = marked.parse(source, { async: false });
  return { html, toc };
}

/** Düz metin özet ve okuma süresi tahmini için. */
export function markdownToText(source: string): string {
  return source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const estimateReadMinutes = (source: string) => Math.max(2, Math.round(markdownToText(source).split(' ').length / 200));
