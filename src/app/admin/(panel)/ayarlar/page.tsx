import { asc } from 'drizzle-orm';
import type { Metadata } from 'next';
import { db } from '@/db';
import { users } from '@/db/schema';
import { saveSettingsAction, saveUserAction, toggleUserAction } from '@/features/admin/actions';
import { SubmitButton } from '@/features/admin/client';
import { Card, Checkbox, Flash, Input, PageHeader, Select, StatusPill, Textarea, type SearchParams } from '@/features/admin/ui';
import { formatDateTime, formatPhone } from '@/lib/format';
import { requireUser } from '@/server/auth';
import { getSettings } from '@/server/data';

export const metadata: Metadata = { title: 'Ayarlar' };

const SOCIAL = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['linkedin', 'LinkedIn'], ['youtube', 'YouTube'], ['x', 'X']] as const;

export default async function SettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const me = await requireUser('settings.manage');
  const [s, userRows] = await Promise.all([getSettings(), db.select().from(users).orderBy(asc(users.id))]);

  return (
    <>
      <PageHeader title="Genel Ayarlar" description="İşletme bilgileri sitenin tamamında (üst ve alt bilgi, iletişim, yapılandırılmış veri, WhatsApp bağlantıları) bu ekrandan beslenir. Google İşletme Profili’ndeki bilgilerle aynı tutun." />
      <Flash searchParams={searchParams} />
      <form action={saveSettingsAction} className="grid gap-6 lg:grid-cols-2">
        <Card title="Şirket">
          <div className="grid gap-4">
            <Input label="Şirket adı" name="companyName" defaultValue={s.company.name} required />
            <Input label="Ticari unvan" name="legalName" defaultValue={s.company.legalName} />
            <Input label="Kuruluş yılı" name="foundingYear" type="number" defaultValue={s.company.foundingYear ?? ''} />
            <Textarea label="Kısa tanıtım" name="companyDescription" rows={3} defaultValue={s.company.description} className="font-sans" />
            <Input label="Üst bilgi çubuğu metni" name="announcement" defaultValue={s.announcement} />
          </div>
        </Card>
        <Card title="İletişim">
          <div className="grid gap-4">
            <Input label="Telefon" name="phone" defaultValue={formatPhone(s.contact.phone)} required />
            <Input label="WhatsApp numarası" name="whatsapp" defaultValue={s.contact.whatsapp ? formatPhone(`+${s.contact.whatsapp}`) : ''} hint="Boş bırakılırsa sitede WhatsApp bağlantısı gösterilmez." />
            <Textarea label="E-posta adresleri" name="emails" rows={2} defaultValue={s.contact.emails.join('\n')} className="font-sans" hint="Her satıra bir adres; ilki birincil adrestir." />
          </div>
        </Card>
        <Card title="Adres" description="Gerçek bir müşteri kabul adresi yoksa sokak adresini boş bırakın; hizmet bölgesi işletmesi olarak yalnızca ilçe gösterilir.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="İlçe" name="district" defaultValue={s.address.district} required />
            <Input label="İl" name="city" defaultValue={s.address.city} required />
            <Input label="Sokak adresi" name="street" defaultValue={s.address.street} wrapClass="sm:col-span-2" />
          </div>
          <div className="mt-4">
            <Checkbox label="Sokak adresini sitede ve yapılandırılmış veride göster" name="showStreet" defaultChecked={s.address.showStreet} />
          </div>
        </Card>
        <Card title="Çalışma saatleri" description="Kapalı günler için saatleri boş bırakın.">
          <div className="grid gap-3">
            {s.hours.map((h, i) => (
              <div key={h.days} className="grid grid-cols-[1fr_auto_auto] items-end gap-3">
                <p className="pb-2.5 text-sm font-semibold text-navy-900">{h.days}</p>
                <Input label="Açılış" name={`hours_${i}_opens`} type="time" defaultValue={h.opens ?? ''} />
                <Input label="Kapanış" name={`hours_${i}_closes`} type="time" defaultValue={h.closes ?? ''} />
              </div>
            ))}
          </div>
        </Card>
        <Card title="Sosyal bağlantılar" description="Yalnızca işletmeye ait gerçek hesapları girin; boş olanlar sitede gösterilmez.">
          <div className="grid gap-4">
            {SOCIAL.map(([k, label]) => (
              <Input key={k} label={label} name={`social_${k}`} type="url" defaultValue={s.social[k]} placeholder="https://" />
            ))}
          </div>
        </Card>
        <Card title="Ölçüm ve doğrulama">
          <div className="grid gap-4">
            <Input label="Google Analytics 4 ölçüm kimliği" name="ga4Id" defaultValue={s.analytics.ga4Id} placeholder="G-XXXXXXXXXX" hint="Analitik yalnızca ziyaretçi çerezlere izin verirse yüklenir." />
            <Input label="Search Console doğrulama kodu" name="gscVerification" defaultValue={s.analytics.gscVerification} hint="HTML etiketi yöntemindeki content değeri." />
          </div>
        </Card>
        <div className="lg:col-span-2">
          <SubmitButton>Ayarları kaydet</SubmitButton>
        </div>
      </form>

      <h2 className="mb-4 mt-12 font-display text-xl font-extrabold text-navy-900">Kullanıcılar</h2>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <ul className="divide-y divide-line rounded-(--radius-lg) border border-line bg-white">
          {userRows.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-semibold text-navy-900">{u.name} <span className="font-normal text-muted">· {u.email}</span></p>
                <p className="text-xs text-muted">{u.role === 'admin' ? 'Yönetici' : 'Editör'} · Son giriş: {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : '—'}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill tone={u.active ? 'green' : 'gray'}>{u.active ? 'Aktif' : 'Devre dışı'}</StatusPill>
                {u.id !== me.id && (
                  <form action={toggleUserAction}>
                    <input type="hidden" name="id" value={u.id} />
                    <button type="submit" className="font-semibold text-ocean-700 underline-offset-4 hover:underline">{u.active ? 'Devre dışı bırak' : 'Etkinleştir'}</button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
        <Card title="Kullanıcı ekle / parola yenile" description="Editörler içerik, medya ve talepleri yönetir; fiyat, bölge, SEO ve ayarlara erişemez.">
          <form action={saveUserAction} className="grid gap-4">
            <Input label="Ad soyad" name="name" required />
            <Input label="E-posta" name="email" type="email" required autoComplete="off" />
            <Input label="Parola" name="password" type="password" required minLength={12} autoComplete="new-password" hint="En az 12 karakter" />
            <Select label="Rol" name="role" options={[{ value: 'editor', label: 'Editör' }, { value: 'admin', label: 'Yönetici' }]} />
            <SubmitButton>Kaydet</SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
