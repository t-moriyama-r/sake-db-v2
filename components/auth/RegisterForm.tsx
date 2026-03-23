'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { registerSchema, type RegisterInput } from '@/schemas/auth';
import { useAuth } from '@/hooks/useAuth';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';

type Step = 'form' | 'confirm';

export const RegisterForm = () => {
  const router = useRouter();
  const { register: registerUser, confirmSignUp } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [serverError, setServerError] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [confirming, setConfirming] = useState(false);

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
      setStep('confirm');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登録に失敗しました';
      if (msg.includes('UsernameExistsException') || msg.includes('already exists')) {
        setServerError('このメールアドレスはすでに登録されています');
      } else {
        setServerError(msg);
      }
    }
  };

  const handleConfirm = async () => {
    setServerError('');
    setConfirming(true);
    try {
      await confirmSignUp({ username: email, confirmationCode: confirmCode });
      router.push('/auth/login');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : '確認に失敗しました');
    } finally {
      setConfirming(false);
    }
  };

  if (step === 'confirm') {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          <strong>{email}</strong> に確認コードを送信しました。メールを確認して入力してください。
        </p>
        {serverError && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>
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
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>
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
        hint="7文字以上"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" loading={isSubmitting} className="w-full">
        新規登録
      </Button>

      <p className="text-center text-sm text-gray-500">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          ログイン
        </Link>
      </p>
    </form>
  );
}
