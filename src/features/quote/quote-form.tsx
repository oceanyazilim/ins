'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, ImagePlus, MessageCircle, Phone, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { readAttribution, track } from '@/analytics/events';
import { Button, ButtonAnchor, ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { formatPhone, formatPrice, whatsappUrl } from '@/lib/format';
import { submitQuote } from './actions';
import { OTHER_PREFIX } from './district';
import {
  CONTACT_PREFERENCES,
  labelOf,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS,
  PAINTING_SERVICES,
  PHOTO_MIMES,
  PROPERTY_STATES,
  ROOM_TYPES,
  SCOPE_OPTIONS,
  SERVICE_TYPES,
} from './options';
import { quoteSchema, type QuoteData, type QuoteInput } from './schema';

export type QuoteFormProps = {
  packages: { slug: string; roomType: string; name: string; price: number; currency: string }[];
  areas: { name: string; neighborhoods: string[] }[];
  phone: string;
  whatsapp: string;
  initial: { serviceType?: string; roomType?: string; district?: string };
};

type StepId = 'hizmet' | 'daire' | 'kapsam' | 'durum' | 'konum' | 'foto' | 'iletisim' | 'ozet';
const STEP_TITLES: Record<StepId, string> = {
  hizmet: 'Hangi hizmeti almak istiyorsunuz?',
  daire: 'Daireniz hangi tipte?',
  kapsam: 'Neleri yaptırmak istiyorsunuz?',
  durum: 'Dairenin şu anki durumu nedir?',
  konum: 'Daire nerede?',
  foto: 'Fotoğraf eklemek ister misiniz?',
  iletisim: 'Size nasıl ulaşalım?',
  ozet: 'Bilgilerinizi kontrol edin',
};
const STEP_FIELDS: Record<StepId, FieldPath<QuoteInput>[]> = {
  hizmet: ['serviceType'],
  daire: ['roomType'],
  kapsam: [],
  durum: [],
  konum: ['district', 'neighborhood', 'message'],
  foto: [],
  iletisim: ['name', 'phone', 'email', 'contactPreference', 'contactTime', 'kvkk'],
  ozet: [],
};

const DRAFT_KEY = 'ocean_quote_draft_v1';
// Otomatik kayıt yalnızca kişisel olmayan seçimleri kapsar; ad, telefon, e-posta ve mesaj saklanmaz.
const DRAFT_FIELDS = ['serviceType', 'roomType', 'scopeOptions', 'propertyState', 'district'] as const;

/**
 * Hata satırı için yer her zaman ayrılır: hata görünüp kaybolurken alttaki alanlar kaymaz
 * (kullanıcı bir alanı düzeltip hemen sonraki kutuya tıkladığında tıklama ıskalanmaz).
 */
function ErrorText({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} role={message ? 'alert' : undefined} className="mt-1.5 min-h-5 text-sm font-medium leading-5 text-danger">
      {message}
    </p>
  );
}

export function QuoteForm({ packages, areas, phone, whatsapp, initial }: QuoteFormProps) {
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = useForm<QuoteInput, unknown, QuoteData>({
    resolver: zodResolver(quoteSchema),
    mode: 'onTouched',
    defaultValues: {
      serviceType: initial.serviceType as QuoteInput['serviceType'],
      roomType: initial.roomType as QuoteInput['roomType'],
      scopeOptions: [],
      district: initial.district ?? '',
      contactPreference: 'telefon',
      marketing: false,
      website: '',
      name: '',
      phone: '',
      email: '',
    },
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState('');
  const [otherDistrict, setOtherDistrict] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending'>('idle');
  const [formError, setFormError] = useState('');
  const [done, setDone] = useState<{ ref: string; summary: string } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);
  const completed = useRef(false);
  const currentStep = useRef<StepId>('hizmet');

  const serviceType = watch('serviceType');
  const roomType = watch('roomType');
  const district = watch('district');
  const isPainting = PAINTING_SERVICES.includes(serviceType ?? '');
  const pkg = isPainting ? packages.find((p) => p.roomType === roomType) : undefined;
  const isOther = district === OTHER_PREFIX.trim() || district?.startsWith(OTHER_PREFIX);

  const steps = useMemo<StepId[]>(
    () => (isPainting ? ['hizmet', 'daire', 'kapsam', 'durum', 'konum', 'foto', 'iletisim', 'ozet'] : ['hizmet', 'durum', 'konum', 'foto', 'iletisim', 'ozet']),
    [isPainting],
  );
  const step = steps[Math.min(stepIndex, steps.length - 1)]!;
  currentStep.current = step;

  // Taslağı geri yükle (URL'den gelen seçimler önceliklidir) ve giriş adımını belirle.
  useEffect(() => {
    try {
      const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null') as Partial<QuoteInput> | null;
      if (draft) {
        for (const k of DRAFT_FIELDS) {
          if (draft[k] !== undefined && !(k in initial && initial[k as keyof typeof initial])) setValue(k, draft[k] as never);
        }
      }
    } catch {
      /* taslak okunamadıysa boş formla devam edilir */
    }
    // Paket seçilerek gelindiyse hizmet ve daire adımları dolu kabul edilir.
    if (initial.serviceType && initial.roomType) setStepIndex(2);
    else if (initial.serviceType) setStepIndex(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sub = watch((values) => {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(Object.fromEntries(DRAFT_FIELDS.map((k) => [k, values[k]]))));
      } catch {
        /* depolama kapalıysa otomatik kayıt yapılmaz */
      }
    });
    return () => sub.unsubscribe();
  }, [watch]);

  // Formu yarıda bırakma ölçümü
  useEffect(() => {
    const onHide = () => {
      if (started.current && !completed.current) track('abandon_quote', { label: currentStep.current }, 'abandon');
    };
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, []);

  const go = (index: number) => {
    setStepIndex(index);
    setFormError('');
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const next = async () => {
    if (!started.current) {
      started.current = true;
      track('start_quote', { label: getValues('serviceType') }, 'start');
    }
    if (step === 'konum' && isOther) setValue('district', `${OTHER_PREFIX}${otherDistrict.trim()}`);
    const valid = await trigger(STEP_FIELDS[step]);
    if (step === 'konum' && isOther && otherDistrict.trim().length < 2) {
      setError('district', { message: 'Lütfen ilçenizi yazın.' });
      return;
    }
    if (!valid) return;
    track('quote_step', { label: step });
    go(Math.min(stepIndex + 1, steps.length - 1));
  };

  const addPhotos = (list: FileList | null) => {
    if (!list) return;
    const incoming = [...list];
    const bad = incoming.find((f) => !PHOTO_MIMES.includes(f.type));
    const big = incoming.find((f) => f.size > MAX_PHOTO_BYTES);
    if (bad) return setPhotoError('Yalnızca JPEG, PNG veya WebP biçiminde fotoğraf ekleyebilirsiniz.');
    if (big) return setPhotoError('Her fotoğraf en fazla 8 MB olabilir.');
    if (photos.length + incoming.length > MAX_PHOTOS) return setPhotoError(`En fazla ${MAX_PHOTOS} fotoğraf ekleyebilirsiniz.`);
    setPhotoError('');
    setPhotos((p) => [...p, ...incoming]);
  };

  const onSubmit = async (data: QuoteData) => {
    setStatus('sending');
    setFormError('');
    const fd = new FormData();
    fd.set('data', JSON.stringify({ ...getValues(), ...readAttribution() }));
    photos.forEach((f) => fd.append('photos', f));
    try {
      const res = await submitQuote(fd);
      if (res.ok) {
        completed.current = true;
        try {
          sessionStorage.removeItem(DRAFT_KEY);
        } catch {
          /* yok sayılır */
        }
        track('complete_quote', { label: data.serviceType, room_type: data.roomType, district: data.district }, res.ref);
        setDone({ ref: res.ref, summary: `${labelOf(SERVICE_TYPES, data.serviceType)}${data.roomType && isPainting ? ` · ${data.roomType}` : ''} · ${data.district}` });
        window.scrollTo({ top: 0 });
      } else {
        setFormError(res.message);
        const entries = Object.entries(res.fieldErrors ?? {});
        for (const [field, message] of entries) {
          if (field === 'photos') setPhotoError(message);
          else setError(field as FieldPath<QuoteInput>, { message });
        }
        const firstBad = steps.findIndex((s) => entries.some(([f]) => (STEP_FIELDS[s] as string[]).includes(f) || (s === 'foto' && f === 'photos')));
        if (firstBad > -1) go(firstBad);
      }
    } catch {
      setFormError('Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.');
    } finally {
      setStatus('idle');
    }
  };

  /* ---------------- Teşekkür ekranı ---------------- */
  if (done) {
    return (
      <div className="rounded-(--radius-xl) border border-line bg-white p-7 text-center shadow-(--shadow-card) md:p-12" data-testid="quote-success">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-success">
          <Check aria-hidden className="size-7" />
        </span>
        <h2 tabIndex={-1} className="mt-6 text-h3 font-bold">
          Talebiniz bize ulaştı
        </h2>
        <p className="mt-3 text-muted">Ekibimiz belirttiğiniz iletişim tercihine göre sizinle iletişime geçecek.</p>
        <dl className="mx-auto mt-8 max-w-sm rounded-(--radius-lg) bg-soft p-5 text-left">
          <dt className="text-sm text-muted">Talep numaranız</dt>
          <dd className="font-display text-2xl font-extrabold tracking-wide text-navy-900" data-testid="quote-ref">
            {done.ref}
          </dd>
          <dt className="mt-3 text-sm text-muted">Talep özeti</dt>
          <dd className="font-medium text-navy-900">{done.summary}</dd>
        </dl>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonAnchor href={`tel:${phone}`} variant="outline" data-event="click_phone" data-event-location="quote-success">
            <Phone aria-hidden className="size-4" /> {formatPhone(phone)}
          </ButtonAnchor>
          {whatsapp && (
            <ButtonAnchor
              href={whatsappUrl(whatsapp, `Merhaba, ${done.ref} numaralı teklif talebim hakkında bilgi almak istiyorum.`)}
              variant="whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              data-event="click_whatsapp"
              data-event-location="quote-success"
            >
              <MessageCircle aria-hidden className="size-4" /> WhatsApp ile yazın
            </ButtonAnchor>
          )}
          <ButtonLink href="/" variant="ghost">
            Ana sayfaya dön
          </ButtonLink>
        </div>
      </div>
    );
  }

  const v = getValues();
  const summaryRows: [string, string, StepId][] = [
    ['Hizmet', labelOf(SERVICE_TYPES, serviceType), 'hizmet'],
    ...(isPainting ? ([['Daire tipi', `${roomType ?? '—'}${pkg ? ` — ilan edilen fiyat ${formatPrice(pkg.price, pkg.currency)}` : ''}`, 'daire']] as [string, string, StepId][]) : []),
    ...(isPainting ? ([['İstenen kapsam', (v.scopeOptions ?? []).map((s) => labelOf(SCOPE_OPTIONS, s)).join(', ') || 'Belirtilmedi', 'kapsam']] as [string, string, StepId][]) : []),
    ['Daire durumu', v.propertyState ? labelOf(PROPERTY_STATES, v.propertyState) : 'Belirtilmedi', 'durum'],
    ['Konum', [v.neighborhood, v.district, 'İstanbul'].filter(Boolean).join(' / '), 'konum'],
    ...(v.message ? ([['Açıklama', v.message, 'konum']] as [string, string, StepId][]) : []),
    ['Fotoğraf', photos.length ? `${photos.length} adet` : 'Eklenmedi', 'foto'],
    ['İletişim', [v.name, v.phone, v.email].filter(Boolean).join(' · '), 'iletisim'],
    ['İletişim tercihi', `${labelOf(CONTACT_PREFERENCES, v.contactPreference)}${v.contactTime ? ` · ${v.contactTime}` : ''}`, 'iletisim'],
  ];
  const neighborhoods = areas.find((a) => a.name === district)?.neighborhoods ?? [];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-(--radius-xl) border border-line bg-white shadow-(--shadow-card)" data-testid="quote-form">
      {/* İlerleme */}
      <div className="border-b border-line px-6 py-5 md:px-10">
        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold text-navy-900">
            Adım {stepIndex + 1} / {steps.length}
          </p>
          {pkg && (
            <p className="text-muted" data-testid="quote-selected-package">
              {pkg.name}: <strong className="text-navy-900">{formatPrice(pkg.price, pkg.currency)}</strong>
            </p>
          )}
        </div>
        <div
          role="progressbar"
          aria-label="Teklif formu ilerlemesi"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-soft"
        >
          <div className="h-full origin-left rounded-full bg-ocean-600 transition-transform duration-(--duration-reveal) ease-(--ease-out-soft)" style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      </div>

      <div key={step} className="animate-(--animate-page-in) px-6 py-8 md:px-10 md:py-10">
        <h2 ref={headingRef} tabIndex={-1} className="text-h3 font-bold outline-none">
          {STEP_TITLES[step]}
        </h2>

        {step === 'hizmet' && (
          <fieldset className="mt-6" aria-describedby={errors.serviceType ? 'err-serviceType' : undefined}>
            <legend className="sr-only">Hizmet seçimi</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICE_TYPES.map((s) => (
                <label key={s.value} className="choice">
                  <input type="radio" value={s.value} {...register('serviceType')} />
                  {s.label}
                </label>
              ))}
            </div>
            <ErrorText id="err-serviceType" message={errors.serviceType?.message} />
          </fieldset>
        )}

        {step === 'daire' && (
          <fieldset className="mt-6" aria-describedby={errors.roomType ? 'err-roomType' : undefined}>
            <legend className="sr-only">Daire tipi</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {ROOM_TYPES.map((r) => (
                <label key={r} className="choice justify-center font-display text-lg font-bold">
                  <input type="radio" value={r} {...register('roomType')} className="sr-only" />
                  {r}
                </label>
              ))}
            </div>
            <ErrorText id="err-roomType" message={errors.roomType?.message} />
            <div aria-live="polite" className="mt-6">
              {roomType &&
                (pkg ? (
                  <p className="rounded-(--radius-md) bg-ocean-50 p-4 text-navy-900" data-testid="quote-price-note">
                    <strong>{pkg.name}</strong> için ilan edilen paket fiyatı: <strong data-testid="quote-price">{formatPrice(pkg.price, pkg.currency)}</strong>. Nihai teklif,
                    dairenizin durumu değerlendirildikten sonra netleşir.
                  </p>
                ) : (
                  <p className="rounded-(--radius-md) bg-soft p-4 text-muted" data-testid="quote-price-note">
                    Bu daire tipi için ilan edilmiş bir paket fiyatı yoktur. Bilgilerinizi ilettikten sonra kapsam değerlendirilerek size özel teklif hazırlanır.
                  </p>
                ))}
            </div>
          </fieldset>
        )}

        {step === 'kapsam' && (
          <fieldset className="mt-6">
            <legend className="text-muted">İsteğe bağlıdır; birden fazla seçebilirsiniz. Seçenekler pakete otomatik olarak dahil sayılmaz, teklifinizde ayrıca değerlendirilir.</legend>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SCOPE_OPTIONS.map((s) => (
                <label key={s.value} className="choice">
                  <input type="checkbox" value={s.value} {...register('scopeOptions')} />
                  {s.label}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {step === 'durum' && (
          <fieldset className="mt-6">
            <legend className="text-muted">İsteğe bağlıdır; planlamayı kolaylaştırır.</legend>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {PROPERTY_STATES.map((s) => (
                <label key={s.value} className="choice">
                  <input type="radio" value={s.value} {...register('propertyState')} />
                  {s.label}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {step === 'konum' && (
          <div className="mt-6 grid gap-x-5 gap-y-2 sm:grid-cols-2">
            <div>
              <label htmlFor="q-city" className="mb-2 block text-sm font-semibold text-navy-900">
                İl
              </label>
              <input id="q-city" className="field bg-soft" value="İstanbul" readOnly aria-readonly />
            </div>
            <div>
              <label htmlFor="q-district" className="mb-2 block text-sm font-semibold text-navy-900">
                İlçe <span aria-hidden className="text-danger">*</span>
              </label>
              <select
                id="q-district"
                className="field"
                aria-required
                aria-invalid={Boolean(errors.district)}
                aria-describedby={errors.district ? 'err-district' : undefined}
                value={isOther ? OTHER_PREFIX.trim() : (district ?? '')}
                onChange={(e) => setValue('district', e.target.value, { shouldValidate: true })}
              >
                <option value="">Seçin</option>
                {areas.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name}
                  </option>
                ))}
                <option value={OTHER_PREFIX.trim()}>Listede yok</option>
              </select>
              <ErrorText id="err-district" message={errors.district?.message} />
            </div>
            {isOther && (
              <div className="sm:col-span-2">
                <label htmlFor="q-other" className="mb-2 block text-sm font-semibold text-navy-900">
                  İlçeniz
                </label>
                <input id="q-other" className="field" value={otherDistrict} onChange={(e) => setOtherDistrict(e.target.value)} maxLength={60} autoComplete="address-level2" />
                <p className="mt-2 text-sm text-muted">Bu ilçe standart hizmet bölgelerimiz arasında değil. Talebinizi alırız ve hizmet verip veremeyeceğimizi size bildiririz.</p>
              </div>
            )}
            <div className="sm:col-span-2">
              <label htmlFor="q-neighborhood" className="mb-2 block text-sm font-semibold text-navy-900">
                Mahalle <span className="font-normal text-muted">(isteğe bağlı)</span>
              </label>
              <input id="q-neighborhood" className="field" list="q-neighborhoods" maxLength={120} {...register('neighborhood')} />
              <datalist id="q-neighborhoods">
                {neighborhoods.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="q-message" className="mb-2 block text-sm font-semibold text-navy-900">
                Açıklama <span className="font-normal text-muted">(isteğe bağlı)</span>
              </label>
              <textarea
                id="q-message"
                className="field"
                maxLength={1500}
                placeholder="Örn. 3. kat, asansör var; salonda nem izi mevcut; renk değişimi istiyoruz."
                aria-invalid={Boolean(errors.message)}
                {...register('message')}
              />
              <ErrorText id="err-message" message={errors.message?.message} />
            </div>
          </div>
        )}

        {step === 'foto' && (
          <div className="mt-6">
            <p className="text-muted">
              İsteğe bağlıdır. Duvarların durumunu gösteren fotoğraflar değerlendirmeyi hızlandırır. En fazla {MAX_PHOTOS} adet; JPEG, PNG veya WebP; her biri en çok 8 MB.
            </p>
            <label
              htmlFor="q-photos"
              className="mt-5 flex cursor-pointer flex-col items-center gap-3 rounded-(--radius-lg) border-2 border-dashed border-line-strong bg-soft px-6 py-10 text-center transition-colors hover:border-ocean-500 has-focus-visible:outline-2 has-focus-visible:outline-ocean-500"
            >
              <ImagePlus aria-hidden className="size-8 text-ocean-600" />
              <span className="font-semibold text-navy-900">Fotoğraf seçin</span>
              <input
                id="q-photos"
                type="file"
                accept={PHOTO_MIMES.join(',')}
                multiple
                className="sr-only"
                aria-describedby={photoError ? 'err-photos' : undefined}
                onChange={(e) => {
                  addPhotos(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
            <ErrorText id="err-photos" message={photoError} />
            {photos.length > 0 && (
              <ul className="mt-5 space-y-2">
                {photos.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-4 rounded-(--radius-md) border border-line px-4 py-2.5 text-sm">
                    <span className="truncate">{f.name}</span>
                    <button type="button" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))} aria-label={`${f.name} dosyasını kaldır`} className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-soft">
                      <X aria-hidden className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-sm text-muted">Fotoğraflar yalnızca talebinizin değerlendirilmesi için kullanılır ve herkese açık olarak yayınlanmaz.</p>
          </div>
        )}

        {step === 'iletisim' && (
          <div className="mt-6 grid gap-x-5 gap-y-2 sm:grid-cols-2">
            <div>
              <label htmlFor="q-name" className="mb-2 block text-sm font-semibold text-navy-900">
                Ad soyad <span aria-hidden className="text-danger">*</span>
              </label>
              <input id="q-name" className="field" autoComplete="name" aria-required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'err-name' : undefined} {...register('name')} />
              <ErrorText id="err-name" message={errors.name?.message} />
            </div>
            <div>
              <label htmlFor="q-phone" className="mb-2 block text-sm font-semibold text-navy-900">
                Telefon <span aria-hidden className="text-danger">*</span>
              </label>
              <input
                id="q-phone"
                type="tel"
                inputMode="tel"
                className="field"
                autoComplete="tel"
                placeholder="05xx xxx xx xx"
                aria-required
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'err-phone' : undefined}
                {...register('phone')}
              />
              <ErrorText id="err-phone" message={errors.phone?.message} />
            </div>
            <div>
              <label htmlFor="q-email" className="mb-2 block text-sm font-semibold text-navy-900">
                E-posta <span className="font-normal text-muted">(isteğe bağlı)</span>
              </label>
              <input id="q-email" type="email" className="field" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'err-email' : undefined} {...register('email')} />
              <ErrorText id="err-email" message={errors.email?.message} />
            </div>
            <div>
              <label htmlFor="q-time" className="mb-2 block text-sm font-semibold text-navy-900">
                Uygun iletişim zamanı <span className="font-normal text-muted">(isteğe bağlı)</span>
              </label>
              <input id="q-time" className="field" maxLength={60} placeholder="Örn. hafta içi 18:00 sonrası" {...register('contactTime')} />
            </div>
            <fieldset className="sm:col-span-2">
              <legend className="mb-2 text-sm font-semibold text-navy-900">İletişim tercihi</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {CONTACT_PREFERENCES.map((c) => (
                  <label key={c.value} className="choice">
                    <input type="radio" value={c.value} {...register('contactPreference')} />
                    {c.label}
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Bal küpü: ekran okuyuculardan ve klavye sırasından gizli */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Web siteniz
                <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
              </label>
            </div>

            <div className="space-y-3 sm:col-span-2">
              <label className="flex items-start gap-3 text-[0.9375rem]">
                <input type="checkbox" className="mt-1 size-4.5 shrink-0 accent-ocean-600" aria-required aria-invalid={Boolean(errors.kvkk)} aria-describedby={errors.kvkk ? 'err-kvkk' : undefined} {...register('kvkk')} />
                <span>
                  <Link href="/kvkk-aydinlatma-metni" target="_blank" className="text-link">
                    KVKK Aydınlatma Metni
                  </Link>
                  ’ni okudum; bilgilerimin teklif talebimin değerlendirilmesi amacıyla işleneceğini biliyorum. <span aria-hidden className="text-danger">*</span>
                </span>
              </label>
              <ErrorText id="err-kvkk" message={errors.kvkk?.message} />
              <label className="flex items-start gap-3 text-[0.9375rem]">
                <input type="checkbox" className="mt-1 size-4.5 shrink-0 accent-ocean-600" {...register('marketing')} />
                <span>
                  Kampanya ve duyurular hakkında tarafıma ticari elektronik ileti gönderilmesine izin veriyorum. <span className="text-muted">(İsteğe bağlı; teklif almak için gerekli değildir.)</span>
                </span>
              </label>
            </div>
          </div>
        )}

        {step === 'ozet' && (
          <div className="mt-6">
            <dl className="divide-y divide-line border-y border-line" data-testid="quote-summary">
              {summaryRows.map(([label, value, target]) => (
                <div key={label} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr_auto] sm:gap-4">
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="whitespace-pre-line font-medium text-navy-900">{value}</dd>
                  <dd>
                    <button type="button" onClick={() => go(steps.indexOf(target))} className="text-sm font-semibold text-ocean-700 underline underline-offset-4">
                      Düzenle<span className="sr-only">: {label}</span>
                    </button>
                  </dd>
                </div>
              ))}
            </dl>
            {pkg && (
              <p className="mt-4 text-sm text-muted">Gösterilen tutar ilan edilen paket fiyatıdır; nihai teklifiniz kapsam netleştirildikten sonra ayrıca iletilir.</p>
            )}
          </div>
        )}

        {formError && (
          <p role="alert" className="mt-6 rounded-(--radius-md) border border-red-200 bg-red-50 p-4 text-sm font-medium text-danger" data-testid="quote-error">
            {formError}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-5 md:px-10">
        <Button type="button" variant="ghost" onClick={() => go(stepIndex - 1)} disabled={stepIndex === 0 || status === 'sending'} className={cn(stepIndex === 0 && 'invisible')}>
          <ArrowLeft aria-hidden className="size-4" /> Geri
        </Button>
        {/* Ayrı key: React aynı düğümü yeniden kullanırsa "Özeti Görüntüle" tıklaması, türü submit'e dönen düğmede formu gönderir. */}
        {step === 'ozet' ? (
          <Button key="submit" type="submit" variant="accent" size="lg" loading={status === 'sending'} data-testid="quote-submit">
            {status === 'sending' ? 'Gönderiliyor…' : 'Talebi Gönder'}
          </Button>
        ) : (
          <Button key="next" type="button" size="lg" onClick={next} data-testid="quote-next">
            {step === 'iletisim' ? 'Özeti Görüntüle' : 'Devam'} <ArrowRight aria-hidden className="size-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
