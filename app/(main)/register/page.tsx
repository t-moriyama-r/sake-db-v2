import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm/RegisterForm';

export const metadata: Metadata = { title: '新規登録' };

export default function RegisterPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-foreground">新規登録</h1>
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
