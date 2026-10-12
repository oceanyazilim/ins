'use client';

import { ChevronDown, Menu, Phone, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { buttonClass } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export type NavItem = { label: string; href: string; children?: { label: string; href: string; note?: string }[] };

export function Logo({ variant = 'black', className }: { variant?: 'black' | 'white'; className?: string }) {
  // Orijinal SVG dosyaları; oranları korunur, efekt uygulanmaz. Siyah sürümün tuvalinde dikey boşluk
  // bulunduğu için (harfler yüksekliğin yaklaşık yarısı) negatif dış boşlukla hizalanır.
  return (
    <Image
      src={`/logo/ocean-insaat-logo-${variant}.svg`}
      alt="Ocean İnşaat"
      width={variant === 'white' ? 1536 : 1640}
      height={variant === 'white' ? 324 : 664}
      unoptimized
      priority
      className={cn('w-auto', variant === 'black' && '-my-4', className)}
    />
  );
}

export function Header({ nav, phone, phoneDisplay }: { nav: NavItem[]; phone: string; phoneDisplay: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const drawer = useRef<HTMLDialogElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Kaydırma dinleyicisi yerine gözlemci: başlık yalnızca eşik geçildiğinde yeniden çizilir.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setCompact(!e!.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const btn = navRef.current?.querySelector<HTMLButtonElement>(`[data-menu="${open}"]`);
        setOpen(null);
        btn?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <div ref={sentinel} aria-hidden className="pointer-events-none absolute top-0 h-24 w-px" />
      <header
        className={cn(
          'sticky top-0 z-(--z-header) border-b bg-white/97 backdrop-blur-md transition-[box-shadow,border-color] duration-(--duration-card)',
          compact ? 'border-transparent shadow-(--shadow-header)' : 'border-line',
        )}
      >
        <div className={cn('container-page flex items-center justify-between gap-6 transition-[height] duration-(--duration-card) ease-(--ease-out-soft)', compact ? 'h-14 sm:h-16' : 'h-16 sm:h-20')}>
          <Link href="/" aria-label="Ocean İnşaat ana sayfa" className="shrink-0">
            <Logo className={cn('transition-[height] duration-(--duration-card)', compact ? 'h-16' : 'h-20')} />
          </Link>

          <nav ref={navRef} aria-label="Ana menü" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) =>
                item.children ? (
                  <li
                    key={item.label}
                    className="relative"
                    onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(item.label)}
                    onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(null)}
                  >
                    <button
                      type="button"
                      data-menu={item.label}
                      aria-expanded={open === item.label}
                      aria-controls={`menu-${item.href.replace(/\W/g, '')}`}
                      onClick={() => setOpen(open === item.label ? null : item.label)}
                      className={cn(
                        'flex items-center gap-1 rounded-full whitespace-nowrap px-3.5 py-2 text-[0.9375rem] font-medium transition-colors duration-(--duration-hover) hover:bg-soft',
                        isActive(item.href) ? 'text-ocean-700' : 'text-navy-900',
                      )}
                    >
                      {item.label}
                      <ChevronDown aria-hidden className={cn('size-4 transition-transform duration-(--duration-hover)', open === item.label && 'rotate-180')} />
                    </button>
                    <div
                      id={`menu-${item.href.replace(/\W/g, '')}`}
                      className={cn(
                        'absolute left-0 top-full w-72 pt-3 transition-[opacity,transform,visibility] duration-(--duration-hover) ease-(--ease-out-soft)',
                        open === item.label ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
                      )}
                    >
                      <ul className="rounded-(--radius-lg) border border-line bg-white p-2 shadow-(--shadow-lift)">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} onClick={() => setOpen(null)} className="block rounded-(--radius-md) px-3.5 py-2.5 transition-colors hover:bg-soft">
                              <span className="block text-[0.9375rem] font-medium text-navy-900">{c.label}</span>
                              {c.note && <span className="block text-sm text-muted">{c.note}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ) : (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={cn(
                        'block rounded-full whitespace-nowrap px-3.5 py-2 text-[0.9375rem] font-medium transition-colors duration-(--duration-hover) hover:bg-soft',
                        isActive(item.href) ? 'text-ocean-700' : 'text-navy-900',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${phone}`}
              data-event="click_phone"
              data-event-location="header"
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-[0.9375rem] font-semibold text-navy-900 transition-colors hover:bg-soft md:flex xl:hidden"
            >
              <Phone aria-hidden className="size-4 text-ocean-600" />
              {phoneDisplay}
            </a>
            <span className="hidden sm:block">
              <Link href="/teklif-al" className={buttonClass('primary', 'sm')}>
                Teklif Al
              </Link>
            </span>
            <button
              type="button"
              aria-label="Menüyü aç"
              aria-haspopup="dialog"
              onClick={() => drawer.current?.showModal()}
              className="grid size-11 place-items-center rounded-full text-navy-900 transition-colors hover:bg-soft xl:hidden"
            >
              <Menu aria-hidden className="size-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobil çekmece: yerel <dialog> odak tuzağını ve Esc ile kapanmayı kendisi yönetir */}
      <dialog
        ref={drawer}
        aria-label="Site menüsü"
        onClick={(e) => {
          // Arka plana ya da bir bağlantıya tıklanınca çekmece kapanır.
          if (e.target === drawer.current || (e.target as HTMLElement).closest('a')) drawer.current?.close();
        }}
        className="m-0 ml-auto h-dvh max-h-none w-[min(24rem,100vw)] max-w-none bg-white p-0 text-ink backdrop:bg-navy-950/50 open:animate-(--animate-fade-in)"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            <Logo className="h-16" />
            <button type="button" aria-label="Menüyü kapat" onClick={() => drawer.current?.close()} className="grid size-11 place-items-center rounded-full hover:bg-soft">
              <X aria-hidden className="size-6" />
            </button>
          </div>
          <nav aria-label="Mobil menü" className="flex-1 overflow-y-auto px-5 py-4">
            <ul>
              <li>
                <Link href="/" className="block border-b border-line py-3.5 font-display text-lg font-semibold text-navy-900">
                  Ana Sayfa
                </Link>
              </li>
              {nav.map((item) => (
                <li key={item.label} className="border-b border-line">
                  {item.children ? (
                    <details className="group/m">
                      <summary className="flex list-none items-center justify-between py-3.5 font-display text-lg font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
                        {item.label}
                        <ChevronDown aria-hidden className="size-5 transition-transform group-open/m:rotate-180" />
                      </summary>
                      <ul className="pb-3">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className="block py-2.5 pl-3 text-muted hover:text-navy-900">
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <Link href={item.href} className="block py-3.5 font-display text-lg font-semibold text-navy-900">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className="grid gap-2 border-t border-line p-5">
            <Link href="/teklif-al" className={buttonClass('primary', 'md')}>
              Teklif Al
            </Link>
            <a href={`tel:${phone}`} data-event="click_phone" data-event-location="drawer" className={buttonClass('outline', 'md')}>
              <Phone aria-hidden className="size-4" />
              {phoneDisplay}
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
