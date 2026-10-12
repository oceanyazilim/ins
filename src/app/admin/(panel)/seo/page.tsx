import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/db';
import { seoEntries } from '@/db/schema';
import { saveSeoAction } from '@/features/admin/actions';
import { ConfirmButton, SubmitButton } from '@/features/admin/client';
import { Card, Checkbox, first, Flash, Input, PageHeader, StatusPill, Table, Textarea, type SearchParams } from '@/features/admin/ui';
import { env } from '@/lib/env';
import { getIndexableRoutes } from '@/seo/routes';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'SEO' };

export default async function SeoPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser('seo.manage');
  const sp = await searchParams;
  const editing = first(sp.yol) ?? '';
  const [routes, entries] = await Promise.all([getIndexableRoutes(), db.select().from(seoEntries)]);
  const byPath = new Map(entries.map((e) => [e.path, e]));
  const current = byPath.get(editing);
  const hidden = entries.filter((e) => e.noindex || e.excludeFromSitemap);

  return (
    <>
      <PageHeader
        title="SEO Yönetimi"
        description="Başlık ve açıklamalar her içerik türünün kendi düzenleme ekranındaki alanlardan ve merkezi şablondan üretilir. Buradan herhangi bir sayfa için elle geçersiz kılma tanımlayabilirsiniz. Canonical varsayılan olarak sayfanın kendi adresidir."
        actions={<Link href="/sitemap.xml" target="_blank" className="text-sm font-semibold text-ocean-700 underline underline-offset-4">sitemap.xml ↗</Link>}
      />
      <Flash searchParams={searchParams} />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Table head={['Sayfa', 'Tür', 'Geçersiz kılma', '']}>
            {routes.map((r) => {
              const o = byPath.get(r.path);
              return (
                <tr key={r.path}>
                  <td className="font-mono text-xs text-navy-900">{r.path}</td>
                  <td className="text-muted">{r.group}</td>
                  <td>{o ? <StatusPill tone="blue">Tanımlı</StatusPill> : <span className="text-muted">Şablon</span>}</td>
                  <td><Link href={`/admin/seo?yol=${encodeURIComponent(r.path)}`} className="font-semibold text-ocean-700 underline-offset-4 hover:underline">Düzenle</Link></td>
                </tr>
              );
            })}
          </Table>
          {hidden.length > 0 && (
            <Card title="Dizin dışı / site haritası dışı sayfalar" className="mt-6">
              <ul className="space-y-2 text-sm">
                {hidden.map((e) => (
                  <li key={e.path} className="flex items-center justify-between gap-4">
                    <span className="font-mono text-xs">{e.path}</span>
                    <span className="flex gap-2">
                      {e.noindex && <StatusPill tone="red">noindex</StatusPill>}
                      {e.excludeFromSitemap && <StatusPill tone="amber">sitemap dışı</StatusPill>}
                      <Link href={`/admin/seo?yol=${encodeURIComponent(e.path)}`} className="font-semibold text-ocean-700">Düzenle</Link>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <Card title={editing ? `Geçersiz kılma: ${editing}` : 'Sayfa için geçersiz kılma'} description="Boş bırakılan alanlar merkezi şablondan üretilir." className="lg:sticky lg:top-6 lg:self-start">
          <form action={saveSeoAction} className="grid gap-4" key={editing}>
            <Input label="Sayfa yolu" name="path" defaultValue={editing} required placeholder="/ev-boyama" />
            <Input label="Başlık (title)" name="title" defaultValue={current?.title ?? ''} hint="Marka eklenmez; tam başlığı yazın." />
            <Textarea label="Açıklama (description)" name="description" rows={3} defaultValue={current?.description ?? ''} className="font-sans" />
            <Input label="Canonical" name="canonical" defaultValue={current?.canonical ?? ''} placeholder={`${env.SITE_URL}${editing}`} hint="Yalnızca içerik başka bir adresin kopyasıysa doldurun." />
            <Input label="Paylaşım görseli (OG)" name="ogImage" defaultValue={current?.ogImage ?? ''} placeholder="/media/…" />
            <Checkbox label="Arama motorlarına kapat (noindex)" name="noindex" defaultChecked={current?.noindex} hint="Sayfa site haritasından da çıkarılır." />
            <Checkbox label="Site haritasına ekleme" name="excludeFromSitemap" defaultChecked={current?.excludeFromSitemap} />
            <div className="flex items-center justify-between">
              {current ? <ConfirmButton title="Geçersiz kılma kaldırılsın mı?" text="Sayfa merkezi şablon değerlerine döner." confirmLabel="Kaldır">Kaldır</ConfirmButton> : <span />}
              <SubmitButton />
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
