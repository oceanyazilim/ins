'use server';

import { and, eq, ne, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/db';
import * as s from '@/db/schema';
import { defaultSettings, EXCLUDED_AREA_SLUGS, type SiteSettings } from '@/config/site';
import { staticRedirects } from '@/config/redirects';
import { LEAD_STATUSES } from '@/features/quote/options';
import { normalizeTrPhone } from '@/lib/format';
import { estimateReadMinutes } from '@/lib/markdown';
import { hashPassword, verifyPassword } from '@/lib/password';
import { normalizePath, validateRedirect } from '@/lib/redirect-rules';
import { isValidSlug, slugify } from '@/lib/slug';
import { logAudit } from '@/server/audit';
import { clientIp, createSession, destroySession, requireUser } from '@/server/auth';
import { hashIp, rateLimit } from '@/server/rate-limit';
import { deleteStored, storeImage, UploadError } from '@/server/storage';
import { areaPageIssues, linesToList, parseFaqs, parseScopeItems, parseSections, parseSteps } from './parse';

/* ------------------------------------------------------------------ */
/* Yardımcılar                                                         */
/* ------------------------------------------------------------------ */

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const opt = (fd: FormData, k: string) => str(fd, k) || null;
const bool = (fd: FormData, k: string) => fd.get(k) === 'on' || fd.get(k) === 'true';
const int = (fd: FormData, k: string) => {
  const n = Number(str(fd, k));
  return Number.isInteger(n) ? n : NaN;
};

function back(path: string, kind: 'ok' | 'hata', message: string): never {
  redirect(`${path}${path.includes('?') ? '&' : '?'}${kind}=${encodeURIComponent(message)}`);
}

/** Yönetim panelindeki her değişiklikten sonra herkese açık sitenin tamamı yenilenir. */
function refreshSite() {
  revalidatePath('/', 'layout');
}

/* ------------------------------------------------------------------ */
/* Oturum                                                              */
/* ------------------------------------------------------------------ */

export async function loginAction(fd: FormData): Promise<void> {
  const email = str(fd, 'email').toLowerCase();
  const password = String(fd.get('password') ?? '');
  const ip = hashIp(await clientIp());
  // Hem IP hem hesap bazında deneme sınırı (15 dakikada 8 deneme).
  const allowed = (await rateLimit(`login-ip:${ip}`, 8, 900)) && (await rateLimit(`login-user:${email}`, 8, 900));
  if (!allowed) back('/admin/giris', 'hata', 'Çok fazla deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin.');

  const [user] = await db.select().from(s.users).where(eq(s.users.email, email)).limit(1);
  // Kullanıcı yoksa da aynı sürede yanıt vermek için sahte özet doğrulanır.
  const ok = user
    ? await verifyPassword(password, user.passwordHash)
    : await verifyPassword(password, 'scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$' + 'A'.repeat(86) + '==').catch(() => false);
  if (!user || !ok || !user.active) {
    await logAudit(null, 'auth.login_failed', 'user', null, `Başarısız giriş denemesi: ${email.slice(0, 80)}`);
    back('/admin/giris', 'hata', 'E-posta veya parola hatalı.');
  }
  await createSession(user.id);
  await db.update(s.users).set({ lastLoginAt: new Date() }).where(eq(s.users.id, user.id));
  await logAudit(user.id, 'auth.login', 'user', user.id, `${user.email} giriş yaptı`);
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  const user = await requireUser();
  await destroySession();
  await logAudit(user.id, 'auth.logout', 'user', user.id, `${user.email} çıkış yaptı`);
  redirect('/admin/giris');
}

export async function saveUserAction(fd: FormData): Promise<void> {
  const me = await requireUser('users.manage');
  const email = str(fd, 'email').toLowerCase();
  const password = String(fd.get('password') ?? '');
  const role = str(fd, 'role') === 'admin' ? 'admin' : 'editor';
  if (!z.email().safeParse(email).success) back('/admin/ayarlar', 'hata', 'Geçerli bir e-posta girin.');
  if (password.length < 12) back('/admin/ayarlar', 'hata', 'Parola en az 12 karakter olmalı.');
  const passwordHash = await hashPassword(password);
  await db
    .insert(s.users)
    .values({ email, name: str(fd, 'name') || email, passwordHash, role })
    .onConflictDoUpdate({ target: s.users.email, set: { passwordHash, role, active: true, name: str(fd, 'name') || email } });
  await logAudit(me.id, 'user.saved', 'user', email, `Kullanıcı kaydedildi: ${email} (${role})`);
  back('/admin/ayarlar', 'ok', 'Kullanıcı kaydedildi.');
}

export async function toggleUserAction(fd: FormData): Promise<void> {
  const me = await requireUser('users.manage');
  const id = int(fd, 'id');
  if (id === me.id) back('/admin/ayarlar', 'hata', 'Kendi hesabınızı devre dışı bırakamazsınız.');
  const [u] = await db.update(s.users).set({ active: sql`not ${s.users.active}` }).where(eq(s.users.id, id)).returning();
  if (u && !u.active) await db.delete(s.sessions).where(eq(s.sessions.userId, id));
  await logAudit(me.id, 'user.toggled', 'user', id, `${u?.email} ${u?.active ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`);
  back('/admin/ayarlar', 'ok', 'Kullanıcı güncellendi.');
}

/* ------------------------------------------------------------------ */
/* Talepler                                                            */
/* ------------------------------------------------------------------ */

export async function updateLeadAction(fd: FormData): Promise<void> {
  const user = await requireUser('leads.manage');
  const id = int(fd, 'id');
  const path = `/admin/talepler/${id}`;
  const status = str(fd, 'status') as s.LeadStatus;
  if (!LEAD_STATUSES.some((x) => x.value === status)) back(path, 'hata', 'Geçersiz durum.');
  const quotedRaw = str(fd, 'quotedPrice');
  const quotedPrice = quotedRaw === '' ? null : Number(quotedRaw.replace(/\./g, ''));
  if (quotedPrice !== null && (!Number.isInteger(quotedPrice) || quotedPrice < 0)) back(path, 'hata', 'Teklif tutarı tam sayı olmalı.');

  const [lead] = await db.select().from(s.leads).where(eq(s.leads.id, id)).limit(1);
  if (!lead) back('/admin/talepler', 'hata', 'Talep bulunamadı.');
  await db.transaction(async (tx) => {
    await tx.update(s.leads).set({ status, quotedPrice }).where(eq(s.leads.id, id));
    if (lead.status !== status) await tx.insert(s.leadStatusHistory).values({ leadId: id, fromStatus: lead.status, toStatus: status, changedBy: user.id });
  });
  const note = str(fd, 'note');
  if (note) await db.insert(s.leadNotes).values({ leadId: id, userId: user.id, body: note.slice(0, 2000) });
  await logAudit(user.id, 'lead.updated', 'lead', id, `${lead.ref}: durum ${lead.status} → ${status}${quotedPrice !== lead.quotedPrice ? `, teklif ${quotedPrice ?? '—'}` : ''}`);
  back(path, 'ok', 'Talep güncellendi.');
}

/** KVKK silme talebi: kişisel alanlar ve fotoğraflar kalıcı olarak silinir, istatistik için anonim kayıt kalır. */
export async function anonymizeLeadAction(fd: FormData): Promise<void> {
  const user = await requireUser('leads.delete');
  const id = int(fd, 'id');
  const files = await db.select().from(s.leadAttachments).where(eq(s.leadAttachments.leadId, id));
  await Promise.all(files.map((f) => deleteStored(f.storageKey)));
  await db.transaction(async (tx) => {
    await tx.delete(s.leadAttachments).where(eq(s.leadAttachments.leadId, id));
    await tx.delete(s.leadNotes).where(eq(s.leadNotes.leadId, id));
    await tx
      .update(s.leads)
      .set({ name: 'Silindi', phone: '-', email: null, message: null, neighborhood: null, contactTime: null, ipHash: null, referrer: null, anonymizedAt: new Date() })
      .where(eq(s.leads.id, id));
  });
  await logAudit(user.id, 'lead.anonymized', 'lead', id, 'Talebin kişisel verileri silindi (KVKK)');
  back(`/admin/talepler/${id}`, 'ok', 'Kişisel veriler silindi.');
}

/* ------------------------------------------------------------------ */
/* Boya fiyatları                                                      */
/* ------------------------------------------------------------------ */

export async function savePackageAction(fd: FormData): Promise<void> {
  const user = await requireUser('pricing.manage');
  const id = int(fd, 'id');
  const path = `/admin/fiyatlar/${id}`;
  const price = Number(str(fd, 'price').replace(/[.\s]/g, ''));
  if (!Number.isInteger(price) || price <= 0 || price > 10_000_000) back(path, 'hata', 'Fiyat pozitif bir tam sayı olmalı (TL).');
  const validUntil = opt(fd, 'validUntil');
  if (validUntil && !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) back(path, 'hata', 'Geçerlilik tarihi geçersiz.');
  const name = str(fd, 'name');
  if (!name) back(path, 'hata', 'Paket adı boş olamaz.');

  const [current] = await db.select().from(s.paintingPackages).where(eq(s.paintingPackages.id, id)).limit(1);
  if (!current) back('/admin/fiyatlar', 'hata', 'Paket bulunamadı.');

  await db.transaction(async (tx) => {
    await tx
      .update(s.paintingPackages)
      .set({
        name,
        price,
        active: bool(fd, 'active'),
        summary: str(fd, 'summary'),
        description: str(fd, 'description'),
        body: str(fd, 'body'),
        scopeItems: parseScopeItems(str(fd, 'scopeItems')),
        scopeNote: str(fd, 'scopeNote'),
        vatNote: str(fd, 'vatNote'),
        validUntil,
        faqs: parseFaqs(str(fd, 'faqs')),
        metaTitle: opt(fd, 'metaTitle'),
        metaDescription: opt(fd, 'metaDescription'),
      })
      .where(eq(s.paintingPackages.id, id));
    if (current.price !== price) {
      await tx.insert(s.packagePriceHistory).values({ packageId: id, oldPrice: current.price, newPrice: price, changedBy: user.id });
    }
  });
  if (current.price !== price) {
    await logAudit(user.id, 'price.changed', 'package', id, `${current.name}: ${current.price} TL → ${price} TL`, { oldPrice: current.price, newPrice: price });
  } else {
    await logAudit(user.id, 'package.updated', 'package', id, `${current.name} paketi güncellendi`);
  }
  refreshSite();
  back(path, 'ok', 'Paket kaydedildi; fiyat sitenin tamamında güncellendi.');
}

/* ------------------------------------------------------------------ */
/* Hizmet bölgeleri                                                    */
/* ------------------------------------------------------------------ */

export async function createAreaAction(fd: FormData): Promise<void> {
  const user = await requireUser('areas.manage');
  const name = str(fd, 'name');
  const slug = slugify(name);
  if (!name || !slug) back('/admin/bolgeler', 'hata', 'İlçe adı girin.');
  if (EXCLUDED_AREA_SLUGS.some((x) => slug.includes(x))) back('/admin/bolgeler', 'hata', 'Bu bölge hizmet kapsamı dışında tanımlıdır ve eklenemez.');
  const [row] = await db.insert(s.serviceAreas).values({ name, slug, tier: 'secondary', active: false, sort: 99 }).onConflictDoNothing().returning();
  if (!row) back('/admin/bolgeler', 'hata', 'Bu ilçe zaten kayıtlı.');
  await logAudit(user.id, 'area.created', 'area', row.id, `Bölge eklendi: ${name} (pasif)`);
  redirect(`/admin/bolgeler/${row.id}`);
}

export async function saveAreaAction(fd: FormData): Promise<void> {
  const user = await requireUser('areas.manage');
  const id = int(fd, 'id');
  const path = `/admin/bolgeler/${id}`;
  const [current] = await db.select().from(s.serviceAreas).where(eq(s.serviceAreas.id, id)).limit(1);
  if (!current) back('/admin/bolgeler', 'hata', 'Bölge bulunamadı.');
  if (EXCLUDED_AREA_SLUGS.some((x) => current.slug.includes(x))) back(path, 'hata', 'Bu bölge etkinleştirilemez.');

  const active = bool(fd, 'active');
  const sections = parseSections(str(fd, 'sections'));
  const values = {
    tier: str(fd, 'tier') === 'primary' ? ('primary' as const) : ('secondary' as const),
    active,
    h1: str(fd, 'h1'),
    lead: str(fd, 'lead'),
    summary: str(fd, 'summary'),
    sections,
    faqs: parseFaqs(str(fd, 'faqs')),
    metaTitle: opt(fd, 'metaTitle'),
    metaDescription: opt(fd, 'metaDescription'),
    sort: int(fd, 'sort') || 0,
  };
  // Lokasyon sayfası yalnızca kalite kapısından geçerse yayınlanır.
  const wantPage = bool(fd, 'pagePublished');
  const issues = wantPage ? areaPageIssues({ active, name: current.name, lead: values.lead, sections, metaDescription: values.metaDescription }) : [];
  const pagePublished = wantPage && issues.length === 0;

  await db.transaction(async (tx) => {
    await tx.update(s.serviceAreas).set({ ...values, pagePublished }).where(eq(s.serviceAreas.id, id));
    await tx.delete(s.neighborhoods).where(eq(s.neighborhoods.areaId, id));
    const names = [...new Set(linesToList(str(fd, 'neighborhoods')))].filter((n) => !EXCLUDED_AREA_SLUGS.some((x) => slugify(n).includes(x)));
    if (names.length) await tx.insert(s.neighborhoods).values(names.map((n, i) => ({ areaId: id, name: n, sort: i })));
  });
  await logAudit(user.id, 'area.updated', 'area', id, `${current.name}: ${active ? 'aktif' : 'pasif'}, sayfa ${pagePublished ? 'yayında' : 'kapalı'}`);
  refreshSite();
  if (issues.length) back(path, 'hata', `Kaydedildi ancak lokasyon sayfası yayınlanmadı: ${issues.join(' ')}`);
  back(path, 'ok', 'Bölge kaydedildi.');
}

/* ------------------------------------------------------------------ */
/* Hizmetler                                                           */
/* ------------------------------------------------------------------ */

export async function saveServiceAction(fd: FormData): Promise<void> {
  const user = await requireUser('content.manage');
  const idRaw = str(fd, 'id');
  const id = idRaw ? Number(idRaw) : null;
  const path = id ? `/admin/hizmetler/${id}` : '/admin/hizmetler/yeni';
  const title = str(fd, 'title');
  const slug = str(fd, 'slug') || slugify(title);
  if (!title) back(path, 'hata', 'Başlık boş olamaz.');
  if (!isValidSlug(slug)) back(path, 'hata', 'Adres (slug) yalnızca küçük harf, rakam ve tire içerebilir.');
  const dup = await db.select({ id: s.services.id }).from(s.services).where(and(eq(s.services.slug, slug), id ? ne(s.services.id, id) : undefined)).limit(1);
  if (dup.length) back(path, 'hata', 'Bu adres başka bir hizmette kullanılıyor.');

  const values = {
    slug,
    title,
    categoryId: int(fd, 'categoryId'),
    tagline: str(fd, 'tagline'),
    overview: str(fd, 'overview'),
    intro: str(fd, 'intro'),
    body: str(fd, 'body'),
    scope: linesToList(str(fd, 'scope')),
    steps: parseSteps(str(fd, 'steps')),
    materials: linesToList(str(fd, 'materials')),
    benefits: linesToList(str(fd, 'benefits')),
    projectTypes: linesToList(str(fd, 'projectTypes')),
    faqs: parseFaqs(str(fd, 'faqs')),
    related: linesToList(str(fd, 'related')),
    image: opt(fd, 'image'),
    imageAlt: opt(fd, 'imageAlt'),
    metaTitle: opt(fd, 'metaTitle'),
    metaDescription: opt(fd, 'metaDescription'),
    status: str(fd, 'status') === 'published' ? ('published' as const) : ('draft' as const),
    sort: int(fd, 'sort') || 0,
  };
  let savedId = id;
  if (id) await db.update(s.services).set(values).where(eq(s.services.id, id));
  else savedId = (await db.insert(s.services).values(values).returning({ id: s.services.id }))[0]!.id;
  await logAudit(user.id, id ? 'service.updated' : 'service.created', 'service', savedId, `Hizmet kaydedildi: ${title} (${values.status})`);
  refreshSite();
  back(`/admin/hizmetler/${savedId}`, 'ok', 'Hizmet kaydedildi.');
}

/* ------------------------------------------------------------------ */
/* Blog                                                                */
/* ------------------------------------------------------------------ */

export async function savePostAction(fd: FormData): Promise<void> {
  const user = await requireUser('content.manage');
  const idRaw = str(fd, 'id');
  const id = idRaw ? Number(idRaw) : null;
  const path = id ? `/admin/blog/${id}` : '/admin/blog/yeni';
  const title = str(fd, 'title');
  const slug = str(fd, 'slug') || slugify(title);
  const body = str(fd, 'body');
  const status = z.enum(s.postStatusEnum.enumValues).catch('draft').parse(str(fd, 'status'));
  if (!title) back(path, 'hata', 'Başlık boş olamaz.');
  if (!isValidSlug(slug)) back(path, 'hata', 'Adres (slug) yalnızca küçük harf, rakam ve tire içerebilir.');
  const dup = await db.select({ id: s.blogPosts.id }).from(s.blogPosts).where(and(eq(s.blogPosts.slug, slug), id ? ne(s.blogPosts.id, id) : undefined)).limit(1);
  if (dup.length) back(path, 'hata', 'Bu adres başka bir yazıda kullanılıyor.');
  // Yayın kalite kapısı: içerik, özet ve meta açıklaması olmadan yayınlanamaz.
  if (status === 'published') {
    if (body.length < 600) back(path, 'hata', 'Yayınlamak için içerik çok kısa (en az 600 karakter).');
    if (!str(fd, 'excerpt') || !str(fd, 'metaDescription')) back(path, 'hata', 'Yayınlamak için özet ve meta açıklaması gerekli.');
  }

  const [current] = id ? await db.select().from(s.blogPosts).where(eq(s.blogPosts.id, id)).limit(1) : [];
  const [author] = await db.select().from(s.blogAuthors).limit(1);
  const values = {
    slug,
    title,
    excerpt: str(fd, 'excerpt'),
    body,
    categoryId: int(fd, 'categoryId'),
    authorId: current?.authorId ?? author!.id,
    cover: opt(fd, 'cover'),
    coverAlt: opt(fd, 'coverAlt'),
    related: linesToList(str(fd, 'related')),
    readMinutes: estimateReadMinutes(body),
    status,
    publishedAt: status === 'published' ? (current?.publishedAt ?? new Date()) : (current?.publishedAt ?? null),
    metaTitle: opt(fd, 'metaTitle'),
    metaDescription: opt(fd, 'metaDescription'),
  };
  let savedId = id;
  if (id) await db.update(s.blogPosts).set(values).where(eq(s.blogPosts.id, id));
  else savedId = (await db.insert(s.blogPosts).values(values).returning({ id: s.blogPosts.id }))[0]!.id;
  await logAudit(user.id, id ? 'post.updated' : 'post.created', 'post', savedId, `Yazı kaydedildi: ${title} (${status})`);
  refreshSite();
  back(`/admin/blog/${savedId}`, 'ok', status === 'published' ? 'Yazı yayında.' : 'Yazı kaydedildi.');
}

/* ------------------------------------------------------------------ */
/* Projeler ve öncesi / sonrası                                        */
/* ------------------------------------------------------------------ */

async function uploadFrom(fd: FormData, field: string) {
  const f = fd.get(field);
  if (!(f instanceof File) || f.size === 0) return null;
  return storeImage(Buffer.from(await f.arrayBuffer()), 'media');
}

export async function saveProjectAction(fd: FormData): Promise<void> {
  const user = await requireUser('content.manage');
  const idRaw = str(fd, 'id');
  const id = idRaw ? Number(idRaw) : null;
  const path = id ? `/admin/projeler/${id}` : '/admin/projeler/yeni';
  const title = str(fd, 'title');
  const slug = str(fd, 'slug') || slugify(title);
  if (!title) back(path, 'hata', 'Başlık boş olamaz.');
  if (!isValidSlug(slug)) back(path, 'hata', 'Adres (slug) geçersiz.');
  const dup = await db.select({ id: s.projects.id }).from(s.projects).where(and(eq(s.projects.slug, slug), id ? ne(s.projects.id, id) : undefined)).limit(1);
  if (dup.length) back(path, 'hata', 'Bu adres başka bir projede kullanılıyor.');

  const values = {
    slug,
    title,
    kind: str(fd, 'kind') === 'boya' ? 'boya' : 'insaat',
    category: str(fd, 'category'),
    projectType: str(fd, 'projectType'),
    status: str(fd, 'status'),
    region: str(fd, 'region'),
    summary: str(fd, 'summary'),
    about: str(fd, 'about'),
    role: str(fd, 'role'),
    roleTags: linesToList(str(fd, 'roleTags')),
    relatedServices: linesToList(str(fd, 'relatedServices')),
    metaTitle: opt(fd, 'metaTitle'),
    metaDescription: opt(fd, 'metaDescription'),
    publishStatus: str(fd, 'publishStatus') === 'published' ? ('published' as const) : ('draft' as const),
    featured: bool(fd, 'featured'),
    sort: int(fd, 'sort') || 0,
  };
  let savedId = id;
  if (id) await db.update(s.projects).set(values).where(eq(s.projects.id, id));
  else savedId = (await db.insert(s.projects).values(values).returning({ id: s.projects.id }))[0]!.id;

  // Yeni görseller
  const files = fd.getAll('images').filter((f): f is File => f instanceof File && f.size > 0);
  let uploadError = '';
  for (const [i, f] of files.entries()) {
    try {
      const img = await storeImage(Buffer.from(await f.arrayBuffer()), 'media');
      await db.insert(s.projectImages).values({ projectId: savedId!, src: `/media/${img.key}`, alt: str(fd, 'imagesAlt') || `${title} — görsel`, width: img.width, height: img.height, sort: 100 + i });
    } catch (e) {
      uploadError = e instanceof UploadError ? e.message : 'Görsel yüklenemedi.';
    }
  }
  await logAudit(user.id, id ? 'project.updated' : 'project.created', 'project', savedId, `Proje kaydedildi: ${title} (${values.publishStatus})`);
  refreshSite();
  if (uploadError) back(`/admin/projeler/${savedId}`, 'hata', `Proje kaydedildi ancak bir görsel yüklenemedi: ${uploadError}`);
  back(`/admin/projeler/${savedId}`, 'ok', 'Proje kaydedildi.');
}

export async function deleteProjectImageAction(fd: FormData): Promise<void> {
  const user = await requireUser('content.manage');
  const id = int(fd, 'id');
  const [img] = await db.delete(s.projectImages).where(eq(s.projectImages.id, id)).returning();
  if (img?.src.startsWith('/media/')) await deleteStored(img.src.replace('/media/', ''));
  await logAudit(user.id, 'project.image_deleted', 'project', img?.projectId ?? null, 'Proje görseli silindi');
  refreshSite();
  back(`/admin/projeler/${img?.projectId ?? ''}`, 'ok', 'Görsel silindi.');
}

export async function saveComparisonAction(fd: FormData): Promise<void> {
  const user = await requireUser('content.manage');
  const title = str(fd, 'title');
  if (!title) back('/admin/projeler', 'hata', 'Başlık gerekli.');
  let before, after;
  try {
    [before, after] = await Promise.all([uploadFrom(fd, 'before'), uploadFrom(fd, 'after')]);
  } catch (e) {
    back('/admin/projeler', 'hata', e instanceof UploadError ? e.message : 'Görsel yüklenemedi.');
  }
  if (!before || !after) back('/admin/projeler', 'hata', 'Öncesi ve sonrası görsellerinin ikisi de gerekli.');
  await db.insert(s.comparisons).values({ title, caption: str(fd, 'caption'), kind: str(fd, 'kind') === 'insaat' ? 'insaat' : 'boya', beforeSrc: `/media/${before.key}`, afterSrc: `/media/${after.key}`, published: false });
  await logAudit(user.id, 'comparison.created', 'comparison', null, `Öncesi/sonrası eklendi: ${title} (taslak)`);
  back('/admin/projeler', 'ok', 'Karşılaştırma taslak olarak eklendi. Görsellerin aynı işe ait olduğunu doğruladıktan sonra yayınlayın.');
}

export async function toggleComparisonAction(fd: FormData): Promise<void> {
  const user = await requireUser('content.manage');
  const id = int(fd, 'id');
  if (str(fd, 'intent') === 'delete') {
    const [row] = await db.delete(s.comparisons).where(eq(s.comparisons.id, id)).returning();
    for (const src of [row?.beforeSrc, row?.afterSrc]) if (src?.startsWith('/media/')) await deleteStored(src.replace('/media/', ''));
    await logAudit(user.id, 'comparison.deleted', 'comparison', id, `Öncesi/sonrası silindi: ${row?.title}`);
  } else {
    const [row] = await db.update(s.comparisons).set({ published: sql`not ${s.comparisons.published}` }).where(eq(s.comparisons.id, id)).returning();
    await logAudit(user.id, 'comparison.toggled', 'comparison', id, `${row?.title}: ${row?.published ? 'yayında' : 'taslak'}`);
  }
  refreshSite();
  back('/admin/projeler', 'ok', 'Güncellendi.');
}

/* ------------------------------------------------------------------ */
/* SSS                                                                 */
/* ------------------------------------------------------------------ */

export async function saveFaqAction(fd: FormData): Promise<void> {
  const user = await requireUser('content.manage');
  const idRaw = str(fd, 'id');
  const scope = str(fd, 'scope');
  const path = `/admin/sss?sayfa=${scope}`;
  if (str(fd, 'intent') === 'delete' && idRaw) {
    await db.delete(s.faqs).where(eq(s.faqs.id, Number(idRaw)));
    await logAudit(user.id, 'faq.deleted', 'faq', idRaw, 'SSS silindi');
  } else {
    const values = { scope, question: str(fd, 'question'), answer: str(fd, 'answer'), sort: int(fd, 'sort') || 0, active: bool(fd, 'active') };
    if (!values.question || !values.answer) back(path, 'hata', 'Soru ve cevap boş olamaz.');
    if (idRaw) await db.update(s.faqs).set(values).where(eq(s.faqs.id, Number(idRaw)));
    else await db.insert(s.faqs).values(values);
    await logAudit(user.id, 'faq.saved', 'faq', idRaw || null, `SSS kaydedildi (${scope}): ${values.question.slice(0, 60)}`);
  }
  refreshSite();
  back(path, 'ok', 'Kaydedildi.');
}

/* ------------------------------------------------------------------ */
/* SEO ve yönlendirmeler                                               */
/* ------------------------------------------------------------------ */

export async function saveSeoAction(fd: FormData): Promise<void> {
  const user = await requireUser('seo.manage');
  const path = normalizePath(str(fd, 'path'));
  if (str(fd, 'intent') === 'delete') {
    await db.delete(s.seoEntries).where(eq(s.seoEntries.path, path));
    await logAudit(user.id, 'seo.deleted', 'seo', path, `SEO geçersiz kılması kaldırıldı: ${path}`);
  } else {
    const canonical = opt(fd, 'canonical');
    if (canonical && !/^https:\/\//.test(canonical)) back('/admin/seo', 'hata', 'Canonical mutlak bir https adresi olmalı.');
    const values = { title: opt(fd, 'title'), description: opt(fd, 'description'), canonical, ogImage: opt(fd, 'ogImage'), noindex: bool(fd, 'noindex'), excludeFromSitemap: bool(fd, 'excludeFromSitemap') };
    await db.insert(s.seoEntries).values({ path, ...values }).onConflictDoUpdate({ target: s.seoEntries.path, set: values });
    await logAudit(user.id, 'seo.saved', 'seo', path, `SEO ayarı kaydedildi: ${path}${values.noindex ? ' (noindex)' : ''}`);
  }
  refreshSite();
  back('/admin/seo', 'ok', 'SEO ayarı kaydedildi.');
}

export async function saveRedirectAction(fd: FormData): Promise<void> {
  const user = await requireUser('seo.manage');
  const intent = str(fd, 'intent');
  if (intent === 'delete' || intent === 'toggle') {
    const id = int(fd, 'id');
    if (intent === 'delete') await db.delete(s.redirectRules).where(eq(s.redirectRules.id, id));
    else await db.update(s.redirectRules).set({ active: sql`not ${s.redirectRules.active}` }).where(eq(s.redirectRules.id, id));
    await logAudit(user.id, `redirect.${intent}`, 'redirect', id, `Yönlendirme ${intent === 'delete' ? 'silindi' : 'durumu değişti'}`);
    back('/admin/yonlendirmeler', 'ok', 'Güncellendi.');
  }
  const source = normalizePath(str(fd, 'source'));
  const destRaw = str(fd, 'destination');
  const destination = /^https?:\/\//i.test(destRaw) ? destRaw : normalizePath(destRaw);
  const existing = await db.select().from(s.redirectRules);
  // Kod içindeki sabit yönlendirmeler de zincir denetimine dahil edilir.
  const all = [...existing, ...staticRedirects.filter((r) => !r.source.includes(':'))];
  const error = validateRedirect({ source, destination }, all);
  if (error) back('/admin/yonlendirmeler', 'hata', error);
  const [row] = await db.insert(s.redirectRules).values({ source, destination, statusCode: str(fd, 'statusCode') === '307' ? 307 : 308 }).returning();
  await logAudit(user.id, 'redirect.created', 'redirect', row!.id, `${source} → ${destination}`);
  back('/admin/yonlendirmeler', 'ok', 'Yönlendirme eklendi.');
}

/* ------------------------------------------------------------------ */
/* Medya                                                               */
/* ------------------------------------------------------------------ */

export async function uploadMediaAction(fd: FormData): Promise<void> {
  const user = await requireUser('media.manage');
  const files = fd.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) back('/admin/medya', 'hata', 'Dosya seçin.');
  const alt = str(fd, 'alt');
  if (!alt) back('/admin/medya', 'hata', 'Alternatif metin gerekli (görseli tanımlayan kısa açıklama).');
  let count = 0;
  let error = '';
  for (const f of files.slice(0, 20)) {
    try {
      const img = await storeImage(Buffer.from(await f.arrayBuffer()), 'media');
      await db.insert(s.mediaAssets).values({ storageKey: img.key, url: `/media/${img.key}`, filename: slugify(f.name.replace(/\.[^.]+$/, '')) || 'gorsel', alt, category: str(fd, 'category') || 'genel', mime: img.mime, size: img.size, width: img.width, height: img.height, uploadedBy: user.id });
      count++;
    } catch (e) {
      error = e instanceof UploadError ? e.message : 'Yükleme hatası.';
    }
  }
  await logAudit(user.id, 'media.uploaded', 'media', null, `${count} görsel yüklendi`);
  if (error) back('/admin/medya', 'hata', `${count} görsel yüklendi; bir dosya reddedildi: ${error}`);
  back('/admin/medya', 'ok', `${count} görsel yüklendi.`);
}

export async function updateMediaAction(fd: FormData): Promise<void> {
  const user = await requireUser('media.manage');
  const id = int(fd, 'id');
  if (str(fd, 'intent') === 'delete') {
    const [row] = await db.delete(s.mediaAssets).where(eq(s.mediaAssets.id, id)).returning();
    if (row) await deleteStored(row.storageKey);
    await logAudit(user.id, 'media.deleted', 'media', id, `Görsel silindi: ${row?.filename}`);
  } else {
    await db.update(s.mediaAssets).set({ alt: str(fd, 'alt'), category: str(fd, 'category') || 'genel' }).where(eq(s.mediaAssets.id, id));
  }
  back('/admin/medya', 'ok', 'Güncellendi.');
}

/* ------------------------------------------------------------------ */
/* Genel ayarlar                                                       */
/* ------------------------------------------------------------------ */

export async function saveSettingsAction(fd: FormData): Promise<void> {
  const user = await requireUser('settings.manage');
  const phone = normalizeTrPhone(str(fd, 'phone'));
  if (!phone) back('/admin/ayarlar', 'hata', 'Telefon numarası geçersiz.');
  const waRaw = str(fd, 'whatsapp');
  const wa = waRaw ? normalizeTrPhone(waRaw) : '';
  if (waRaw && !wa) back('/admin/ayarlar', 'hata', 'WhatsApp numarası geçersiz.');
  const emails = linesToList(str(fd, 'emails'));
  if (!emails.length || emails.some((e) => !z.email().safeParse(e).success)) back('/admin/ayarlar', 'hata', 'En az bir geçerli e-posta adresi girin (her satıra bir adres).');
  const ga = str(fd, 'ga4Id');
  if (ga && !/^G-[A-Z0-9]{6,12}$/.test(ga)) back('/admin/ayarlar', 'hata', 'GA4 ölçüm kimliği G-XXXXXXXXXX biçiminde olmalı.');
  const social = Object.fromEntries(Object.keys(defaultSettings.social).map((k) => [k, str(fd, `social_${k}`)])) as SiteSettings['social'];
  if (Object.values(social).some((u) => u && !/^https:\/\//.test(u))) back('/admin/ayarlar', 'hata', 'Sosyal medya bağlantıları https:// ile başlamalı.');
  const year = str(fd, 'foundingYear');

  const next: SiteSettings = {
    company: { name: str(fd, 'companyName') || defaultSettings.company.name, legalName: str(fd, 'legalName'), foundingYear: year ? Number(year) : null, description: str(fd, 'companyDescription') },
    contact: { phone, whatsapp: wa ? wa.replace('+', '') : '', emails },
    address: { district: str(fd, 'district'), city: str(fd, 'city') || 'İstanbul', country: 'TR', street: str(fd, 'street'), showStreet: bool(fd, 'showStreet') },
    hours: defaultSettings.hours.map((h, i) => ({ ...h, opens: opt(fd, `hours_${i}_opens`), closes: opt(fd, `hours_${i}_closes`) })),
    social,
    analytics: { ga4Id: ga, gscVerification: str(fd, 'gscVerification') },
    announcement: str(fd, 'announcement'),
  };
  for (const [key, value] of Object.entries(next)) {
    await db.insert(s.siteSettings).values({ key, value }).onConflictDoUpdate({ target: s.siteSettings.key, set: { value, updatedAt: new Date() } });
  }
  await logAudit(user.id, 'settings.updated', 'settings', null, 'Genel ayarlar güncellendi');
  refreshSite();
  back('/admin/ayarlar', 'ok', 'Ayarlar kaydedildi.');
}
