import { ArrowRight, ArrowUpRight, Check, CircleHelp, Minus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { buttonClass } from '@/components/ui/button';
import { Badge } from '@/components/ui/primitives';
import type { ScopeItem } from '@/db/schema';
import { cn } from '@/lib/cn';
import { formatDate, formatPrice } from '@/lib/format';

export type PackageCardData = {
  slug: string;
  roomType: string;
  name: string;
  price: number;
  currency: string;
  summary: string;
  vatNote: string;
  validUntil?: string | null;
};

const idx = (i: number) => ({ '--reveal-index': i }) as CSSProperties;

/** Fiyat kartı: fiyat her zaman merkezi paket verisinden gelir. */
export function PriceCard({ pkg, index = 0, featured }: { pkg: PackageCardData; index?: number; featured?: boolean }) {
  return (
    <article
      data-reveal
      style={idx(index)}
      data-testid={`price-card-${pkg.slug}`}
      className={cn(
        'group relative flex flex-col rounded-(--radius-xl) border p-7 transition-[transform,box-shadow,border-color] duration-(--duration-card) ease-(--ease-out-soft) hover:-translate-y-1 hover:shadow-(--shadow-lift) md:p-9',
        featured ? 'border-navy-900 bg-navy-900 text-white' : 'border-line bg-white hover:border-line-strong',
      )}
    >
      <p className={cn('font-display text-sm font-bold uppercase tracking-[0.14em]', featured ? 'text-[#8cc4f0]' : 'text-ocean-600')}>Daire tipi</p>
      <h3 className={cn('mt-2 font-display text-5xl font-extrabold tracking-[-0.04em]', featured ? 'text-white' : 'text-navy-900')}>{pkg.roomType}</h3>
      <p className={cn('mt-1 font-medium', featured ? 'text-white/80' : 'text-muted')}>{pkg.name}</p>

      <div className={cn('my-7 h-px', featured ? 'bg-white/15' : 'bg-line')} />

      <p className={cn('text-sm', featured ? 'text-white/70' : 'text-muted')}>İlan edilen fiyat</p>
      <p data-testid={`price-${pkg.roomType}`} className={cn('mt-1 font-display text-4xl font-extrabold tracking-[-0.03em]', featured ? 'text-white' : 'text-navy-900')}>
        {formatPrice(pkg.price, pkg.currency)}
      </p>
      {(pkg.vatNote || pkg.validUntil) && (
        <p className={cn('mt-1 text-sm', featured ? 'text-white/70' : 'text-muted')}>
          {[pkg.vatNote, pkg.validUntil ? `${formatDate(pkg.validUntil)} tarihine kadar geçerlidir` : ''].filter(Boolean).join(' · ')}
        </p>
      )}
      <p className={cn('mt-5 flex-1 text-[0.9375rem]', featured ? 'text-white/80' : 'text-muted')}>{pkg.summary}</p>

      <div className="mt-8 grid gap-3">
        <Link href={`/teklif-al?paket=${pkg.slug}`} className={buttonClass(featured ? 'light' : 'primary', 'md', 'w-full')} data-event="select_painting_package" data-event-label={pkg.roomType}>
          Teklif Al
        </Link>
        <Link
          href={`/ev-boyama/${pkg.slug}`}
          className={cn('link-arrow inline-flex items-center justify-center gap-1.5 py-1 text-sm font-semibold underline-offset-4 hover:underline', featured ? 'text-white' : 'text-navy-900')}
        >
          Hizmet kapsamını incele <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </article>
  );
}

export function PriceCards({ packages, className }: { packages: PackageCardData[]; className?: string }) {
  return (
    <div className={cn('grid gap-5 md:grid-cols-3', className)}>
      {packages.map((p, i) => (
        <PriceCard key={p.slug} pkg={p} index={i} featured={packages.length === 3 && i === 1} />
      ))}
    </div>
  );
}

/**
 * Mobil fiyat şeridi: fiyatlar ilk ekranda görünür ve tek dokunuşla, paket seçili olarak teklif formuna götürür.
 * Yalnızca lg altında görünür; masaüstünde aynı bilgi geniş fiyat panelinde yer alır.
 */
export function MobilePriceStrip({ packages, location, className }: { packages: PackageCardData[]; location: string; className?: string }) {
  if (packages.length === 0) return null;
  return (
    <ul aria-label="Ev boyama paket fiyatları" className={cn('grid gap-2 lg:hidden', packages.length === 3 ? 'grid-cols-3' : 'grid-cols-2', className)}>
      {packages.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/teklif-al?paket=${p.slug}`}
            data-event="select_painting_package"
            data-event-label={p.roomType}
            data-event-location={location}
            data-testid={`mobile-price-${p.roomType}`}
            className="flex h-full flex-col items-center rounded-(--radius-md) border border-line-strong bg-white px-1 py-2.5 text-center shadow-(--shadow-card) active:scale-[0.98]"
          >
            <span className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ocean-700">{p.roomType} daire</span>
            <span className="mt-0.5 whitespace-nowrap font-display text-[clamp(0.9375rem,4.3vw,1.125rem)] font-extrabold tracking-[-0.02em] text-navy-900">
              {formatPrice(p.price, p.currency)}
            </span>
            <span className="mt-0.5 text-[0.6875rem] font-semibold text-muted">Teklif al</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Kapsam başlıkları: doğrulanmamış kalemler "teklifte netleşir" olarak gösterilir, taahhüt üretilmez. */
export function ScopeList({ items, note }: { items: ScopeItem[]; note?: string }) {
  return (
    <div>
      <ul className="divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.label} className="flex items-start justify-between gap-6 py-4">
            <span className="font-medium text-navy-900">
              {item.label}
              {item.note && <span className="mt-0.5 block text-sm font-normal text-muted">{item.note}</span>}
            </span>
            {item.included === true ? (
              <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-success">
                <Check aria-hidden className="size-4" /> Dahil
              </span>
            ) : item.included === false ? (
              <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-muted">
                <Minus aria-hidden className="size-4" /> Dahil değil
              </span>
            ) : (
              <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-ocean-700">
                <CircleHelp aria-hidden className="size-4" /> Teklifte netleşir
              </span>
            )}
          </li>
        ))}
      </ul>
      {note && <p className="mt-4 text-sm text-muted">{note}</p>}
    </div>
  );
}

export type ServiceCardData = { slug: string; title: string; overview: string; image: string | null; imageAlt: string | null };

export function ServiceCard({ service, index = 0, large, className }: { service: ServiceCardData; index?: number; large?: boolean; className?: string }) {
  return (
    <Link
      href={`/hizmetler/${service.slug}`}
      data-reveal
      style={idx(index)}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-(--radius-lg) border border-line bg-white transition-[border-color,box-shadow] duration-(--duration-card) hover:border-navy-900/25 hover:shadow-(--shadow-card)',
        className,
      )}
    >
      {service.image && (
        <div className={cn('zoom-media relative bg-soft', large ? 'aspect-[16/10]' : 'aspect-[3/2]')}>
          <Image src={service.image} alt={service.imageAlt ?? ''} fill sizes={large ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'} className="object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h3 className={cn('font-display font-bold tracking-[-0.015em] text-navy-900 transition-colors duration-(--duration-hover) group-hover:text-ocean-700', large ? 'text-2xl' : 'text-lg')}>
          {service.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-[0.9375rem] text-muted">{service.overview}</p>
        <span className="link-arrow mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900">
          İncele <ArrowRight aria-hidden className="size-4" />
        </span>
      </div>
    </Link>
  );
}

export type ProjectCardData = {
  slug: string;
  title: string;
  category: string;
  projectType: string;
  region: string;
  status: string;
  summary: string;
  images: { src: string; alt: string; width: number; height: number }[];
};

export function ProjectCard({ project, index = 0, wide }: { project: ProjectCardData; index?: number; wide?: boolean }) {
  const cover = project.images[0];
  return (
    <Link href={`/projeler/${project.slug}`} data-reveal style={idx(index)} className={cn('group block', wide && 'md:col-span-2')}>
      <div className={cn('zoom-media relative overflow-hidden rounded-(--radius-lg) bg-soft', wide ? 'aspect-[16/9]' : 'aspect-[4/3]')}>
        {cover && <Image src={cover.src} alt={cover.alt} fill sizes={wide ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'} className="object-cover" />}
        <span className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white text-navy-900 opacity-0 transition-[opacity,transform] duration-(--duration-card) group-hover:opacity-100 group-focus-visible:opacity-100 max-md:opacity-100">
          <ArrowUpRight aria-hidden className="size-5" />
        </span>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{project.category}</Badge>
        {project.status && <Badge tone="ocean">{project.status}</Badge>}
      </div>
      <h3 className="mt-3 font-display text-xl font-bold tracking-[-0.015em] text-navy-900 transition-colors group-hover:text-ocean-700 md:text-2xl">{project.title}</h3>
      <p className="mt-1 text-sm text-muted">
        {project.projectType} · {project.region}
      </p>
    </Link>
  );
}

export type BlogCardData = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string | null;
  coverAlt: string | null;
  readMinutes: number;
  publishedAt: Date | null;
  categoryName: string;
};

export function BlogCard({ post, index = 0 }: { post: BlogCardData; index?: number }) {
  return (
    <article data-reveal style={idx(index)} className="group relative flex flex-col">
      <div className="zoom-media relative aspect-[3/2] overflow-hidden rounded-(--radius-lg) bg-soft">
        {post.cover && <Image src={post.cover} alt={post.coverAlt ?? ''} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />}
      </div>
      <p className="mt-5 text-sm text-muted">
        <span className="font-semibold text-ocean-700">{post.categoryName}</span>
        {post.publishedAt && <> · {formatDate(post.publishedAt)}</>} · {post.readMinutes} dk okuma
      </p>
      <h3 className="mt-2 font-display text-xl font-bold tracking-[-0.015em] text-navy-900 transition-colors group-hover:text-ocean-700">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-[0.9375rem] text-muted">{post.excerpt}</p>
    </article>
  );
}
