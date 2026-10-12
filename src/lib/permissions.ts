export type Role = 'admin' | 'editor';

export type Permission =
  | 'leads.view'
  | 'leads.manage'
  | 'leads.delete'
  | 'content.manage'
  | 'media.manage'
  | 'pricing.manage'
  | 'areas.manage'
  | 'seo.manage'
  | 'settings.manage'
  | 'users.manage'
  | 'audit.view';

const EDITOR: readonly Permission[] = ['leads.view', 'leads.manage', 'content.manage', 'media.manage'];

/** admin her şeyi yapar; editor yalnızca içerik, medya ve talep takibi yapar. */
export function can(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  if (role === 'admin') return true;
  return EDITOR.includes(permission);
}
