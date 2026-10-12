import { z } from 'zod';
import { normalizeTrPhone } from '@/lib/format';
import { CONTACT_PREFERENCES, PROPERTY_STATES, ROOM_TYPES, SCOPE_OPTIONS, SERVICE_TYPES } from './options';

const values = <T extends readonly { value: string }[]>(l: T) => l.map((o) => o.value) as [string, ...string[]];

// Denetim karakterlerini ayıklar; çıktı her yerde React tarafından kaçışlanarak basılır.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const clean = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `En fazla ${max} karakter girebilirsiniz.`)
    .transform((s) => s.replace(CONTROL, ''));

const phone = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const p = normalizeTrPhone(v);
    if (!p) {
      ctx.addIssue({ code: 'custom', message: 'Geçerli bir telefon numarası girin. Örn. 0533 123 45 67' });
      return z.NEVER;
    }
    return p;
  });

const optionalEmail = z.union([z.literal(''), z.email('Geçerli bir e-posta adresi girin.')]).optional();
const kvkk = z.literal(true, { error: 'Devam etmek için aydınlatma metnini okuduğunuzu onaylayın.' });

export const quoteSchema = z
  .object({
    serviceType: z.enum(values(SERVICE_TYPES), { error: 'Lütfen bir hizmet seçin.' }),
    roomType: z.enum(ROOM_TYPES).optional(),
    scopeOptions: z.array(z.enum(values(SCOPE_OPTIONS))).max(SCOPE_OPTIONS.length).default([]),
    propertyState: z.enum(values(PROPERTY_STATES)).optional(),
    district: clean(80).pipe(z.string().min(1, 'Lütfen ilçe seçin.')),
    neighborhood: clean(120).optional(),
    message: clean(1500).optional(),
    name: clean(120).pipe(z.string().min(3, 'Lütfen adınızı ve soyadınızı yazın.')),
    phone,
    email: optionalEmail,
    contactPreference: z.enum(values(CONTACT_PREFERENCES)).default('telefon'),
    contactTime: clean(60).optional(),
    kvkk,
    marketing: z.boolean().default(false),
    /** Bal küpü alanı: gerçek kullanıcılar görmez ve doldurmaz. */
    website: z.string().max(0).optional(),
    landingPage: clean(255).optional(),
    referrer: clean(255).optional(),
    utmSource: clean(120).optional(),
    utmMedium: clean(120).optional(),
    utmCampaign: clean(120).optional(),
  })
  .superRefine((v, ctx) => {
    if ((v.serviceType === 'ev-boyama' || v.serviceType === 'boya-badana') && !v.roomType) {
      ctx.addIssue({ code: 'custom', path: ['roomType'], message: 'Lütfen daire tipini seçin.' });
    }
    if (v.contactPreference === 'e-posta' && !v.email) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: 'E-posta ile iletişim için e-posta adresinizi yazın.' });
    }
  });

export type QuoteInput = z.input<typeof quoteSchema>;
export type QuoteData = z.output<typeof quoteSchema>;

export const contactSchema = z.object({
  name: clean(120).pipe(z.string().min(3, 'Lütfen adınızı ve soyadınızı yazın.')),
  phone,
  email: optionalEmail,
  message: clean(1500).pipe(z.string().min(10, 'Lütfen mesajınızı biraz daha ayrıntılı yazın.')),
  kvkk,
  website: z.string().max(0).optional(),
});
export type ContactInput = z.input<typeof contactSchema>;
