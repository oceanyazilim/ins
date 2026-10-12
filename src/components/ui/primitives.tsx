import { ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Container({ className, children, as: Tag = 'div' }: { className?: string; children: ReactNode; as?: ElementType }) {
  return <Tag className={cn('container-page', className)}>{children}</Tag>;
}

type Tone = 'paper' | 'soft' | 'sand' | 'navy';
const tones: Record<Tone, string> = {
  paper: 'bg-paper',
  soft: 'bg-soft',
  sand: 'bg-sand',
  navy: 'on-dark bg-navy-900 text-white [&_h2]:text-white [&_h3]:text-white',
};

export function Section({
  tone = 'paper',
  className,
  children,
  id,
  labelledBy,
  flush,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
  id?: string;
  labelledBy?: string;
  /** Üst boşluğu kaldırır (aynı tondaki ardışık bölümler için). */
  flush?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn(tones[tone], 'py-(--spacing-section)', flush && 'pt-0', className)}>
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  id,
  align = 'left',
  className,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  id?: string;
  align?: 'left' | 'center';
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      data-reveal
      className={cn(
        'mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'text-center md:flex-col md:items-center',
        className,
      )}
    >
      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2 id={id} className="text-h2 font-bold">
          {title}
        </h2>
        {lead && <p className="mt-5 text-lead text-muted [.on-dark_&]:text-white/75">{lead}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Badge({ children, tone = 'ocean', className }: { children: ReactNode; tone?: 'ocean' | 'navy' | 'neutral' | 'success' | 'warning' | 'danger'; className?: string }) {
  const map = {
    ocean: 'bg-ocean-50 text-ocean-700',
    navy: 'bg-navy-900 text-white',
    neutral: 'bg-soft text-muted border border-line',
    success: 'bg-emerald-50 text-success',
    warning: 'bg-amber-50 text-warning',
    danger: 'bg-red-50 text-danger',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide', map[tone], className)}>{children}</span>
  );
}

export type Crumb = { name: string; path: string };

/** Görsel kırıntı; JSON-LD karşılığı sayfada breadcrumbSchema ile ayrıca basılır. */
export function Breadcrumbs({ items, light }: { items: Crumb[]; light?: boolean }) {
  return (
    <nav aria-label="Sayfa yolu" className={cn('text-sm', light ? 'text-white/70' : 'text-muted')}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className={cn('font-medium', light ? 'text-white' : 'text-navy-900')}>
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={c.path} className={cn('underline-offset-4 hover:underline', light ? 'hover:text-white' : 'hover:text-navy-900')}>
                    {c.name}
                  </Link>
                  <ChevronRight aria-hidden className="size-3.5 opacity-60" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Accordion({ items, className }: { items: { q: string; a: ReactNode }[]; className?: string }) {
  return (
    <div className={cn('border-t border-line', className)}>
      {items.map((item, i) => (
        <details key={i} className="accordion-item group/acc">
          <summary className="flex items-start justify-between gap-6 py-5 text-left md:py-6">
            <h3 className="font-display text-[1.0625rem] font-semibold text-navy-900 md:text-lg">{item.q}</h3>
            <span aria-hidden className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-line-strong text-navy-900 transition-colors group-hover/acc:border-navy-900">
              <Plus className="accordion-icon size-4" />
            </span>
          </summary>
          <div className="max-w-3xl pb-6 pr-12 text-muted">{item.a}</div>
        </details>
      ))}
    </div>
  );
}

/** Kademeli görünme: çocuklara data-reveal ve sıra indeksi verir (JS gerektirmeyen sarmalayıcı). */
export function revealProps(index = 0, variant: '' | 'fade' | 'image' = ''): { 'data-reveal': string; style: CSSProperties } {
  return { 'data-reveal': variant, style: { '--reveal-index': index } as CSSProperties };
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="rounded-(--radius-lg) border border-dashed border-line-strong bg-soft px-6 py-12 text-center">
      <p className="font-display text-lg font-semibold text-navy-900">{title}</p>
      {text && <p className="mx-auto mt-2 max-w-md text-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
