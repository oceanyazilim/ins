import { formatPhone, formatPrice } from '@/lib/format';

export type LeadEmailData = {
  ref: string;
  serviceLabel: string;
  roomType?: string | null;
  listedPrice?: number | null;
  district?: string | null;
  neighborhood?: string | null;
  propertyState?: string | null;
  scope: string[];
  name: string;
  phone: string;
  email?: string | null;
  contactPreference?: string | null;
  contactTime?: string | null;
  message?: string | null;
  photoCount: number;
  adminUrl: string;
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderLeadEmail(l: LeadEmailData): { subject: string; text: string; html: string } {
  const rows: [string, string][] = [
    ['Talep no', l.ref],
    ['Hizmet', l.serviceLabel],
    ...(l.roomType ? [['Daire tipi', l.roomType] as [string, string]] : []),
    ...(l.listedPrice ? [['İlan edilen paket fiyatı', formatPrice(l.listedPrice)] as [string, string]] : []),
    ['Konum', [l.neighborhood, l.district, 'İstanbul'].filter(Boolean).join(' / ')],
    ...(l.propertyState ? [['Daire durumu', l.propertyState] as [string, string]] : []),
    ...(l.scope.length ? [['İstenen kapsam', l.scope.join(', ')] as [string, string]] : []),
    ['Ad soyad', l.name],
    ['Telefon', formatPhone(l.phone)],
    ...(l.email ? [['E-posta', l.email] as [string, string]] : []),
    ...(l.contactPreference ? [['İletişim tercihi', l.contactPreference] as [string, string]] : []),
    ...(l.contactTime ? [['Uygun zaman', l.contactTime] as [string, string]] : []),
    ...(l.photoCount ? [['Fotoğraf', `${l.photoCount} adet (yönetim panelinde)`] as [string, string]] : []),
    ...(l.message ? [['Açıklama', l.message] as [string, string]] : []),
  ];
  const subject = `Yeni teklif talebi ${l.ref} — ${l.serviceLabel}${l.district ? ` / ${l.district}` : ''}`;
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nTalebi görüntüle: ${l.adminUrl}`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#17212d;max-width:560px">
<h1 style="font-size:18px;color:#0b0b0d;margin:0 0 16px">Yeni teklif talebi</h1>
<table style="border-collapse:collapse;width:100%">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid #e5eaf0;color:#64748b;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:8px 0;border-bottom:1px solid #e5eaf0">${esc(v).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('')}</table>
<p style="margin:20px 0 0"><a href="${esc(l.adminUrl)}" style="background:#0b0b0d;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block">Talebi yönetim panelinde aç</a></p>
</div>`;
  return { subject, text, html };
}
