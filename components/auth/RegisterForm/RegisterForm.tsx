'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/forms/FormField/FormField';
import { Button } from '@/components/ui/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { toJapaneseAuthError } from '@/lib/auth/errors';
import { routes } from '@/lib/routes';
import { registerSchema, type RegisterInput } from '@/schemas/auth';

type Step = 'form' | 'confirm';

export const RegisterForm = () => {
  const router = useRouter();
  const { register: registerUser, confirmSignUp, login } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [serverError, setServerError] = useState<string>('');
  const [confirmCode, setConfirmCode] = useState<string>('');
  const [confirming, setConfirming] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setServerError('');
    try {
      await registerUser(data.name, data.email, data.password);
      setEmail(data.email);
      setPassword(data.password);
      setStep('confirm');
    } catch (err: unknown) {
      setServerError(toJapaneseAuthError(err, '登録に失敗しました'));
    }
  };

  const handleConfirm = async () => {
    setServerError('');
    setConfirming(true);
    try {
      await confirmSignUp({ username: email, confirmationCode: confirmCode });
      await login(email, password);
      router.push(routes.home());
      router.refresh();
    } catch (err: unknown) {
      setServerError(toJapaneseAuthError(err, '確認に失敗しました'));
    } finally {
      setConfirming(false);
    }
  };

  if (step === 'confirm') {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-foreground-secondary">
          <strong>{email}</strong> に確認コードを送信しました。メールを確認して入力してください。
        </p>
        {serverError && (
          <div className="rounded-md bg-destructive-subtle px-4 py-3 text-sm text-destructive-subtle-foreground">{serverError}</div>
        )}
        <FormField
          label="確認コード"
          type="text"
          value={confirmCode}
          onChange={(e) => setConfirmCode((e.target as HTMLInputElement).value)}
          required
        />
        <Button onClick={handleConfirm} loading={confirming} className="w-full">
          確認する
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError && (
        <div className="rounded-md bg-destructive-subtle px-4 py-3 text-sm text-destructive-subtle-foreground">{serverError}</div>
      )}

      <FormField
        label="名前"
        type="text"
        autoComplete="name"
        required
        error={errors.name?.message}
        {...register('name')}
      />

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
        autoComplete="new-password"
        required
        hint="8文字以上"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" loading={isSubmitting} className="w-full">
        新規登録
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        すでにアカウントをお持ちの方は{' '}
        <Link href={routes.auth.login()} className="text-link hover:underline">
          ログイン
        </Link>
      </p>
    </form>
  );
}
