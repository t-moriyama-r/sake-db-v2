'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { loginSchema, type LoginInput } from '@/schemas/auth';
import { useAuth } from '@/hooks/useAuth';
import { FormField } from '@/components/forms/FormField';
import Button from '@/components/ui/Button';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError('');
    try {
      await login(data.email, data.password);
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ログインに失敗しました';
      if (msg.includes('NotAuthorizedException') || msg.includes('Incorrect')) {
        setServerError('メールアドレスまたはパスワードが正しくありません');
      } else if (msg.includes('UserNotFoundException') || msg.includes('UserNotFound')) {
        setServerError('アカウントが見つかりません');
      } else {
        setServerError(msg);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>
      )}

      <FormField
        label="メールアドレス"
        type="email"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register('email')}
      />

      <FormField
        label="パスワード"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" loading={isSubmitting} className="w-full">
        ログイン
      </Button>

      <div className="flex flex-col items-center gap-1 text-sm">
        <Link href="/auth/password-reset" className="text-blue-600 hover:underline">
          パスワードを忘れた方
        </Link>
        <p className="text-gray-500">
          アカウントをお持ちでない方は{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </form>
  );
}
