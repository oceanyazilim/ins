import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { packagePriceHistory, paintingPackages } from '@/db/schema';
import { savePackageAction } from '@/features/admin/actions';
import { SubmitButton } from '@/features/admin/client';
import { faqsToText, scopeItemsToText } from '@/features/admin/parse';
import { Card, Checkbox, Flash, Input, PageHeader, Textarea, type SearchParams } from '@/features/admin/ui';
import { formatDateTime, formatPrice } from '@/lib/format';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Paket' };

export default async function PackageEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SearchParams }) {
  await requireUser('pricing.manage');
  const id = Number((await params).id);
  const p = Number.isInteger(id) ? await db.query.paintingPackages.findFirst({ where: eq(paintingPackages.id, id), with: { history: { orderBy: [desc(packagePriceHistory.createdAt)], with: { user: true } } } }) : null;
  if (!p) notFound();

  return (
    <>
      <PageHeader title={p.name} description={`/ev-boyama/${p.slug}`} back={{ href: '/admin/fiyatlar', label: 'Boya Fiyatları' }} />
      <Flash searchParams={searchParams} />
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <form action={savePackageAction} className="space-y-6">
          <input type="hidden" name="id" value={p.id} />
          <Card title="Fiyat">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Paket adı" name="name" defaultValue={p.name} required />
              <Input label={`Fiyat (${p.currency})`} name="price" inputMode="numeric" defaultValue={p.price} required hint="Tam TL tutarı, örn. 30000" />
              <Input label="Geçerlilik tarihi" name="validUntil" type="date" defaultValue={p.validUntil ?? ''} hint="Boşsa sitede geçerlilik tarihi gösterilmez." />
              <Input label="KDV notu" name="vatNote" defaultValue={p.vatNote} hint="Örn. “KDV dahildir”. Doğrulanana kadar boş bırakın; boşsa sitede KDV ifadesi yer almaz." />
            </div>
            <div className="mt-4">
              <Checkbox label="Paket aktif" name="active" defaultChecked={p.active} hint="Pasif paket sitede, teklif formunda ve yapılandırılmış veride görünmez." />
            </div>
          </Card>
          <Card title="Kapsam" description="Her satır: Kalem | dahil / dahil değil / teklifte | isteğe bağlı not. Doğrulanmamış kalemleri “teklifte” bırakın; site bunları taahhüt olarak göstermez.">
            <div className="grid gap-4">
              <Textarea label="Kapsam kalemleri" name="scopeItems" rows={8} defaultValue={scopeItemsToText(p.scopeItems)} />
              <Textarea label="Kapsam notu" name="scopeNote" rows={2} defaultValue={p.scopeNote} className="font-sans" />
            </div>
          </Card>
          <Card title="Sayfa içeriği">
            <div className="grid gap-4">
              <Textarea label="Kısa özet (kartlarda)" name="summary" rows={2} defaultValue={p.summary} className="font-sans" />
              <Textarea label="Tanıtım (sayfa girişi)" name="description" rows={3} defaultValue={p.description} className="font-sans" />
              <Textarea label="Gövde (Markdown)" name="body" rows={16} defaultValue={p.body} hint="Fiyatı elle yazmayın; {{fiyat:1+1}} gibi yer tutucular kullanın." />
              <Textarea label="Sık sorulan sorular" name="faqs" rows={10} defaultValue={faqsToText(p.faqs)} hint="Bloklar boş satırla ayrılır; ilk satır soru, sonraki satırlar cevap." />
            </div>
          </Card>
          <Card title="SEO">
            <div className="grid gap-4">
              <Input label="Meta başlık" name="metaTitle" defaultValue={p.metaTitle ?? ''} />
              <Textarea label="Meta açıklama" name="metaDescription" rows={2} defaultValue={p.metaDescription ?? ''} className="font-sans" />
            </div>
          </Card>
          <SubmitButton>Paketi kaydet</SubmitButton>
        </form>

        <Card title="Fiyat geçmişi">
          <ol className="space-y-3 text-sm" data-testid="price-history">
            {p.history.map((h) => (
              <li key={h.id}>
                <span className="font-semibold text-navy-900">{h.oldPrice !== null ? `${formatPrice(h.oldPrice)} → ` : 'İlk fiyat: '}{formatPrice(h.newPrice)}</span>
                <span className="block text-xs text-muted">{h.user?.name ?? 'Kurulum'} · {formatDateTime(h.createdAt)}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
