import type { Metadata } from 'next';
import { PasswordResetExeForm } from '@/components/auth/PasswordResetExeForm/PasswordResetExeForm';

export const metadata: Metadata = { title: 'パスワード再設定' };

export default function PasswordResetExePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <PasswordResetExeForm />
    </div>
  );
}
