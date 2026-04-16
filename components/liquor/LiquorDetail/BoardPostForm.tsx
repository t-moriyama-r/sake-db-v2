'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { boardPostSchema, type BoardPostInput } from '@/schemas/board';
import { FormField } from '@/components/forms/FormField/FormField';
import { StarRating } from '@/components/ui/StarRating/StarRating';
import { Button } from '@/components/ui/Button/Button';

type Props = {
  onSubmit: (data: BoardPostInput) => Promise<void>;
  defaultValues?: Partial<BoardPostInput>;
  submitLabel?: string;
  isLoggedIn?: boolean;
};

export function BoardPostForm({ onSubmit, defaultValues, submitLabel = '投稿', isLoggedIn }: Props) {
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BoardPostInput>({
    resolver: zodResolver(boardPostSchema),
    defaultValues: {
      text: defaultValues?.text ?? '',
      rate: defaultValues?.rate ?? null,
      guestName: defaultValues?.guestName ?? '',
    },
  });

  const handleFormSubmit = async (data: BoardPostInput) => {
    setServerError('');
    try {
      await onSubmit(data);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : '投稿に失敗しました');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      {serverError && (
        <div className="rounded-md bg-destructive-subtle px-4 py-3 text-sm text-destructive-subtle-foreground">{serverError}</div>
      )}

      {!isLoggedIn && (
        <FormField
          label="ニックネーム（任意）"
          placeholder="名無し"
          error={errors.guestName?.message}
          {...register('guestName')}
        />
      )}

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground-secondary">評価</span>
        <Controller
          name="rate"
          control={control}
          render={({ field }) => (
            <StarRating
              value={field.value ?? 0}
              onChange={(v) => field.onChange(field.value === v ? null : v)}
            />
          )}
        />
        <p className="text-xs text-muted-foreground">クリックで選択・再クリックで解除</p>
      </div>

      <FormField
        as="textarea"
        label="コメント"
        required
        rows={3}
        autoFocus
        placeholder="感想を書いてください"
        error={errors.text?.message}
        {...register('text')}
      />

      <Button type="submit" loading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
