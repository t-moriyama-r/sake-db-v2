'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { userEditSchema, type UserEditInput } from '@/schemas/auth';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export const MyPageEditPage = () => {
  const router = useRouter();
  const { user, isLogin, isLoading, updateUserAttributes, updatePassword, reload } = useAuth();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserEditInput>({ resolver: zodResolver(userEditSchema) });

  useEffect(() => {
    if (!isLoading && !isLogin) { router.replace('/auth/login'); return; }
    if (user) {
      reset({ name: user.name, email: user.email, profile: user.profile ?? '' });
    }
  }, [user, isLogin, isLoading, reset, router]);

  const onSubmit = async (data: UserEditInput) => {
    if (!user) return;
    setServerError('');
    setSuccess(false);
    try {
      await updateUserAttributes({
        userAttributes: {
          name: data.name,
          email: data.email,
          ...(data.profile !== undefined ? { profile: data.profile } : {}),
        },
      });
      if (data.password) {
        await updatePassword({ oldPassword: '', newPassword: data.password });
      }
      await reload();
      setSuccess(true);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : '更新に失敗しました');
    }
  };

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">プロフィール編集</h1>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {serverError && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">更新しました</div>
          )}

          <FormField label="名前" type="text" required error={errors.name?.message} {...register('name')} />
          <FormField label="メールアドレス" type="email" required error={errors.email?.message} {...register('email')} />
          <FormField as="textarea" label="プロフィール" rows={3} error={errors.profile?.message} {...register('profile')} />
          <FormField
            label="新しいパスワード（変更する場合のみ）"
            type="password"
            hint="7文字以上"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex gap-2">
            <Button type="submit" loading={isSubmitting}>保存する</Button>
            <Button type="button" variant="secondary" onClick={() => router.push('/mypage')}>キャンセル</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
