'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { boardPostSchema, type BoardPostInput } from '@/schemas/board';
import { FormField } from '@/components/forms/FormField';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';

type BoardPostFormProps = {
  onSubmit: (data: BoardPostInput) => Promise<void>;
  defaultValues?: Partial<BoardPostInput>;
  submitLabel?: string;
};

export const BoardPostForm = ({ onSubmit, defaultValues, submitLabel = '投稿' }: BoardPostFormProps) => {
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
      youtube: defaultValues?.youtube ?? '',
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
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">評価</span>
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
        <p className="text-xs text-gray-500">クリックで選択・再クリックで解除</p>
      </div>

      <FormField
        as="textarea"
        label="コメント"
        required
        rows={3}
        placeholder="感想を書いてください"
        error={errors.text?.message}
        {...register('text')}
      />

      <FormField
        label="YouTube URL（任意）"
        type="url"
        placeholder="https://youtube.com/watch?v=..."
        error={errors.youtube?.message}
        {...register('youtube')}
      />

      <Button type="submit" loading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
