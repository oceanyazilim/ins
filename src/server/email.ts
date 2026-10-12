import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '@/lib/env';
import { renderLeadEmail, type LeadEmailData } from '@/emails/lead-notification';

let transport: Transporter | null = null;

function getTransport() {
  if (!env.SMTP_HOST) return null;
  transport ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
  });
  return transport;
}

/**
 * Yeni talep bildirimi. E-posta gönderimi başarısız olsa bile talep kaydı korunur;
 * hata yalnızca günlüğe yazılır. SMTP tanımlı değilse bildirim günlüğe düşer.
 */
export async function notifyNewLead(lead: LeadEmailData): Promise<'sent' | 'logged' | 'failed'> {
  const to = env.LEAD_NOTIFY_EMAIL.split(',').map((s) => s.trim()).filter(Boolean);
  const t = getTransport();
  if (!t || to.length === 0) {
    console.info(`[lead] Yeni talep ${lead.ref} (${lead.serviceLabel}) — SMTP tanımlı olmadığı için e-posta gönderilmedi.`);
    return 'logged';
  }
  try {
    const { subject, text, html } = renderLeadEmail(lead);
    await t.sendMail({ from: env.SMTP_FROM, to, subject, text, html, replyTo: lead.email || undefined });
    return 'sent';
  } catch (e) {
    console.error(`[lead] ${lead.ref} bildirimi gönderilemedi:`, e instanceof Error ? e.message : e);
    return 'failed';
  }
}
