'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { passwordResetExeSchema, type PasswordResetExeInput } from '@/schemas/auth';
import { FormField } from '@/components/forms/FormField/FormField';
import { Button } from '@/components/ui/Button/Button';

export default function PasswordResetExePage() {
  const router = useRouter();
  const { confirmResetPassword } = useAuth();
  const [serverError, setServerError] = useState('');
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetExeInput>({ resolver: zodResolver(passwordResetExeSchema) });

  const onSubmit = async (data: PasswordResetExeInput) => {
    setServerError('');
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: data.code,
        newPassword: data.password,
      });
      router.push('/auth/login');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-foreground">パスワード再設定</h1>
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {serverError && (
              <div className="rounded-md bg-destructive-subtle px-4 py-3 text-sm text-destructive-subtle-foreground">{serverError}</div>
            )}
            <FormField
              label="メールアドレス"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            />
            <FormField
              label="確認コード"
              type="text"
              required
              error={errors.code?.message}
              {...register('code')}
            />
            <FormField
              label="新しいパスワード"
              type="password"
              required
              hint="7文字以上"
              error={errors.password?.message}
              {...register('password')}
            />
            <FormField
              label="新しいパスワード（確認）"
              type="password"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Button type="submit" loading={isSubmitting} className="w-full">
              パスワードを変更する
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
