'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { liquorSchema, type LiquorInput } from '@/schemas/liquor';
import { client } from '@/lib/amplify-client';
import type { Schema } from '@/amplify/data/resource';
import { FormField } from '@/components/forms/FormField/FormField';
import { ImageUpload } from '@/components/forms/ImageUpload/ImageUpload';
import { Button } from '@/components/ui/Button/Button';

type Category = Schema['Category']['type'];
type Liquor = Schema['Liquor']['type'];

type LiquorFormProps = {
  defaultValues?: Partial<LiquorInput & { imageUrl?: string; imageBase64?: string }>;
  liquor?: Liquor;
  onSubmit: (data: LiquorInput) => Promise<void>;
  submitLabel?: string;
};

export const LiquorForm = ({ defaultValues, liquor, onSubmit, submitLabel = '保存' }: LiquorFormProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LiquorInput>({
    resolver: zodResolver(liquorSchema),
    defaultValues: {
      categoryId: defaultValues?.categoryId ?? '',
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      youtube: defaultValues?.youtube ?? '',
    },
  });

  useEffect(() => {
    client.models.Category.list().then(({ data }) => setCategories(data));
  }, []);

  const handleFormSubmit = async (data: LiquorInput) => {
    setServerError('');
    try {
      await onSubmit(data);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : '保存に失敗しました');
    }
  };

  const selectClass =
    'w-full rounded-md border border-border-input bg-surface px-3 py-2 text-sm text-foreground ' +
    'focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">
      {serverError && (
        <div className="rounded-md bg-destructive-subtle px-4 py-3 text-sm text-destructive-subtle-foreground">{serverError}</div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground-secondary">
          カテゴリ <span className="text-destructive">*</span>
        </label>
        <select className={selectClass} {...register('categoryId')}>
          <option value="">-- カテゴリを選択 --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
      </div>

      <FormField
        label="お酒の名前"
        type="text"
        required
        error={errors.name?.message}
        {...register('name')}
      />

      <FormField
        as="textarea"
        label="説明"
        error={errors.description?.message}
        rows={4}
        {...register('description')}
      />

      <FormField
        label="YouTube URL"
        type="url"
        placeholder="https://youtube.com/watch?v=..."
        error={errors.youtube?.message}
        {...register('youtube')}
      />

      <Controller
        name="image"
        control={control}
        render={({ field }) => (
          <ImageUpload
            label="画像"
            currentImageUrl={liquor?.imageUrl}
            currentImageBase64={liquor?.imageBase64}
            onChange={(f) => field.onChange(f)}
            error={errors.image?.message as string}
          />
        )}
      />

      <Button type="submit" loading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
