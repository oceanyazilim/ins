import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Logo } from '@/components/site/header';
import { loginAction } from '@/features/admin/actions';
import { SubmitButton } from '@/features/admin/client';
import { Flash, Input, type SearchParams } from '@/features/admin/ui';
import { getCurrentUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Giriş' };

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  if (await getCurrentUser()) redirect('/admin');
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-(--radius-xl) border border-line bg-white p-8 shadow-(--shadow-card)">
        <Logo className="mx-auto h-18" />
        <h1 className="mt-2 text-center font-display text-xl font-extrabold text-navy-900">Yönetim Paneli</h1>
        <div className="mt-6">
          <Flash searchParams={searchParams} />
        </div>
        <form action={loginAction} className="grid gap-4">
          <Input label="E-posta" name="email" type="email" autoComplete="username" required />
          <Input label="Parola" name="password" type="password" autoComplete="current-password" required />
          <SubmitButton>Giriş yap</SubmitButton>
        </form>
      </div>
    </main>
  );
}
