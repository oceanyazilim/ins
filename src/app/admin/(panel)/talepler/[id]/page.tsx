import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { leadNotes, leads, leadStatusHistory } from '@/db/schema';
import { anonymizeLeadAction, updateLeadAction } from '@/features/admin/actions';
import { ConfirmButton, SubmitButton } from '@/features/admin/client';
import { Card, Flash, Input, LEAD_TONES, PageHeader, Select, StatusPill, Textarea, type SearchParams } from '@/features/admin/ui';
import { CONTACT_PREFERENCES, labelOf, LEAD_STATUSES, PROPERTY_STATES, SCOPE_OPTIONS, SERVICE_TYPES } from '@/features/quote/options';
import { formatDateTime, formatPhone, formatPrice, whatsappUrl } from '@/lib/format';
import { can } from '@/lib/permissions';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Talep' };

export default async function LeadPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SearchParams }) {
  const user = await requireUser('leads.view');
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, id),
    with: {
      attachments: true,
      consents: true,
      history: { orderBy: [desc(leadStatusHistory.createdAt)], with: { user: true } },
      notes: { orderBy: [desc(leadNotes.createdAt)], with: { user: true } },
    },
  });
  if (!lead) notFound();
  const gone = Boolean(lead.anonymizedAt);

  const rows: [string, React.ReactNode][] = [
    ['Hizmet', lead.serviceType === 'iletisim' ? 'İletişim formu' : labelOf(SERVICE_TYPES, lead.serviceType)],
    ['Daire tipi', lead.roomType ?? '—'],
    ['İlan edilen paket fiyatı', lead.listedPrice ? formatPrice(lead.listedPrice) : '—'],
    ['İstenen kapsam', lead.scopeOptions.map((o) => labelOf(SCOPE_OPTIONS, o)).join(', ') || '—'],
    ['Daire durumu', lead.propertyState ? labelOf(PROPERTY_STATES, lead.propertyState) : '—'],
    ['Konum', [lead.neighborhood, lead.district, lead.city].filter(Boolean).join(' / ') || '—'],
    ['Açıklama', lead.message ? <span className="whitespace-pre-line">{lead.message}</span> : '—'],
    ['İletişim tercihi', `${labelOf(CONTACT_PREFERENCES, lead.contactPreference)}${lead.contactTime ? ` · ${lead.contactTime}` : ''}`],
    ['Kaynak', [lead.landingPage && `Giriş: ${lead.landingPage}`, lead.referrer && `Yönlendiren: ${lead.referrer}`, lead.utmSource && `utm_source: ${lead.utmSource}`, lead.utmMedium && `utm_medium: ${lead.utmMedium}`, lead.utmCampaign && `utm_campaign: ${lead.utmCampaign}`].filter(Boolean).join(' · ') || '—'],
    ['Rızalar', lead.consents.map((c) => `${c.type === 'marketing' ? 'Ticari ileti' : 'Aydınlatma metni'}: ${c.granted ? 'evet' : 'hayır'} (v${c.textVersion})`).join(' · ') || '—'],
  ];

  return (
    <>
      <PageHeader
        title={`Talep ${lead.ref}`}
        description={`${formatDateTime(lead.createdAt)} tarihinde oluşturuldu`}
        back={{ href: '/admin/talepler', label: 'Talepler' }}
        actions={<StatusPill tone={LEAD_TONES[lead.status] ?? 'gray'}>{labelOf(LEAD_STATUSES, lead.status)}</StatusPill>}
      />
      <Flash searchParams={searchParams} />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card title="Kişi">
            {gone ? (
              <p className="text-sm text-muted">Bu talebin kişisel verileri {formatDateTime(lead.anonymizedAt!)} tarihinde silinmiştir.</p>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-display text-xl font-bold text-navy-900" data-testid="lead-name">{lead.name}</p>
                  <p className="text-sm text-muted">{lead.email ?? 'E-posta belirtilmedi'}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm font-semibold">
                  <a href={`tel:${lead.phone}`} className="rounded-full border border-line-strong px-4 py-2 text-navy-900 hover:border-navy-900">{formatPhone(lead.phone)}</a>
                  <a href={whatsappUrl(lead.phone, `Merhaba ${lead.name}, Ocean İnşaat’tan ${lead.ref} numaralı talebiniz için yazıyoruz.`)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-whatsapp px-4 py-2 text-white">WhatsApp</a>
                </div>
              </div>
            )}
          </Card>

          <Card title="Talep ayrıntıları">
            <dl className="divide-y divide-line text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr]">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-navy-900">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {lead.attachments.length > 0 && (
            <Card title={`Fotoğraflar (${lead.attachments.length})`} description="Yalnızca oturum açmış yetkili kullanıcılar görüntüleyebilir.">
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {lead.attachments.map((a) => (
                  <li key={a.id}>
                    <a href={`/api/admin/attachments/${a.id}`} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-(--radius-md) border border-line">
                      {/* eslint-disable-next-line @next/next/no-img-element -- kimlik doğrulamalı uç nokta, görsel optimizasyonundan geçirilmez */}
                      <img src={`/api/admin/attachments/${a.id}`} alt={`Talep fotoğrafı ${a.id}`} width={a.width ?? 400} height={a.height ?? 300} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {can(user.role, 'leads.manage') && (
            <Card title="Durum ve teklif">
              <form action={updateLeadAction} className="grid gap-4">
                <input type="hidden" name="id" value={lead.id} />
                <Select label="Durum" name="status" defaultValue={lead.status} options={LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
                <Input label="Onaylanan özel teklif (TL)" name="quotedPrice" inputMode="numeric" defaultValue={lead.quotedPrice ?? ''} hint="İlan edilen paket fiyatından ayrı tutulur. Boş bırakılabilir." />
                <Textarea label="Not ekle" name="note" rows={3} className="font-sans" />
                <SubmitButton>Güncelle</SubmitButton>
              </form>
            </Card>
          )}

          <Card title="Notlar">
            {lead.notes.length === 0 ? <p className="text-sm text-muted">Not yok.</p> : (
              <ul className="space-y-4 text-sm">
                {lead.notes.map((n) => (
                  <li key={n.id}>
                    <p className="whitespace-pre-line text-navy-900">{n.body}</p>
                    <p className="text-xs text-muted">{n.user?.name ?? 'Sistem'} · {formatDateTime(n.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Durum geçmişi">
            <ol className="space-y-3 text-sm">
              {lead.history.map((h) => (
                <li key={h.id}>
                  <span className="font-semibold text-navy-900">{h.fromStatus ? `${labelOf(LEAD_STATUSES, h.fromStatus)} → ` : ''}{labelOf(LEAD_STATUSES, h.toStatus)}</span>
                  <span className="block text-xs text-muted">{h.user?.name ?? 'Sistem'} · {formatDateTime(h.createdAt)}</span>
                </li>
              ))}
            </ol>
          </Card>

          {can(user.role, 'leads.delete') && !gone && (
            <Card title="KVKK silme talebi" description="Ad, telefon, e-posta, açıklama, notlar ve fotoğraflar kalıcı olarak silinir. İstatistik için anonim kayıt kalır.">
              <form action={anonymizeLeadAction}>
                <input type="hidden" name="id" value={lead.id} />
                <ConfirmButton title="Kişisel veriler silinsin mi?" text="Bu işlem geri alınamaz." confirmLabel="Evet, kalıcı olarak sil">Kişisel verileri sil</ConfirmButton>
              </form>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
