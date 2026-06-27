'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/forms/FormField/FormField';
import { ImageUpload } from '@/components/forms/ImageUpload/ImageUpload';
import { Button } from '@/components/ui/Button/Button';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { toJapaneseAuthError } from '@/lib/auth/errors';
import { routes } from '@/lib/routes';
import { userEditSchema, type UserEditInput } from '@/schemas/auth';

export function MyPageEditForm() {
  const router = useRouter();
  const { user, isLogin, isLoading, updateUserAttributes, updatePassword, reload } = useAuth();
  const [serverError, setServerError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDeleted, setImageDeleted] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserEditInput>({ resolver: zodResolver(userEditSchema) });

  useEffect(() => {
    if (!isLoading && !isLogin) { router.replace(routes.auth.login()); return; }
    if (user) {
      reset({ name: user.name, email: user.email, profile: user.profile ?? '' });
    }
  }, [user, isLogin, isLoading, reset, router]);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setImageDeleted(file === null);
  };

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
          ...(imageFile
            ? { 'custom:imageBase64': await toBase64(imageFile) }
            : imageDeleted
              ? { 'custom:imageBase64': '' }
              : {}),
        },
      });
      if (data.password && data.currentPassword) {
        await updatePassword({ oldPassword: data.currentPassword, newPassword: data.password });
      }
      await reload();
      setSuccess(true);
    } catch (err: unknown) {
      setServerError(toJapaneseAuthError(err, '更新に失敗しました'));
    }
  };

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">プロフィール編集</h1>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {serverError && (
            <div className="rounded-md bg-destructive-subtle px-4 py-3 text-sm text-destructive-subtle-foreground">{serverError}</div>
          )}
          {success && (
            <div className="rounded-md bg-success-subtle px-4 py-3 text-sm text-success-subtle-foreground">更新しました</div>
          )}

          <ImageUpload
            label="アイコン画像"
            currentImageBase64={user?.imageBase64}
            onChange={handleImageChange}
          />

          <FormField label="名前" type="text" required error={errors.name?.message} {...register('name')} />
          <FormField label="メールアドレス" type="email" required error={errors.email?.message} {...register('email')} />
          <FormField as="textarea" label="プロフィール" rows={3} error={errors.profile?.message} {...register('profile')} />
          <FormField
            label="現在のパスワード（パスワードを変更する場合のみ）"
            type="password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <FormField
            label="新しいパスワード（変更する場合のみ）"
            type="password"
            hint="8文字以上"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex gap-2">
            <Button type="submit" loading={isSubmitting}>保存する</Button>
            <Button type="button" variant="secondary" onClick={() => router.push(routes.mypage.index())}>キャンセル</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
