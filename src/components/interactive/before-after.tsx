'use client';

import { MoveHorizontal } from 'lucide-react';
import Image from 'next/image';
import { useId, useState } from 'react';

/**
 * Sürüklenebilir öncesi / sonrası karşılaştırması.
 * Etkileşim görünmez bir <input type="range"> üzerinden yürür: fare, dokunma ve klavye (ok tuşları,
 * Home/End) desteği ile ekran okuyucu duyurusu tarayıcıdan hazır gelir.
 */
export function BeforeAfter({
  before,
  after,
  title,
  beforeLabel = 'Öncesi',
  afterLabel = 'Sonrası',
}: {
  before: string;
  after: string;
  title: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const [pos, setPos] = useState(50);
  const id = useId();
  return (
    <figure>
      <div className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-(--radius-xl) bg-soft md:aspect-[16/9]">
        <Image src={after} alt={`${title} — ${afterLabel.toLowerCase()}`} fill sizes="(min-width: 1024px) 70vw, 100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image src={before} alt={`${title} — ${beforeLabel.toLowerCase()}`} fill sizes="(min-width: 1024px) 70vw, 100vw" className="object-cover" />
        </div>
        <span className="absolute left-4 top-4 rounded-full bg-navy-950/75 px-3 py-1 text-xs font-semibold text-white">{beforeLabel}</span>
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy-900">{afterLabel}</span>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgb(10_30_48/0.15)]" style={{ left: `${pos}%` }}>
          <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-navy-900 shadow-(--shadow-lift)">
            <MoveHorizontal className="size-5" />
          </span>
        </div>
        <label htmlFor={id} className="sr-only">
          {title}: öncesi ve sonrası görsellerini karşılaştırma oranı
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={1}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-valuetext={`Görselin yüzde ${pos} kadarı “${beforeLabel}” durumunu gösteriyor`}
          className="peer absolute inset-0 h-full w-full cursor-ew-resize touch-pan-y opacity-0"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-(--radius-xl) peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-ocean-500" />
      </div>
      <figcaption className="mt-4 text-sm text-muted">{title}</figcaption>
    </figure>
  );
}
