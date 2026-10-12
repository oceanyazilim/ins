'use client';

import { useRef, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { buttonClass } from '@/components/ui/button';

export function SubmitButton({ children = 'Kaydet', variant = 'primary', name, value }: { children?: ReactNode; variant?: 'primary' | 'outline' | 'accent'; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} disabled={pending} aria-busy={pending || undefined} className={buttonClass(variant, 'sm')}>
      {pending && <span aria-hidden className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />}
      {children}
    </button>
  );
}

/** Geri alınamayan işlemler için onay penceresi (yerel <dialog>; odak açan düğmeye geri döner). */
export function ConfirmButton({
  children,
  title,
  text,
  name = 'intent',
  value = 'delete',
  confirmLabel = 'Evet, sil',
}: {
  children: ReactNode;
  title: string;
  text: string;
  name?: string;
  value?: string;
  confirmLabel?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={opener} type="button" onClick={() => dialog.current?.showModal()} className="text-sm font-semibold text-danger underline-offset-4 hover:underline">
        {children}
      </button>
      <dialog ref={dialog} onClose={() => opener.current?.focus()} className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-(--radius-lg) p-6 text-ink backdrop:bg-navy-950/50">
        <h2 className="font-display text-lg font-bold text-navy-900">{title}</h2>
        <p className="mt-2 text-sm text-muted">{text}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => dialog.current?.close()} className={buttonClass('outline', 'sm')}>
            Vazgeç
          </button>
          <button type="submit" name={name} value={value} className={buttonClass('primary', 'sm', 'bg-danger hover:bg-danger hover:brightness-90')}>
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
