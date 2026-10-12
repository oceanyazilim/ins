import {
  ArrowRightLeft,
  FileText,
  FolderKanban,
  History,
  ImageIcon,
  Inbox,
  LayoutDashboard,
  MapPinned,
  MessageCircleQuestion,
  Paintbrush,
  Search,
  Settings,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { and, count, eq } from 'drizzle-orm';
import { db } from '@/db';
import { leads } from '@/db/schema';
import { logoutAction } from '@/features/admin/actions';
import { can, type Permission } from '@/lib/permissions';
import { requireUser } from '@/server/auth';

const NAV: { href: string; label: string; icon: LucideIcon; permission?: Permission }[] = [
  { href: '/admin', label: 'Genel Bakış', icon: LayoutDashboard },
  { href: '/admin/talepler', label: 'Talepler', icon: Inbox, permission: 'leads.view' },
  { href: '/admin/fiyatlar', label: 'Boya Fiyatları', icon: Paintbrush, permission: 'pricing.manage' },
  { href: '/admin/bolgeler', label: 'Hizmet Bölgeleri', icon: MapPinned, permission: 'areas.manage' },
  { href: '/admin/hizmetler', label: 'Hizmetler', icon: Wrench, permission: 'content.manage' },
  { href: '/admin/projeler', label: 'Projeler', icon: FolderKanban, permission: 'content.manage' },
  { href: '/admin/blog', label: 'Blog', icon: FileText, permission: 'content.manage' },
  { href: '/admin/sss', label: 'SSS', icon: MessageCircleQuestion, permission: 'content.manage' },
  { href: '/admin/medya', label: 'Medya', icon: ImageIcon, permission: 'media.manage' },
  { href: '/admin/seo', label: 'SEO', icon: Search, permission: 'seo.manage' },
  { href: '/admin/yonlendirmeler', label: 'Yönlendirmeler', icon: ArrowRightLeft, permission: 'seo.manage' },
  { href: '/admin/ayarlar', label: 'Ayarlar', icon: Settings, permission: 'settings.manage' },
  { href: '/admin/kayitlar', label: 'İşlem Kayıtları', icon: History, permission: 'audit.view' },
];

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const [newLeads] = await db.select({ n: count() }).from(leads).where(and(eq(leads.status, 'new')));
  const items = NAV.filter((n) => !n.permission || can(user.role, n.permission));

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15.5rem_1fr]">
      <aside className="border-b border-line bg-navy-950 text-white lg:border-b-0">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:py-6">
          <Link href="/admin" className="font-display text-lg font-extrabold tracking-wide">
            OCEAN <span className="font-medium text-white/60">Yönetim</span>
          </Link>
          <Link href="/" target="_blank" className="text-xs font-semibold text-[#8cc4f0] underline-offset-4 hover:underline lg:mt-1 lg:block">
            Siteyi görüntüle ↗
          </Link>
        </div>
        <nav aria-label="Yönetim menüsü" className="overflow-x-auto px-3 pb-3 lg:pb-6">
          <ul className="flex gap-1 lg:block lg:space-y-0.5">
            {items.map((n) => (
              <li key={n.href} className="shrink-0">
                <Link href={n.href} className="flex items-center gap-3 whitespace-nowrap rounded-(--radius-md) px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
                  <n.icon aria-hidden className="size-4 shrink-0" strokeWidth={1.75} />
                  {n.label}
                  {n.href === '/admin/talepler' && (newLeads?.n ?? 0) > 0 && (
                    <span className="ml-auto rounded-full bg-ocean-500 px-2 py-0.5 text-xs font-bold text-white" aria-label={`${newLeads!.n} yeni talep`}>
                      {newLeads!.n}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-between gap-4 border-b border-line bg-white px-5 py-3 md:px-8">
          <form action="/admin/talepler" className="hidden max-w-sm flex-1 sm:block" role="search">
            <label htmlFor="admin-q" className="sr-only">
              Taleplerde ara
            </label>
            <input id="admin-q" name="q" type="search" placeholder="Taleplerde ara: ad, telefon, talep no" className="field min-h-9 py-1.5 text-sm" />
          </form>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="text-muted">
              <span className="font-semibold text-navy-900">{user.name}</span> · {user.role === 'admin' ? 'Yönetici' : 'Editör'}
            </span>
            <form action={logoutAction}>
              <button type="submit" className="font-semibold text-ocean-700 underline-offset-4 hover:underline">
                Çıkış
              </button>
            </form>
          </div>
        </header>
        <main className="px-5 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
