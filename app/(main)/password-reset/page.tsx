import type { Metadata } from 'next';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm/PasswordResetForm';

export const metadata: Metadata = { title: 'パスワードリセット' };

export default function PasswordResetPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <PasswordResetForm />
    </div>
  );
}
