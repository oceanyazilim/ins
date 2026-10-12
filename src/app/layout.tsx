import type { Metadata, Viewport } from 'next';
import { Inter, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import { env } from '@/lib/env';
import './globals.css';

const manrope = Manrope({ subsets: ['latin', 'latin-ext'], variable: '--font-manrope', display: 'swap', weight: ['500', '600', '700', '800'] });
// Gövde yazı tipi önceden yüklenmez: yavaş bağlantıda LCP görseliyle bant genişliği için yarışmaz (yedek yazı tipi boyut ayarlıdır).
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter', display: 'swap', preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  applicationName: 'Ocean İnşaat',
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: '#0b0b0d', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" className={`${manrope.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Kaydırma animasyonları yalnızca JS çalışıyorsa içerik gizler; JS yoksa her şey görünür kalır. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
