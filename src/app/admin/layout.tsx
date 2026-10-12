import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: { default: 'Yönetim Paneli | Ocean İnşaat', template: '%s | Ocean İnşaat Yönetim' }, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-soft text-ink">{children}</div>;
}
