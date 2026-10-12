import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

const createdAt = timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = timestamp('updated_at', { withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());

/* ------------------------------------------------------------------ */
/* Kimlik ve yetki                                                     */
/* ------------------------------------------------------------------ */

export const roleEnum = pgEnum('role', ['admin', 'editor']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull().default('editor'),
  active: boolean('active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt,
  updatedAt,
});

export const sessions = pgTable(
  'sessions',
  {
    /** Çerezdeki rastgele belirtecin SHA-256 özeti; ham belirteç saklanmaz. */
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    userAgent: text('user_agent'),
    createdAt,
  },
  (t) => [index('sessions_user_idx').on(t.userId), index('sessions_expires_idx').on(t.expiresAt)],
);

/** Giriş ve form gönderimleri için sabit pencereli deneme sayacı. */
export const rateLimits = pgTable(
  'rate_limits',
  {
    key: varchar('key', { length: 160 }).notNull(),
    windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
    count: integer('count').notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] })],
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 80 }).notNull(),
    entity: varchar('entity', { length: 60 }).notNull(),
    entityId: varchar('entity_id', { length: 80 }),
    summary: text('summary').notNull(),
    meta: jsonb('meta').$type<Record<string, unknown>>(),
    createdAt,
  },
  (t) => [index('audit_created_idx').on(t.createdAt), index('audit_entity_idx').on(t.entity, t.entityId)],
);

/* ------------------------------------------------------------------ */
/* Site ayarları                                                       */
/* ------------------------------------------------------------------ */

export const siteSettings = pgTable('site_settings', {
  key: varchar('key', { length: 60 }).primaryKey(),
  value: jsonb('value').$type<unknown>().notNull(),
  updatedAt,
});

/* ------------------------------------------------------------------ */
/* Hizmetler                                                           */
/* ------------------------------------------------------------------ */

export const publishEnum = pgEnum('publish_status', ['draft', 'published']);

export const serviceCategories = pgTable('service_categories', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  description: text('description').notNull().default(''),
  sort: integer('sort').notNull().default(0),
});

export type ServiceStep = { title: string; desc: string };
export type QA = { q: string; a: string };

export const services = pgTable(
  'services',
  {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 120 }).notNull().unique(),
    categoryId: integer('category_id')
      .notNull()
      .references(() => serviceCategories.id),
    title: varchar('title', { length: 160 }).notNull(),
    tagline: text('tagline').notNull().default(''),
    overview: text('overview').notNull().default(''),
    intro: text('intro').notNull().default(''),
    body: text('body').notNull().default(''),
    scope: jsonb('scope').$type<string[]>().notNull().default([]),
    steps: jsonb('steps').$type<ServiceStep[]>().notNull().default([]),
    materials: jsonb('materials').$type<string[]>().notNull().default([]),
    benefits: jsonb('benefits').$type<string[]>().notNull().default([]),
    projectTypes: jsonb('project_types').$type<string[]>().notNull().default([]),
    faqs: jsonb('faqs').$type<QA[]>().notNull().default([]),
    related: jsonb('related').$type<string[]>().notNull().default([]),
    image: varchar('image', { length: 255 }),
    imageAlt: varchar('image_alt', { length: 255 }),
    metaTitle: varchar('meta_title', { length: 160 }),
    metaDescription: text('meta_description'),
    status: publishEnum('status').notNull().default('published'),
    sort: integer('sort').notNull().default(0),
    createdAt,
    updatedAt,
  },
  (t) => [index('services_category_idx').on(t.categoryId)],
);

/* ------------------------------------------------------------------ */
/* Boya paketleri ve fiyatlar                                          */
/* ------------------------------------------------------------------ */

/** included: true = dahil, false = dahil değil, null = keşifte netleşir (doğrulanmamış). */
export type ScopeItem = { label: string; included: boolean | null; note?: string };

export const paintingPackages = pgTable('painting_packages', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  roomType: varchar('room_type', { length: 10 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  /** Tam TL cinsinden ilan fiyatı (kuruş kullanılmaz). */
  price: integer('price').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('TRY'),
  active: boolean('active').notNull().default(true),
  summary: text('summary').notNull().default(''),
  description: text('description').notNull().default(''),
  scopeItems: jsonb('scope_items').$type<ScopeItem[]>().notNull().default([]),
  scopeNote: text('scope_note').notNull().default(''),
  /** Örn. "KDV dahildir" — boşsa sitede KDV ifadesi gösterilmez. */
  vatNote: varchar('vat_note', { length: 120 }).notNull().default(''),
  validUntil: date('valid_until'),
  faqs: jsonb('faqs').$type<QA[]>().notNull().default([]),
  body: text('body').notNull().default(''),
  metaTitle: varchar('meta_title', { length: 160 }),
  metaDescription: text('meta_description'),
  sort: integer('sort').notNull().default(0),
  createdAt,
  updatedAt,
});

export const packagePriceHistory = pgTable(
  'package_price_history',
  {
    id: serial('id').primaryKey(),
    packageId: integer('package_id')
      .notNull()
      .references(() => paintingPackages.id, { onDelete: 'cascade' }),
    oldPrice: integer('old_price'),
    newPrice: integer('new_price').notNull(),
    changedBy: integer('changed_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt,
  },
  (t) => [index('price_history_package_idx').on(t.packageId, t.createdAt)],
);

/* ------------------------------------------------------------------ */
/* Hizmet bölgeleri                                                    */
/* ------------------------------------------------------------------ */

export const areaTierEnum = pgEnum('area_tier', ['primary', 'secondary']);
export type AreaSection = { heading: string; body: string };

export const serviceAreas = pgTable('service_areas', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  name: varchar('name', { length: 80 }).notNull().unique(),
  tier: areaTierEnum('tier').notNull().default('secondary'),
  /** Aktif değilse hiçbir listede, formda, schema'da ve sitemap'te yer almaz. */
  active: boolean('active').notNull().default(false),
  /** Özgün içerik onaylandığında lokasyon sayfası yayınlanır. */
  pagePublished: boolean('page_published').notNull().default(false),
  isHub: boolean('is_hub').notNull().default(false),
  h1: varchar('h1', { length: 160 }).notNull().default(''),
  lead: text('lead').notNull().default(''),
  summary: text('summary').notNull().default(''),
  sections: jsonb('sections').$type<AreaSection[]>().notNull().default([]),
  faqs: jsonb('faqs').$type<QA[]>().notNull().default([]),
  metaTitle: varchar('meta_title', { length: 160 }),
  metaDescription: text('meta_description'),
  sort: integer('sort').notNull().default(0),
  createdAt,
  updatedAt,
});

export const neighborhoods = pgTable(
  'neighborhoods',
  {
    id: serial('id').primaryKey(),
    areaId: integer('area_id')
      .notNull()
      .references(() => serviceAreas.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 80 }).notNull(),
    active: boolean('active').notNull().default(true),
    sort: integer('sort').notNull().default(0),
  },
  (t) => [uniqueIndex('neighborhood_area_name_idx').on(t.areaId, t.name)],
);

/* ------------------------------------------------------------------ */
/* Teklif talepleri (lead)                                             */
/* ------------------------------------------------------------------ */

export const leadStatusEnum = pgEnum('lead_status', [
  'new',
  'contacted',
  'survey_pending',
  'quote_sent',
  'won',
  'lost',
  'completed',
]);

export const leads = pgTable(
  'leads',
  {
    id: serial('id').primaryKey(),
    ref: varchar('ref', { length: 20 }).notNull().unique(),
    kind: varchar('kind', { length: 20 }).notNull().default('quote'),
    serviceType: varchar('service_type', { length: 60 }).notNull(),
    roomType: varchar('room_type', { length: 20 }),
    packageId: integer('package_id').references(() => paintingPackages.id, { onDelete: 'set null' }),
    /** Talep anında ilan edilen paket fiyatı; onaylanan özel iş teklifi ayrıca tutulur. */
    listedPrice: integer('listed_price'),
    quotedPrice: integer('quoted_price'),
    scopeOptions: jsonb('scope_options').$type<string[]>().notNull().default([]),
    propertyState: varchar('property_state', { length: 30 }),
    city: varchar('city', { length: 40 }).notNull().default('İstanbul'),
    district: varchar('district', { length: 80 }),
    neighborhood: varchar('neighborhood', { length: 120 }),
    message: text('message'),
    name: varchar('name', { length: 120 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    email: varchar('email', { length: 255 }),
    contactPreference: varchar('contact_preference', { length: 20 }),
    contactTime: varchar('contact_time', { length: 60 }),
    status: leadStatusEnum('status').notNull().default('new'),
    landingPage: varchar('landing_page', { length: 255 }),
    referrer: varchar('referrer', { length: 255 }),
    utmSource: varchar('utm_source', { length: 120 }),
    utmMedium: varchar('utm_medium', { length: 120 }),
    utmCampaign: varchar('utm_campaign', { length: 120 }),
    ipHash: varchar('ip_hash', { length: 64 }),
    createdAt,
    updatedAt,
    /** KVKK silme talebi: kişisel alanlar anonimleştirildiğinde dolar. */
    anonymizedAt: timestamp('anonymized_at', { withTimezone: true }),
  },
  (t) => [
    index('leads_status_idx').on(t.status),
    index('leads_created_idx').on(t.createdAt),
    index('leads_district_idx').on(t.district),
    index('leads_service_idx').on(t.serviceType),
    index('leads_phone_idx').on(t.phone),
  ],
);

export const leadAttachments = pgTable(
  'lead_attachments',
  {
    id: serial('id').primaryKey(),
    leadId: integer('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'cascade' }),
    storageKey: varchar('storage_key', { length: 255 }).notNull(),
    mime: varchar('mime', { length: 40 }).notNull(),
    size: integer('size').notNull(),
    width: integer('width'),
    height: integer('height'),
    createdAt,
  },
  (t) => [index('lead_attachments_lead_idx').on(t.leadId)],
);

export const leadStatusHistory = pgTable(
  'lead_status_history',
  {
    id: serial('id').primaryKey(),
    leadId: integer('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'cascade' }),
    fromStatus: leadStatusEnum('from_status'),
    toStatus: leadStatusEnum('to_status').notNull(),
    changedBy: integer('changed_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt,
  },
  (t) => [index('lead_status_history_lead_idx').on(t.leadId)],
);

export const leadNotes = pgTable(
  'lead_notes',
  {
    id: serial('id').primaryKey(),
    leadId: integer('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'cascade' }),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    body: text('body').notNull(),
    createdAt,
  },
  (t) => [index('lead_notes_lead_idx').on(t.leadId)],
);

export const leadConsents = pgTable(
  'lead_consents',
  {
    id: serial('id').primaryKey(),
    leadId: integer('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'cascade' }),
    /** kvkk_notice: aydınlatma metni okundu; marketing: ticari ileti açık rızası (isteğe bağlı). */
    type: varchar('type', { length: 30 }).notNull(),
    granted: boolean('granted').notNull(),
    textVersion: varchar('text_version', { length: 20 }).notNull(),
    createdAt,
  },
  (t) => [index('lead_consents_lead_idx').on(t.leadId)],
);

/* ------------------------------------------------------------------ */
/* Projeler                                                            */
/* ------------------------------------------------------------------ */

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  title: varchar('title', { length: 200 }).notNull(),
  /** insaat: kurumsal inşaat portföyü; boya: ev boyama / tadilat portföyü */
  kind: varchar('kind', { length: 20 }).notNull().default('insaat'),
  category: varchar('category', { length: 120 }).notNull().default(''),
  projectType: varchar('project_type', { length: 160 }).notNull().default(''),
  status: varchar('status', { length: 60 }).notNull().default(''),
  region: varchar('region', { length: 120 }).notNull().default(''),
  summary: text('summary').notNull().default(''),
  about: text('about').notNull().default(''),
  role: text('role').notNull().default(''),
  roleTags: jsonb('role_tags').$type<string[]>().notNull().default([]),
  relatedServices: jsonb('related_services').$type<string[]>().notNull().default([]),
  metaTitle: varchar('meta_title', { length: 200 }),
  metaDescription: text('meta_description'),
  publishStatus: publishEnum('publish_status').notNull().default('published'),
  featured: boolean('featured').notNull().default(false),
  sort: integer('sort').notNull().default(0),
  createdAt,
  updatedAt,
});

export const projectImages = pgTable(
  'project_images',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    src: varchar('src', { length: 255 }).notNull(),
    alt: varchar('alt', { length: 255 }).notNull().default(''),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    sort: integer('sort').notNull().default(0),
  },
  (t) => [index('project_images_project_idx').on(t.projectId, t.sort)],
);

/** Öncesi / sonrası karşılaştırmaları: yalnızca gerçek ve doğrulanmış çiftler yayınlanır. */
export const comparisons = pgTable('comparisons', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 160 }).notNull(),
  caption: text('caption').notNull().default(''),
  beforeSrc: varchar('before_src', { length: 255 }).notNull(),
  afterSrc: varchar('after_src', { length: 255 }).notNull(),
  kind: varchar('kind', { length: 20 }).notNull().default('boya'),
  published: boolean('published').notNull().default(false),
  sort: integer('sort').notNull().default(0),
  createdAt,
});

/* ------------------------------------------------------------------ */
/* Blog                                                                */
/* ------------------------------------------------------------------ */

export const postStatusEnum = pgEnum('post_status', ['draft', 'review', 'published', 'archived']);

export const blogCategories = pgTable('blog_categories', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  description: text('description').notNull().default(''),
  sort: integer('sort').notNull().default(0),
});

export const blogAuthors = pgTable('blog_authors', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  bio: text('bio').notNull().default(''),
});

export const blogPosts = pgTable(
  'blog_posts',
  {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 160 }).notNull().unique(),
    title: varchar('title', { length: 200 }).notNull(),
    excerpt: text('excerpt').notNull().default(''),
    body: text('body').notNull().default(''),
    categoryId: integer('category_id')
      .notNull()
      .references(() => blogCategories.id),
    authorId: integer('author_id')
      .notNull()
      .references(() => blogAuthors.id),
    cover: varchar('cover', { length: 255 }),
    coverAlt: varchar('cover_alt', { length: 255 }),
    related: jsonb('related').$type<string[]>().notNull().default([]),
    readMinutes: integer('read_minutes').notNull().default(5),
    status: postStatusEnum('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    metaTitle: varchar('meta_title', { length: 200 }),
    metaDescription: text('meta_description'),
    createdAt,
    updatedAt,
  },
  (t) => [index('posts_status_published_idx').on(t.status, t.publishedAt), index('posts_category_idx').on(t.categoryId)],
);

/* ------------------------------------------------------------------ */
/* SSS, medya, SEO, yönlendirme                                        */
/* ------------------------------------------------------------------ */

export const faqs = pgTable(
  'faqs',
  {
    id: serial('id').primaryKey(),
    /** home | ev-boyama | boya-fiyatlari | teklif gibi sayfa anahtarları */
    scope: varchar('scope', { length: 60 }).notNull(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    sort: integer('sort').notNull().default(0),
    active: boolean('active').notNull().default(true),
    updatedAt,
  },
  (t) => [index('faqs_scope_idx').on(t.scope, t.sort)],
);

export const mediaAssets = pgTable('media_assets', {
  id: serial('id').primaryKey(),
  storageKey: varchar('storage_key', { length: 255 }).notNull().unique(),
  url: varchar('url', { length: 255 }).notNull(),
  filename: varchar('filename', { length: 200 }).notNull(),
  alt: varchar('alt', { length: 255 }).notNull().default(''),
  category: varchar('category', { length: 60 }).notNull().default('genel'),
  mime: varchar('mime', { length: 40 }).notNull(),
  size: integer('size').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  uploadedBy: integer('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt,
});

/** Sayfa bazlı elle SEO geçersiz kılmaları; boş alanlar merkezi şablondan üretilir. */
export const seoEntries = pgTable('seo_entries', {
  id: serial('id').primaryKey(),
  path: varchar('path', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 200 }),
  description: text('description'),
  canonical: varchar('canonical', { length: 255 }),
  ogImage: varchar('og_image', { length: 255 }),
  noindex: boolean('noindex').notNull().default(false),
  excludeFromSitemap: boolean('exclude_from_sitemap').notNull().default(false),
  updatedAt,
});

export const redirectRules = pgTable('redirect_rules', {
  id: serial('id').primaryKey(),
  source: varchar('source', { length: 255 }).notNull().unique(),
  destination: varchar('destination', { length: 255 }).notNull(),
  /** 308 kalıcı, 307 geçici */
  statusCode: integer('status_code').notNull().default(308),
  active: boolean('active').notNull().default(true),
  hits: integer('hits').notNull().default(0),
  createdAt,
});

/* ------------------------------------------------------------------ */
/* İlişkiler                                                           */
/* ------------------------------------------------------------------ */

export const servicesRelations = relations(services, ({ one }) => ({
  category: one(serviceCategories, { fields: [services.categoryId], references: [serviceCategories.id] }),
}));
export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({ services: many(services) }));
export const areasRelations = relations(serviceAreas, ({ many }) => ({ neighborhoods: many(neighborhoods) }));
export const neighborhoodsRelations = relations(neighborhoods, ({ one }) => ({
  area: one(serviceAreas, { fields: [neighborhoods.areaId], references: [serviceAreas.id] }),
}));
export const projectsRelations = relations(projects, ({ many }) => ({ images: many(projectImages) }));
export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, { fields: [projectImages.projectId], references: [projects.id] }),
}));
export const postsRelations = relations(blogPosts, ({ one }) => ({
  category: one(blogCategories, { fields: [blogPosts.categoryId], references: [blogCategories.id] }),
  author: one(blogAuthors, { fields: [blogPosts.authorId], references: [blogAuthors.id] }),
}));
export const leadsRelations = relations(leads, ({ many, one }) => ({
  attachments: many(leadAttachments),
  history: many(leadStatusHistory),
  notes: many(leadNotes),
  consents: many(leadConsents),
  package: one(paintingPackages, { fields: [leads.packageId], references: [paintingPackages.id] }),
}));
export const leadAttachmentsRelations = relations(leadAttachments, ({ one }) => ({
  lead: one(leads, { fields: [leadAttachments.leadId], references: [leads.id] }),
}));
export const leadHistoryRelations = relations(leadStatusHistory, ({ one }) => ({
  lead: one(leads, { fields: [leadStatusHistory.leadId], references: [leads.id] }),
  user: one(users, { fields: [leadStatusHistory.changedBy], references: [users.id] }),
}));
export const leadNotesRelations = relations(leadNotes, ({ one }) => ({
  lead: one(leads, { fields: [leadNotes.leadId], references: [leads.id] }),
  user: one(users, { fields: [leadNotes.userId], references: [users.id] }),
}));
export const leadConsentsRelations = relations(leadConsents, ({ one }) => ({
  lead: one(leads, { fields: [leadConsents.leadId], references: [leads.id] }),
}));
export const packagesRelations = relations(paintingPackages, ({ many }) => ({ history: many(packagePriceHistory) }));
export const priceHistoryRelations = relations(packagePriceHistory, ({ one }) => ({
  package: one(paintingPackages, { fields: [packagePriceHistory.packageId], references: [paintingPackages.id] }),
  user: one(users, { fields: [packagePriceHistory.changedBy], references: [users.id] }),
}));
export const auditRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

export type LeadStatus = (typeof leadStatusEnum.enumValues)[number];
export type PostStatus = (typeof postStatusEnum.enumValues)[number];
