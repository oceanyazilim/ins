import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'light' | 'outline-light' | 'whatsapp';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold tracking-[-0.01em] whitespace-nowrap select-none ' +
  'transition-[background-color,color,border-color,box-shadow,transform] duration-(--duration-hover) ease-(--ease-out-soft) ' +
  'active:scale-[0.98] disabled:opacity-55 disabled:active:scale-100 aria-disabled:opacity-55 aria-disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary: 'bg-navy-900 text-white hover:bg-navy-700 shadow-[0_1px_0_rgb(255_255_255/0.08)_inset]',
  accent: 'bg-ocean-600 text-white hover:bg-ocean-700',
  outline: 'border border-line-strong bg-white text-navy-900 hover:border-navy-900',
  ghost: 'text-navy-900 hover:bg-soft',
  light: 'bg-white text-navy-900 hover:bg-ocean-50',
  'outline-light': 'border border-white/35 text-white hover:border-white hover:bg-white/10',
  whatsapp: 'bg-whatsapp text-white hover:brightness-95',
};

const sizes: Record<Size, string> = {
  sm: 'min-h-10 px-4 text-sm',
  md: 'min-h-12 px-6 text-[0.9375rem]',
  lg: 'min-h-14 px-8 text-base',
};

export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', className?: string) =>
  cn(base, variants[variant], sizes[size], className);

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

export function ButtonLink({ variant, size, className, children, ...props }: Common & Omit<ComponentProps<typeof Link>, 'className' | 'children'>) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}

/** tel:, mailto: ve harici bağlantılar için. */
export function ButtonAnchor({ variant, size, className, children, ...props }: Common & Omit<ComponentProps<'a'>, 'className' | 'children'>) {
  return (
    <a className={buttonClass(variant, size, className)} {...props}>
      {children}
    </a>
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  loading,
  ...props
}: Common & { loading?: boolean } & Omit<ComponentProps<'button'>, 'className' | 'children'>) {
  return (
    <button className={buttonClass(variant, size, className)} disabled={props.disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && (
        <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}
      {children}
    </button>
  );
}
