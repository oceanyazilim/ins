'use client';

import { useState } from 'react';
import { ProjectCard, type ProjectCardData } from '@/components/sections/cards';
import { cn } from '@/lib/cn';

/** Kategori filtresi: bütün projeler HTML'de bulunur, filtre yalnızca görünürlüğü değiştirir. */
export function ProjectGrid({ projects }: { projects: ProjectCardData[] }) {
  const categories = [...new Set(projects.flatMap((p) => p.category.split(' · ').map((c) => c.trim())))].filter(Boolean);
  const [active, setActive] = useState<string | null>(null);
  const visible = (p: ProjectCardData) => !active || p.category.split(' · ').map((c) => c.trim()).includes(active);

  return (
    <>
      {categories.length > 1 && (
        <div role="group" aria-label="Projeleri kategoriye göre filtrele" className="mb-10 flex flex-wrap gap-2">
          {[null, ...categories].map((c) => (
            <button
              key={c ?? 'tum'}
              type="button"
              aria-pressed={active === c}
              onClick={() => setActive(c)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-(--duration-hover)',
                active === c ? 'border-navy-900 bg-navy-900 text-white' : 'border-line-strong bg-white text-navy-900 hover:border-navy-900',
              )}
            >
              {c ?? 'Tümü'}
            </button>
          ))}
        </div>
      )}
      <ul className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {projects.map((p) => (
          <li key={p.slug} hidden={!visible(p)}>
            <ProjectCard project={p} />
          </li>
        ))}
      </ul>
    </>
  );
}
