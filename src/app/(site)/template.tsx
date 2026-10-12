import type { ReactNode } from 'react';

/**
 * Sayfa geçişi: template her gezinmede yeniden bağlanır, başlık ve alt bilgi (layout) sabit kalır.
 * Yalnızca opacity + transform kullanan kısa bir CSS animasyonudur; beyaz ekran veya üst üste binme oluşmaz
 * ve prefers-reduced-motion açıkken devre dışıdır.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-(--animate-page-in)">{children}</div>;
}
