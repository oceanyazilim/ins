import 'server-only';
import { renderMarkdown } from '@/lib/markdown';
import { fillTokens, unlinkMissingPosts, type TokenContext } from '@/lib/tokens';
import { getActiveAreas, getPackages, getPosts, getSettings } from './data';

/** İçerik yer tutucuları ({{fiyat:2+1}}, {{bolgeler}}, {{telefon}}, {{eposta}}) için merkezi veri. */
export async function getTokenContext(): Promise<TokenContext> {
  const [packages, areas, settings] = await Promise.all([getPackages(), getActiveAreas(), getSettings()]);
  return { packages, areaNames: areas.map((a) => a.name), phone: settings.contact.phone, email: settings.contact.emails[0] };
}

/** Yönetilen Markdown içeriğini yayına hazırlar: yer tutucular doldurulur, yayında olmayan yazılara bağlantılar kaldırılır. */
export async function renderContent(markdown: string) {
  const [ctx, posts] = await Promise.all([getTokenContext(), getPosts({ limit: 500 })]);
  return renderMarkdown(unlinkMissingPosts(fillTokens(markdown, ctx), new Set(posts.items.map((p) => p.slug))));
}
