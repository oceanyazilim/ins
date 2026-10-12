import { EXCLUDED_AREA_SLUGS } from '@/config/site';
import { slugify } from '@/lib/slug';

export const OTHER_PREFIX = 'Diğer: ';

export type DistrictResult = { ok: true; value: string; standard: boolean } | { ok: false; message: string };

/**
 * Formdan gelen ilçe değerini doğrular. Standart seçimler yalnızca aktif hizmet bölgeleridir.
 * "Listede yok" seçeneğiyle yazılan ilçeler ayrıca işaretlenir; hariç tutulan bölgeler kabul edilmez.
 */
export function resolveDistrict(input: string, activeAreaNames: string[]): DistrictResult {
  const value = input.trim();
  if (activeAreaNames.includes(value)) return { ok: true, value, standard: true };
  if (value.startsWith(OTHER_PREFIX)) {
    const name = value.slice(OTHER_PREFIX.length).trim();
    if (name.length < 2) return { ok: false, message: 'Lütfen ilçenizi yazın.' };
    if (EXCLUDED_AREA_SLUGS.some((s) => slugify(name).includes(s))) {
      return { ok: false, message: 'Üzgünüz, bu bölgede hizmet veremiyoruz.' };
    }
    return { ok: true, value: `${OTHER_PREFIX}${name}`, standard: false };
  }
  return { ok: false, message: 'Lütfen listeden bir ilçe seçin.' };
}
