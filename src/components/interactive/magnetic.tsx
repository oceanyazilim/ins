'use client';

import { useRef, type ReactNode } from 'react';

/**
 * Önemli CTA'lar için çok hafif manyetik etki. Yalnızca fare kullanan, hareket azaltma
 * tercih etmeyen masaüstü kullanıcılarda çalışır; klavye ve dokunmatik davranışı değiştirmez.
 */
export function Magnetic({ children, strength = 0.18, className = 'inline-block' }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const enabled = () =>
    typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches;

  return (
    <span
      ref={ref}
      className={`${className} transition-transform duration-300 ease-(--ease-out-soft) will-change-transform`}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || !enabled()) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * strength;
        const y = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = '';
      }}
    >
      {children}
    </span>
  );
}
