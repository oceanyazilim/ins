import 'server-only';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { findRedirect } from './data';

/**
 * İçerik bulunamadığında önce yönetim panelinden tanımlı yönlendirmelere bakar;
 * yoksa gerçek 404 döner (soft 404 üretilmez).
 */
export async function redirectOrNotFound(path: string): Promise<never> {
  const rule = await findRedirect(path);
  if (rule) {
    if (rule.statusCode === 307) redirect(rule.destination);
    permanentRedirect(rule.destination);
  }
  notFound();
}
