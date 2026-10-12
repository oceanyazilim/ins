const TRY = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });

/** 25000 → "25.000 TL" */
export function formatPrice(amount: number, currency = 'TRY'): string {
  const n = TRY.format(amount);
  return currency === 'TRY' ? `${n} TL` : `${n} ${currency}`;
}

/** +905330392221 → "+90 533 039 22 21" */
export function formatPhone(e164: string): string {
  const m = e164.replace(/[^\d+]/g, '').match(/^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+90 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : e164;
}

/** Kullanıcının yazdığı Türkiye numarasını E.164'e çevirir; geçersizse null. */
export function normalizeTrPhone(input: string): string | null {
  let d = input.replace(/\D/g, '');
  if (d.startsWith('0090')) d = d.slice(4);
  else if (d.startsWith('90') && d.length === 12) d = d.slice(2);
  else if (d.startsWith('0')) d = d.slice(1);
  if (d.length !== 10 || !/^[2-5]/.test(d)) return null;
  return `+90${d}`;
}

const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' });
const dateTimeFmt = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Istanbul',
});

export const formatDate = (d: Date | string) => dateFmt.format(new Date(d));
export const formatDateTime = (d: Date | string) => dateTimeFmt.format(new Date(d));

export function whatsappUrl(number: string, message: string): string {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}
