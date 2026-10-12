'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { track } from '@/analytics/events';
import { Button } from '@/components/ui/button';
import { submitContact } from './actions';
import { contactSchema, type ContactInput } from './schema';

export function ContactForm() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema), mode: 'onTouched', defaultValues: { name: '', phone: '', email: '', message: '', website: '' } });
  const [formError, setFormError] = useState('');
  const [doneRef, setDoneRef] = useState<string | null>(null);

  const onSubmit = async (data: ContactInput) => {
    setFormError('');
    try {
      const res = await submitContact(data);
      if (res.ok) {
        track('submit_contact_form', {}, res.ref);
        setDoneRef(res.ref);
        reset();
      } else {
        setFormError(res.message);
        for (const [f, m] of Object.entries(res.fieldErrors ?? {})) setError(f as keyof ContactInput, { message: m });
      }
    } catch {
      setFormError('Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.');
    }
  };

  if (doneRef) {
    return (
      <div role="status" className="rounded-(--radius-xl) border border-line bg-white p-8 text-center" data-testid="contact-success">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-50 text-success">
          <Check aria-hidden className="size-6" />
        </span>
        <h2 className="mt-5 text-h3 font-bold">Mesajınız bize ulaştı</h2>
        <p className="mt-2 text-muted">
          Kayıt numaranız: <strong className="text-navy-900">{doneRef}</strong>. En kısa sürede sizinle iletişime geçeceğiz.
        </p>
      </div>
    );
  }

  const field = (name: 'name' | 'phone' | 'email', label: string, props: Record<string, unknown>, required = false) => (
    <div>
      <label htmlFor={`c-${name}`} className="mb-2 block text-sm font-semibold text-navy-900">
        {label} {required ? <span aria-hidden className="text-danger">*</span> : <span className="font-normal text-muted">(isteğe bağlı)</span>}
      </label>
      <input id={`c-${name}`} className="field" aria-required={required} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `c-err-${name}` : undefined} {...props} {...register(name)} />
      {/* Hata satırının yeri her zaman ayrılır; hata kaybolurken alttaki alanlar kaymaz. */}
      <p id={`c-err-${name}`} role={errors[name] ? 'alert' : undefined} className="mt-1.5 min-h-5 text-sm font-medium leading-5 text-danger">
        {errors[name]?.message}
      </p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-3 rounded-(--radius-xl) border border-line bg-white p-6 shadow-(--shadow-card) md:p-9" data-testid="contact-form">
      <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
        {field('name', 'Ad soyad', { autoComplete: 'name' }, true)}
        {field('phone', 'Telefon', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '05xx xxx xx xx' }, true)}
      </div>
      {field('email', 'E-posta', { type: 'email', autoComplete: 'email' })}
      <div>
        <label htmlFor="c-message" className="mb-2 block text-sm font-semibold text-navy-900">
          Mesajınız <span aria-hidden className="text-danger">*</span>
        </label>
        <textarea id="c-message" className="field" maxLength={1500} aria-required aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'c-err-message' : undefined} {...register('message')} />
        <p id="c-err-message" role={errors.message ? 'alert' : undefined} className="mt-1.5 min-h-5 text-sm font-medium leading-5 text-danger">
          {errors.message?.message}
        </p>
      </div>
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Web siteniz
          <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </label>
      </div>
      <div>
        <label className="flex items-start gap-3 text-[0.9375rem]">
          <input type="checkbox" className="mt-1 size-4.5 shrink-0 accent-ocean-600" aria-required aria-invalid={Boolean(errors.kvkk)} aria-describedby={errors.kvkk ? 'c-err-kvkk' : undefined} {...register('kvkk')} />
          <span>
            <Link href="/kvkk-aydinlatma-metni" target="_blank" className="text-link">
              KVKK Aydınlatma Metni
            </Link>
            ’ni okudum. <span aria-hidden className="text-danger">*</span>
          </span>
        </label>
        {errors.kvkk && (
          <p id="c-err-kvkk" role="alert" className="mt-2 text-sm font-medium text-danger">
            {errors.kvkk.message}
          </p>
        )}
      </div>
      {formError && (
        <p role="alert" className="rounded-(--radius-md) border border-red-200 bg-red-50 p-4 text-sm font-medium text-danger">
          {formError}
        </p>
      )}
      <Button type="submit" size="lg" loading={isSubmitting} className="justify-self-start">
        {isSubmitting ? 'Gönderiliyor…' : 'Mesajı Gönder'}
      </Button>
    </form>
  );
}
