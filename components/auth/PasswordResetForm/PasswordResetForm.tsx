'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/forms/FormField/FormField';
import { Button } from '@/components/ui/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { toJapaneseAuthError } from '@/lib/auth/errors';
import { passwordResetSchema, type PasswordResetInput } from '@/schemas/auth';

export function PasswordResetForm() {
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetInput>({ resolver: zodResolver(passwordResetSchema) });

  const onSubmit = async (data: PasswordResetInput) => {
    setServerError('');
    try {
      await resetPassword({ username: data.email });
      setSent(true);
    } catch (err: unknown) {
      setServerError(toJapaneseAuthError(err, 'パスワードリセットに失敗しました'));
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center">
        <p className="text-lg font-medium text-foreground">メールを送信しました</p>
        <p className="mt-2 text-sm text-muted-foreground">
          パスワードリセット用のメールをお送りしました。メール内のリンクをクリックしてください。
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-2 text-center text-2xl font-bold text-foreground">パスワードリセット</h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        登録したメールアドレスを入力してください
      </p>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {serverError && (
            <div className="rounded-md bg-destructive-subtle px-4 py-3 text-sm text-destructive-subtle-foreground">
              {serverError}
            </div>
          )}
          <FormField
            label="メールアドレス"
            type="email"
            autoComplete="email"
            required
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" loading={isSubmitting} className="w-full">
            送信する
          </Button>
        </form>
      </div>
    </div>
  );
}
