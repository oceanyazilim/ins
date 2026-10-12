'use server';

import { randomInt } from 'node:crypto';
import { z } from 'zod';
import { db } from '@/db';
import { leadAttachments, leadConsents, leads, leadStatusHistory } from '@/db/schema';
import { KVKK_TEXT_VERSION } from '@/config/site';
import { env } from '@/lib/env';
import { logAudit } from '@/server/audit';
import { clientIp } from '@/server/auth';
import { getActiveAreas, getPackages } from '@/server/data';
import { notifyNewLead } from '@/server/email';
import { hashIp, rateLimit } from '@/server/rate-limit';
import { deleteStored, storeImage, UploadError, type StoredImage } from '@/server/storage';
import { resolveDistrict } from './district';
import { labelOf, MAX_PHOTOS, PAINTING_SERVICES, PROPERTY_STATES, SCOPE_OPTIONS, SERVICE_TYPES } from './options';
import { contactSchema, quoteSchema } from './schema';

export type SubmitResult =
  | { ok: true; ref: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
function newRef(): string {
  const d = new Date();
  const stamp = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  let code = '';
  for (let i = 0; i < 5; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return `OCN-${stamp}-${code}`;
}

const fieldErrors = (e: z.ZodError) => Object.fromEntries(e.issues.map((i) => [String(i.path[0] ?? 'form'), i.message]));

async function guard(kind: string): Promise<{ ipHash: string } | SubmitResult> {
  const ipHash = hashIp(await clientIp());
  const okShort = await rateLimit(`${kind}:${ipHash}`, 5, 600);
  const okDay = await rateLimit(`${kind}-day:${ipHash}`, 25, 86_400);
  if (!okShort || !okDay) return { ok: false, message: 'Kısa sürede çok fazla talep gönderildi. Lütfen birkaç dakika sonra tekrar deneyin ya da bizi telefonla arayın.' };
  return { ipHash };
}

async function insertLead(values: typeof leads.$inferInsert, consents: { type: string; granted: boolean }[], photos: StoredImage[]) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const ref = newRef();
    try {
      return await db.transaction(async (tx) => {
        const [lead] = await tx.insert(leads).values({ ...values, ref }).returning({ id: leads.id, ref: leads.ref });
        await tx.insert(leadStatusHistory).values({ leadId: lead!.id, fromStatus: null, toStatus: 'new' });
        await tx.insert(leadConsents).values(consents.map((c) => ({ leadId: lead!.id, ...c, textVersion: KVKK_TEXT_VERSION })));
        if (photos.length) {
          await tx.insert(leadAttachments).values(photos.map((p) => ({ leadId: lead!.id, storageKey: p.key, mime: p.mime, size: p.size, width: p.width, height: p.height })));
        }
        return lead!;
      });
    } catch (e) {
      // Benzersiz talep numarası çakışırsa yeni numarayla tekrar denenir.
      if ((e as { code?: string }).code === '23505' && attempt < 3) continue;
      throw e;
    }
  }
  throw new Error('Talep numarası üretilemedi');
}

export async function submitQuote(formData: FormData): Promise<SubmitResult> {
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get('data') ?? ''));
  } catch {
    return { ok: false, message: 'Form verisi okunamadı. Lütfen sayfayı yenileyip tekrar deneyin.' };
  }

  // Bal küpü dolduysa bot kabul edilir: kayıt oluşturulmaz, bota başarı görünümü verilir.
  if (typeof (raw as { website?: string }).website === 'string' && (raw as { website: string }).website.length > 0) {
    return { ok: true, ref: newRef() };
  }

  const g = await guard('quote');
  if ('ok' in g) return g;

  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: 'Lütfen işaretli alanları kontrol edin.', fieldErrors: fieldErrors(parsed.error) };
  const v = parsed.data;

  const [areas, packages] = await Promise.all([getActiveAreas(), getPackages()]);
  const district = resolveDistrict(v.district, areas.map((a) => a.name));
  if (!district.ok) return { ok: false, message: district.message, fieldErrors: { district: district.message } };

  const isPainting = PAINTING_SERVICES.includes(v.serviceType);
  // İlan fiyatı yalnızca aktif paketi olan daire tipleri için kaydedilir; 4+1 ve diğerleri için fiyat üretilmez.
  const pkg = isPainting ? packages.find((p) => p.roomType === v.roomType) : undefined;

  const files = formData.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_PHOTOS) return { ok: false, message: `En fazla ${MAX_PHOTOS} fotoğraf ekleyebilirsiniz.`, fieldErrors: { photos: `En fazla ${MAX_PHOTOS} fotoğraf ekleyebilirsiniz.` } };

  const stored: StoredImage[] = [];
  try {
    for (const f of files) stored.push(await storeImage(Buffer.from(await f.arrayBuffer()), 'leads'));
  } catch (e) {
    await Promise.all(stored.map((s) => deleteStored(s.key)));
    const msg = e instanceof UploadError ? e.message : 'Fotoğraflar yüklenemedi. Fotoğrafsız göndermeyi deneyebilirsiniz.';
    return { ok: false, message: msg, fieldErrors: { photos: msg } };
  }

  try {
    const lead = await insertLead(
      {
        ref: '',
        kind: 'quote',
        serviceType: v.serviceType,
        roomType: isPainting ? (v.roomType ?? null) : null,
        packageId: pkg?.id ?? null,
        listedPrice: pkg?.price ?? null,
        scopeOptions: isPainting ? v.scopeOptions : [],
        propertyState: v.propertyState ?? null,
        district: district.value,
        neighborhood: v.neighborhood || null,
        message: v.message || null,
        name: v.name,
        phone: v.phone,
        email: v.email || null,
        contactPreference: v.contactPreference,
        contactTime: v.contactTime || null,
        landingPage: v.landingPage || null,
        referrer: v.referrer || null,
        utmSource: v.utmSource || null,
        utmMedium: v.utmMedium || null,
        utmCampaign: v.utmCampaign || null,
        ipHash: g.ipHash,
      },
      [
        { type: 'kvkk_notice', granted: true },
        { type: 'marketing', granted: v.marketing },
      ],
      stored,
    );

    await logAudit(null, 'lead.created', 'lead', lead.id, `Yeni teklif talebi ${lead.ref}`);
    // Bildirim başarısız olsa da talep kaydedilmiştir; kullanıcıya başarı gösterilir.
    await notifyNewLead({
      ref: lead.ref,
      serviceLabel: labelOf(SERVICE_TYPES, v.serviceType),
      roomType: isPainting ? v.roomType : null,
      listedPrice: pkg?.price ?? null,
      district: district.value,
      neighborhood: v.neighborhood,
      propertyState: v.propertyState ? labelOf(PROPERTY_STATES, v.propertyState) : null,
      scope: isPainting ? v.scopeOptions.map((s) => labelOf(SCOPE_OPTIONS, s)) : [],
      name: v.name,
      phone: v.phone,
      email: v.email,
      contactPreference: v.contactPreference,
      contactTime: v.contactTime,
      message: v.message,
      photoCount: stored.length,
      adminUrl: `${env.SITE_URL}/admin/talepler/${lead.id}`,
    });
    return { ok: true, ref: lead.ref };
  } catch (e) {
    await Promise.all(stored.map((s) => deleteStored(s.key)));
    console.error('[quote] kayıt hatası:', e);
    return { ok: false, message: 'Talebiniz kaydedilemedi. Lütfen tekrar deneyin ya da bizi telefonla arayın.' };
  }
}

export async function submitContact(input: unknown): Promise<SubmitResult> {
  if (typeof (input as { website?: string })?.website === 'string' && (input as { website: string }).website.length > 0) {
    return { ok: true, ref: newRef() };
  }
  const g = await guard('contact');
  if ('ok' in g) return g;
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: 'Lütfen işaretli alanları kontrol edin.', fieldErrors: fieldErrors(parsed.error) };
  const v = parsed.data;
  try {
    const lead = await insertLead(
      { ref: '', kind: 'contact', serviceType: 'iletisim', name: v.name, phone: v.phone, email: v.email || null, message: v.message, ipHash: g.ipHash },
      [{ type: 'kvkk_notice', granted: true }],
      [],
    );
    await notifyNewLead({
      ref: lead.ref,
      serviceLabel: 'İletişim formu',
      scope: [],
      name: v.name,
      phone: v.phone,
      email: v.email,
      message: v.message,
      photoCount: 0,
      adminUrl: `${env.SITE_URL}/admin/talepler/${lead.id}`,
    });
    return { ok: true, ref: lead.ref };
  } catch (e) {
    console.error('[contact] kayıt hatası:', e);
    return { ok: false, message: 'Mesajınız kaydedilemedi. Lütfen tekrar deneyin ya da bizi telefonla arayın.' };
  }
}
