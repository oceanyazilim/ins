import { CircleAlert, CircleCheck } from 'lucide-react';
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;
export const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function PageHeader({ title, description, actions, back }: { title: string; description?: string; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back && (
          <Link href={back.href} className="mb-2 inline-block text-sm font-semibold text-ocean-700 underline-offset-4 hover:underline">
            ← {back.label}
          </Link>
        )}
        <h1 className="font-display text-2xl font-extrabold tracking-[-0.02em] text-navy-900 md:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** İşlem sonucu bildirimi (?ok= / ?hata=). */
export async function Flash({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const ok = first(sp.ok);
  const error = first(sp.hata);
  if (!ok && !error) return null;
  return (
    <div
      role={error ? 'alert' : 'status'}
      data-testid={error ? 'flash-error' : 'flash-ok'}
      className={cn('mb-6 flex items-start gap-3 rounded-(--radius-md) border p-4 text-sm font-medium', error ? 'border-red-200 bg-red-50 text-danger' : 'border-emerald-200 bg-emerald-50 text-success')}
    >
      {error ? <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" /> : <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0" />}
      {error ?? ok}
    </div>
  );
}

export function Card({ title, description, children, className }: { title?: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-(--radius-lg) border border-line bg-white p-5 md:p-6', className)}>
      {title && <h2 className="font-display text-base font-bold text-navy-900">{title}</h2>}
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className={title ? 'mt-5' : undefined}>{children}</div>
    </section>
  );
}

export function Field({ label, name, hint, children, className }: { label: string; name: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-navy-900">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

type InputProps = { label: string; name: string; hint?: string; wrapClass?: string } & Omit<ComponentProps<'input'>, 'name'>;
export function Input({ label, name, hint, wrapClass, className, ...props }: InputProps) {
  return (
    <Field label={label} name={name} hint={hint} className={wrapClass}>
      <input id={name} name={name} className={cn('field min-h-10 py-2 text-sm', className)} {...props} />
    </Field>
  );
}

type TextareaProps = { label: string; name: string; hint?: string; wrapClass?: string } & Omit<ComponentProps<'textarea'>, 'name'>;
export function Textarea({ label, name, hint, wrapClass, className, rows = 4, ...props }: TextareaProps) {
  return (
    <Field label={label} name={name} hint={hint} className={wrapClass}>
      <textarea id={name} name={name} rows={rows} className={cn('field min-h-0 py-2 font-mono text-[0.8125rem] leading-relaxed', className)} {...props} />
    </Field>
  );
}

export function Select({ label, name, hint, options, defaultValue, wrapClass }: { label: string; name: string; hint?: string; options: { value: string | number; label: string }[]; defaultValue?: string | number; wrapClass?: string }) {
  return (
    <Field label={label} name={name} hint={hint} className={wrapClass}>
      <select id={name} name={name} defaultValue={defaultValue} className="field min-h-10 py-2 text-sm">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Checkbox({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 shrink-0 accent-ocean-600" />
      <span>
        <span className="font-semibold text-navy-900">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-(--radius-lg) border border-line bg-white">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="border-b border-line bg-soft text-xs uppercase tracking-wider text-muted">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line [&_td]:px-4 [&_td]:py-3 [&_td]:align-top">{children}</tbody>
      </table>
      {empty && <p className="px-4 py-10 text-center text-sm text-muted">Kayıt bulunamadı.</p>}
    </div>
  );
}

export function StatusPill({ tone, children }: { tone: 'green' | 'blue' | 'amber' | 'gray' | 'red'; children: ReactNode }) {
  const map = { green: 'bg-emerald-50 text-success', blue: 'bg-ocean-50 text-ocean-700', amber: 'bg-amber-50 text-warning', gray: 'bg-soft text-muted', red: 'bg-red-50 text-danger' };
  return <span className={cn('inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', map[tone])}>{children}</span>;
}

export const LEAD_TONES: Record<string, 'green' | 'blue' | 'amber' | 'gray' | 'red'> = {
  new: 'blue',
  contacted: 'amber',
  survey_pending: 'amber',
  quote_sent: 'amber',
  won: 'green',
  completed: 'green',
  lost: 'red',
};

/** Arama sonucu önizlemesi (yaklaşık görünüm). */
export function SerpPreview({ url, title, description }: { url: string; title: string; description: string }) {
  return (
    <div className="rounded-(--radius-md) border border-line bg-white p-4">
      <p className="truncate text-xs text-muted">{url}</p>
      <p className="mt-1 truncate text-lg text-[#1a0dab]">{title}</p>
      <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">{description}</p>
      <p className="mt-2 text-xs text-muted">
        Başlık {title.length} karakter · Açıklama {description.length} karakter
      </p>
    </div>
  );
}
