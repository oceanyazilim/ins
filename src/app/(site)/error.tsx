'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { buttonClass } from '@/components/ui/button';

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-page py-24 md:py-32">
      <p className="eyebrow">Bir sorun oluştu</p>
      <h1 className="mt-4 text-h1 font-extrabold">Sayfa şu anda görüntülenemiyor</h1>
      <p className="mt-5 max-w-xl text-lead text-muted">Geçici bir hata oluştu. Lütfen tekrar deneyin; sorun sürerse bizi telefonla arayabilirsiniz.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className={buttonClass('primary')}>
          Tekrar dene
        </button>
        <Link href="/" className={buttonClass('outline')}>
          Ana sayfaya dön
        </Link>
      </div>
      {error.digest && <p className="mt-6 text-xs text-muted">Hata kodu: {error.digest}</p>}
    </div>
  );
}
