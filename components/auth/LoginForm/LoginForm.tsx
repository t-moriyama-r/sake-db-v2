'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { XLoginButton } from '@/components/auth/XLoginButton/XLoginButton';
import { FormField } from '@/components/forms/FormField/FormField';
import { Button } from '@/components/ui/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { toJapaneseAuthError } from '@/lib/auth/errors';
import { routes } from '@/lib/routes';
import { loginSchema, type LoginInput } from '@/schemas/auth';

export const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError('');
    try {
      await login(data.email, data.password);
      router.push(routes.home());
      router.refresh();
    } catch (err: unknown) {
      setServerError(toJapaneseAuthError(err, 'ログインに失敗しました'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError && (
        <div className="rounded-md bg-destructive-subtle px-4 py-3 text-sm text-destructive-subtle-foreground">{serverError}</div>
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

      <div className="relative flex items-center gap-3">
        <hr className="flex-1 border-border" />
        <span className="text-xs text-muted-foreground">または</span>
        <hr className="flex-1 border-border" />
      </div>

      <XLoginButton />

      <div className="flex flex-col items-center gap-1 text-sm">
        <Link href="/auth/password-reset" className="text-link hover:underline">
          パスワードを忘れた方
        </Link>
        <p className="text-muted-foreground">
          アカウントをお持ちでない方は{' '}
          <Link href="/auth/register" className="text-link hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </form>
  );
}
