import { asc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/db';
import { faqs } from '@/db/schema';
import { saveFaqAction } from '@/features/admin/actions';
import { ConfirmButton, SubmitButton } from '@/features/admin/client';
import { Card, Checkbox, first, Flash, Input, PageHeader, Textarea, type SearchParams } from '@/features/admin/ui';
import { cn } from '@/lib/cn';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'SSS' };

const SCOPES = [
  ['home', 'Ana sayfa'],
  ['ev-boyama', 'Ev Boyama'],
  ['boya-fiyatlari', 'Boya Fiyatları'],
  ['teklif-al', 'Teklif Al'],
] as const;

export default async function FaqAdminPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser('content.manage');
  const requested = first((await searchParams).sayfa);
  const scope = SCOPES.find(([k]) => k === requested)?.[0] ?? 'home';
  const rows = await db.select().from(faqs).where(eq(faqs.scope, scope)).orderBy(asc(faqs.sort), asc(faqs.id));
  return (
    <>
      <PageHeader title="Sık Sorulan Sorular" description="Fiyatları elle yazmayın: {{fiyat:1+1}}, {{fiyat:2+1}}, {{fiyat:3+1}} ve {{bolgeler}} yer tutucuları güncel verilerle doldurulur. Paket, hizmet ve bölge SSS’leri kendi düzenleme ekranlarındadır." />
      <Flash searchParams={searchParams} />
      <ul className="mb-6 flex flex-wrap gap-2 text-sm font-semibold">
        {SCOPES.map(([k, label]) => (
          <li key={k}>
            <Link href={`/admin/sss?sayfa=${k}`} className={cn('block rounded-full border px-3.5 py-1.5', scope === k ? 'border-navy-900 bg-navy-900 text-white' : 'border-line bg-white text-navy-900')}>{label}</Link>
          </li>
        ))}
      </ul>
      <div className="grid gap-4">
        {rows.map((f) => (
          <Card key={f.id}>
            <form action={saveFaqAction} className="grid gap-3">
              <input type="hidden" name="id" value={f.id} />
              <input type="hidden" name="scope" value={scope} />
              <Input label="Soru" name="question" defaultValue={f.question} required />
              <Textarea label="Cevap" name="answer" rows={3} defaultValue={f.answer} className="font-sans" required />
              <div className="flex flex-wrap items-center gap-5">
                <Input label="Sıra" name="sort" type="number" defaultValue={f.sort} wrapClass="w-24" />
                <Checkbox label="Yayında" name="active" defaultChecked={f.active} />
                <span className="ml-auto flex items-center gap-4">
                  <ConfirmButton title="Soru silinsin mi?" text="Bu işlem geri alınamaz.">Sil</ConfirmButton>
                  <SubmitButton />
                </span>
              </div>
            </form>
          </Card>
        ))}
        <Card title="Yeni soru ekle">
          <form action={saveFaqAction} className="grid gap-3">
            <input type="hidden" name="scope" value={scope} />
            <input type="hidden" name="active" value="on" />
            <Input label="Soru" name="question" required />
            <Textarea label="Cevap" name="answer" rows={3} className="font-sans" required />
            <div className="flex items-end gap-4">
              <Input label="Sıra" name="sort" type="number" defaultValue={rows.length} wrapClass="w-24" />
              <SubmitButton>Ekle</SubmitButton>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
