CREATE TYPE "public"."area_tier" AS ENUM('primary', 'secondary');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'survey_pending', 'quote_sent', 'won', 'lost', 'completed');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'review', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."publish_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'editor');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" varchar(80) NOT NULL,
	"entity" varchar(60) NOT NULL,
	"entity_id" varchar(80),
	"summary" text NOT NULL,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_authors" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	CONSTRAINT "blog_authors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" varchar(200) NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"category_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"cover" varchar(255),
	"cover_alt" varchar(255),
	"related" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"read_minutes" integer DEFAULT 5 NOT NULL,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"meta_title" varchar(200),
	"meta_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "comparisons" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(160) NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"before_src" varchar(255) NOT NULL,
	"after_src" varchar(255) NOT NULL,
	"kind" varchar(20) DEFAULT 'boya' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"scope" varchar(60) NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"storage_key" varchar(255) NOT NULL,
	"mime" varchar(40) NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_consents" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"type" varchar(30) NOT NULL,
	"granted" boolean NOT NULL,
	"text_version" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"user_id" integer,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"from_status" "lead_status",
	"to_status" "lead_status" NOT NULL,
	"changed_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref" varchar(20) NOT NULL,
	"kind" varchar(20) DEFAULT 'quote' NOT NULL,
	"service_type" varchar(60) NOT NULL,
	"room_type" varchar(20),
	"package_id" integer,
	"listed_price" integer,
	"quoted_price" integer,
	"scope_options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"property_state" varchar(30),
	"city" varchar(40) DEFAULT 'İstanbul' NOT NULL,
	"district" varchar(80),
	"neighborhood" varchar(120),
	"message" text,
	"name" varchar(120) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"contact_preference" varchar(20),
	"contact_time" varchar(60),
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"landing_page" varchar(255),
	"referrer" varchar(255),
	"utm_source" varchar(120),
	"utm_medium" varchar(120),
	"utm_campaign" varchar(120),
	"ip_hash" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"anonymized_at" timestamp with time zone,
	CONSTRAINT "leads_ref_unique" UNIQUE("ref")
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"storage_key" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"filename" varchar(200) NOT NULL,
	"alt" varchar(255) DEFAULT '' NOT NULL,
	"category" varchar(60) DEFAULT 'genel' NOT NULL,
	"mime" varchar(40) NOT NULL,
	"size" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"uploaded_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "neighborhoods" (
	"id" serial PRIMARY KEY NOT NULL,
	"area_id" integer NOT NULL,
	"name" varchar(80) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "package_price_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" integer NOT NULL,
	"old_price" integer,
	"new_price" integer NOT NULL,
	"changed_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "painting_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"room_type" varchar(10) NOT NULL,
	"name" varchar(120) NOT NULL,
	"price" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'TRY' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"scope_items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"scope_note" text DEFAULT '' NOT NULL,
	"vat_note" varchar(120) DEFAULT '' NOT NULL,
	"valid_until" date,
	"faqs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"meta_title" varchar(160),
	"meta_description" text,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "painting_packages_slug_unique" UNIQUE("slug"),
	CONSTRAINT "painting_packages_room_type_unique" UNIQUE("room_type")
);
--> statement-breakpoint
CREATE TABLE "project_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"src" varchar(255) NOT NULL,
	"alt" varchar(255) DEFAULT '' NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" varchar(200) NOT NULL,
	"kind" varchar(20) DEFAULT 'insaat' NOT NULL,
	"category" varchar(120) DEFAULT '' NOT NULL,
	"project_type" varchar(160) DEFAULT '' NOT NULL,
	"status" varchar(60) DEFAULT '' NOT NULL,
	"region" varchar(120) DEFAULT '' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"about" text DEFAULT '' NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"role_tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"related_services" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"meta_title" varchar(200),
	"meta_description" text,
	"publish_status" "publish_status" DEFAULT 'published' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" varchar(160) NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "rate_limits_key_window_start_pk" PRIMARY KEY("key","window_start")
);
--> statement-breakpoint
CREATE TABLE "redirect_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" varchar(255) NOT NULL,
	"destination" varchar(255) NOT NULL,
	"status_code" integer DEFAULT 308 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "redirect_rules_source_unique" UNIQUE("source")
);
--> statement-breakpoint
CREATE TABLE "seo_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" varchar(255) NOT NULL,
	"title" varchar(200),
	"description" text,
	"canonical" varchar(255),
	"og_image" varchar(255),
	"noindex" boolean DEFAULT false NOT NULL,
	"exclude_from_sitemap" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "seo_entries_path_unique" UNIQUE("path")
);
--> statement-breakpoint
CREATE TABLE "service_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(80) NOT NULL,
	"tier" "area_tier" DEFAULT 'secondary' NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"page_published" boolean DEFAULT false NOT NULL,
	"is_hub" boolean DEFAULT false NOT NULL,
	"h1" varchar(160) DEFAULT '' NOT NULL,
	"lead" text DEFAULT '' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"faqs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"meta_title" varchar(160),
	"meta_description" text,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_areas_slug_unique" UNIQUE("slug"),
	CONSTRAINT "service_areas_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "service_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "service_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"category_id" integer NOT NULL,
	"title" varchar(160) NOT NULL,
	"tagline" text DEFAULT '' NOT NULL,
	"overview" text DEFAULT '' NOT NULL,
	"intro" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"scope" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"materials" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"benefits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"project_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"faqs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"related" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image" varchar(255),
	"image_alt" varchar(255),
	"meta_title" varchar(160),
	"meta_description" text,
	"status" "publish_status" DEFAULT 'published' NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar(60) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(120) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'editor' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_blog_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."blog_authors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_attachments" ADD CONSTRAINT "lead_attachments_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_consents" ADD CONSTRAINT "lead_consents_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_status_history" ADD CONSTRAINT "lead_status_history_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_status_history" ADD CONSTRAINT "lead_status_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_package_id_painting_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."painting_packages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "neighborhoods" ADD CONSTRAINT "neighborhoods_area_id_service_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."service_areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_price_history" ADD CONSTRAINT "package_price_history_package_id_painting_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."painting_packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_price_history" ADD CONSTRAINT "package_price_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "posts_status_published_idx" ON "blog_posts" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "posts_category_idx" ON "blog_posts" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "faqs_scope_idx" ON "faqs" USING btree ("scope","sort");--> statement-breakpoint
CREATE INDEX "lead_attachments_lead_idx" ON "lead_attachments" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_consents_lead_idx" ON "lead_consents" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_notes_lead_idx" ON "lead_notes" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_status_history_lead_idx" ON "lead_status_history" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_created_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_district_idx" ON "leads" USING btree ("district");--> statement-breakpoint
CREATE INDEX "leads_service_idx" ON "leads" USING btree ("service_type");--> statement-breakpoint
CREATE INDEX "leads_phone_idx" ON "leads" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "neighborhood_area_name_idx" ON "neighborhoods" USING btree ("area_id","name");--> statement-breakpoint
CREATE INDEX "price_history_package_idx" ON "package_price_history" USING btree ("package_id","created_at");--> statement-breakpoint
CREATE INDEX "project_images_project_idx" ON "project_images" USING btree ("project_id","sort");--> statement-breakpoint
CREATE INDEX "services_category_idx" ON "services" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_idx" ON "sessions" USING btree ("expires_at");