import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/primitives';

export const metadata: Metadata = { title: 'Sayfa bulunamadı | Ocean İnşaat', robots: { index: false, follow: true } };

const LINKS = [
  ['Ev Boyama', '/ev-boyama'],
  ['Boya Fiyatları', '/boya-fiyatlari'],
  ['Hizmetlerimiz', '/hizmetler'],
  ['Projelerimiz', '/projeler'],
  ['Blog', '/blog'],
  ['İletişim', '/iletisim'],
] as const;

export default function NotFound() {
  return (
    <Container className="py-24 md:py-32">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-h1 font-extrabold">Aradığınız sayfa bulunamadı</h1>
      <p className="mt-5 max-w-xl text-lead text-muted">Sayfa taşınmış ya da kaldırılmış olabilir. Aşağıdaki bağlantılardan devam edebilirsiniz.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/">Ana sayfaya dön</ButtonLink>
        <ButtonLink href="/teklif-al" variant="outline">
          Teklif Al
        </ButtonLink>
      </div>
      <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-8">
        {LINKS.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-link font-semibold">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
