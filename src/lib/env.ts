import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().min(1).default('postgres://ocean:ocean@localhost:54329/ocean'),
  SITE_URL: z
    .string()
    .url()
    .default('https://oceaninsaat.com.tr')
    .transform((v) => v.replace(/\/+$/, '')),
  APP_SECRET: z.string().default(''),
  SMTP_HOST: z.string().default(''),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASSWORD: z.string().default(''),
  SMTP_FROM: z.string().default('Ocean İnşaat <destek@oceaninsaat.com.tr>'),
  LEAD_NOTIFY_EMAIL: z.string().default(''),
  STORAGE_DIR: z.string().default('./storage'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Ortam değişkenleri geçersiz: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
}

export const env = parsed.data;

/** Üretimde zayıf gizli anahtarla çalışmayı engeller; derleme sırasında değil, ilk kullanımda denetlenir. */
export function appSecret(): string {
  if (env.APP_SECRET.length >= 32) return env.APP_SECRET;
  if (env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
    throw new Error('APP_SECRET en az 32 karakter olmalıdır (üretim).');
  }
  return 'dev-only-secret-not-for-production-use-0000';
}
