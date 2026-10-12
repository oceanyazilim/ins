'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { track } from '@/analytics/events';
import { buttonClass } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format';

export type SelectorPackage = { slug: string; roomType: string; name: string; price: number; currency: string; summary: string };

/** Fiyat değişirken kısa bir sayı geçişi; hareket azaltma tercihinde anında değişir. */
function useAnimatedNumber(target: number): number {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    // Hareket azaltma tercihinde geçiş tek karede tamamlanır.
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 380;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = duration === 0 ? 1 : Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round((start + (target - start) * eased) / 100) * 100;
      setValue(p === 1 ? target : v);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      from.current = target;
    };
  }, [target]);
  return value;
}

/**
 * Paket seçici: yalnızca ilan edilen paket fiyatını gösterir, hesaplama yapmaz.
 * Seçim teklif formuna ?paket= parametresiyle taşınır.
 */
export function PricingSelector({ packages, initial }: { packages: SelectorPackage[]; initial?: string }) {
  const [slug, setSlug] = useState(initial && packages.some((p) => p.slug === initial) ? initial : (packages[1] ?? packages[0])?.slug);
  const selected = packages.find((p) => p.slug === slug) ?? packages[0];
  const shown = useAnimatedNumber(selected?.price ?? 0);
  if (!selected) return null;

  return (
    <div className="rounded-(--radius-xl) border border-line bg-white p-6 shadow-(--shadow-card) md:p-10" data-testid="pricing-selector">
      <fieldset>
        <legend className="font-display text-sm font-bold uppercase tracking-[0.14em] text-ocean-600">Daire tipinizi seçin</legend>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-full bg-soft p-1.5">
          {packages.map((p) => (
            <label
              key={p.slug}
              className={cn(
                'relative flex min-h-12 items-center justify-center rounded-full font-display text-lg font-bold transition-[background-color,color,box-shadow] duration-(--duration-hover)',
                'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ocean-500',
                p.slug === slug ? 'bg-navy-900 text-white shadow-(--shadow-card)' : 'text-navy-900 hover:bg-white',
              )}
            >
              <input
                type="radio"
                name="daire-tipi"
                value={p.slug}
                checked={p.slug === slug}
                onChange={() => {
                  setSlug(p.slug);
                  track('select_painting_package', { label: p.roomType, location: 'selector' });
                }}
                className="sr-only"
              />
              {p.roomType}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-8 grid items-end gap-6 md:grid-cols-[1fr_auto]" aria-live="polite">
        <div>
          <p className="font-display text-xl font-bold text-navy-900">{selected.name}</p>
          <p className="mt-1 max-w-md text-[0.9375rem] text-muted">{selected.summary}</p>
        </div>
        <div className="md:text-right">
          <p className="text-sm text-muted">İlan edilen fiyat</p>
          <p className="font-display text-5xl font-extrabold tabular-nums tracking-[-0.035em] text-navy-900" data-testid="selector-price">
            {formatPrice(shown, selected.currency)}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6">
        <Link href={`/teklif-al?paket=${selected.slug}`} className={buttonClass('primary', 'lg')} data-testid="selector-cta">
          {selected.roomType} için teklif al <ArrowRight aria-hidden className="size-4" />
        </Link>
        <Link href={`/ev-boyama/${selected.slug}`} className="text-sm font-semibold text-navy-900 underline underline-offset-4">
          Paket ayrıntıları
        </Link>
      </div>
      <p className="mt-5 text-sm text-muted">Paket fiyatı ilan edilen başlangıç fiyatıdır; nihai teklif dairenin durumu değerlendirildikten sonra netleşir.</p>
    </div>
  );
}
