import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm/LoginForm';

export const metadata: Metadata = { title: 'ログイン' };

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-foreground">ログイン</h1>
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
