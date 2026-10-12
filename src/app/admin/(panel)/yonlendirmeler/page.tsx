import { desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import { db } from '@/db';
import { redirectRules } from '@/db/schema';
import { staticRedirects } from '@/config/redirects';
import { saveRedirectAction } from '@/features/admin/actions';
import { ConfirmButton, SubmitButton } from '@/features/admin/client';
import { Card, Flash, Input, PageHeader, Select, StatusPill, Table, type SearchParams } from '@/features/admin/ui';
import { formatDateTime } from '@/lib/format';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Yönlendirmeler' };

export default async function RedirectsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser('seo.manage');
  const rows = await db.select().from(redirectRules).orderBy(desc(redirectRules.createdAt));
  return (
    <>
      <PageHeader title="Yönlendirmeler" description="Kaldırılan veya adresi değişen sayfalar için kalıcı yönlendirme tanımlayın. Zincir (A→B→C) ve döngü oluşturan kurallar kabul edilmez. Kurallar, o adreste yayında bir sayfa yoksa uygulanır." />
      <Flash searchParams={searchParams} />
      <Card title="Yeni yönlendirme" className="mb-6">
        <form action={saveRedirectAction} className="grid items-end gap-4 md:grid-cols-[1.4fr_1.4fr_1fr_auto]">
          <Input label="Eski adres" name="source" required placeholder="/eski-sayfa" />
          <Input label="Yeni adres" name="destination" required placeholder="/yeni-sayfa" />
          <Select label="Tür" name="statusCode" options={[{ value: 308, label: '308 Kalıcı' }, { value: 307, label: '307 Geçici' }]} />
          <SubmitButton>Ekle</SubmitButton>
        </form>
      </Card>
      <Table head={['Eski adres', 'Yeni adres', 'Tür', 'Durum', 'Kullanım', 'Oluşturulma', '']} empty={rows.length === 0}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="font-mono text-xs">{r.source}</td>
            <td className="font-mono text-xs">{r.destination}</td>
            <td>{r.statusCode}</td>
            <td><StatusPill tone={r.active ? 'green' : 'gray'}>{r.active ? 'Aktif' : 'Pasif'}</StatusPill></td>
            <td className="tabular-nums">{r.hits}</td>
            <td className="whitespace-nowrap text-muted">{formatDateTime(r.createdAt)}</td>
            <td>
              <form action={saveRedirectAction} className="flex items-center gap-4">
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" name="intent" value="toggle" className="text-sm font-semibold text-ocean-700 underline-offset-4 hover:underline">{r.active ? 'Durdur' : 'Etkinleştir'}</button>
                <ConfirmButton title="Yönlendirme silinsin mi?" text="Eski adres 404 dönmeye başlar.">Sil</ConfirmButton>
              </form>
            </td>
          </tr>
        ))}
      </Table>

      <h2 className="mb-3 mt-10 font-display text-lg font-bold text-navy-900">Sabit yönlendirmeler (eski siteden geçiş)</h2>
      <p className="mb-4 text-sm text-muted">Bu kurallar kod içinde tanımlıdır (src/config/redirects.ts) ve her istekte en önce uygulanır.</p>
      <Table head={['Eski adres', 'Yeni adres', 'Gerekçe']}>
        {staticRedirects.map((r) => (
          <tr key={r.source}>
            <td className="font-mono text-xs">{r.source}</td>
            <td className="font-mono text-xs">{r.destination}</td>
            <td className="text-muted">{r.reason}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
