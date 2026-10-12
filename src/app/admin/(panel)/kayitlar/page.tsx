import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { db } from '@/db';
import { auditLogs, users } from '@/db/schema';
import { PageHeader, Table } from '@/features/admin/ui';
import { formatDateTime } from '@/lib/format';
import { requireUser } from '@/server/auth';

export const metadata: Metadata = { title: 'İşlem Kayıtları' };

export default async function AuditPage() {
  await requireUser('audit.view');
  const rows = await db.select({ log: auditLogs, user: users.name }).from(auditLogs).leftJoin(users, eq(users.id, auditLogs.userId)).orderBy(desc(auditLogs.createdAt)).limit(300);
  return (
    <>
      <PageHeader title="İşlem Kayıtları" description="Yönetim panelinde yapılan son 300 işlem: girişler, fiyat değişiklikleri, içerik ve ayar güncellemeleri." />
      <Table head={['Tarih', 'Kullanıcı', 'İşlem', 'Özet']} empty={rows.length === 0}>
        {rows.map(({ log, user }) => (
          <tr key={log.id}>
            <td className="whitespace-nowrap text-muted">{formatDateTime(log.createdAt)}</td>
            <td>{user ?? 'Sistem'}</td>
            <td className="font-mono text-xs">{log.action}</td>
            <td className="text-navy-900">{log.summary}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
