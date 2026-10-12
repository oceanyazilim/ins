'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

export type GalleryImage = { src: string; alt: string; width: number; height: number };

/** Proje galerisi: ızgara + yerel <dialog> tabanlı büyütme (odak yönetimi ve Esc tarayıcıdan gelir). */
export function Gallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (active !== null && !d.open) d.showModal();
    if (active === null && d.open) d.close();
  }, [active]);

  const step = (dir: 1 | -1) => setActive((i) => (i === null ? i : (i + dir + images.length) % images.length));
  const current = active !== null ? images[active] : null;

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, i) => (
          <li key={img.src} data-reveal="image" style={{ '--reveal-index': i % 3 } as CSSProperties}>
            <button
              type="button"
              onClick={(e) => {
                opener.current = e.currentTarget;
                setActive(i);
              }}
              aria-label={`Görseli büyüt: ${img.alt}`}
              className="group zoom-media relative block aspect-[4/3] w-full overflow-hidden rounded-(--radius-lg) bg-soft"
            >
              <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label="Görsel galerisi"
        onClose={() => {
          setActive(null);
          opener.current?.focus();
        }}
        onClick={(e) => e.target === dialog.current && setActive(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1);
          if (e.key === 'ArrowLeft') step(-1);
        }}
        className="m-auto h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-navy-950/90"
      >
        {current && (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
            <div className="relative h-[78dvh] w-full max-w-6xl">
              <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
            </div>
            <p className="text-center text-sm text-white/85" aria-live="polite">
              {current.alt} ({(active ?? 0) + 1} / {images.length})
            </p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => step(-1)} aria-label="Önceki görsel" className="grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
                <ChevronLeft aria-hidden className="size-6" />
              </button>
              <button type="button" onClick={() => setActive(null)} aria-label="Galeriyi kapat" className="grid size-12 place-items-center rounded-full bg-white text-navy-900">
                <X aria-hidden className="size-6" />
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Sonraki görsel" className="grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
                <ChevronRight aria-hidden className="size-6" />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

/** Uzun yazılarda ince okuma ilerleme çubuğu (rAF ile sınırlandırılmış pasif dinleyici). */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target || !bar.current) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = target.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      const p = total <= 0 ? 1 : Math.min(1, Math.max(0, -r.top / total));
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [targetId]);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-(--z-toast) h-0.5">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-ocean-500" />
    </div>
  );
}
