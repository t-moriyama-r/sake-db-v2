'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { FormField } from '@/components/forms/FormField/FormField';
import { ImageUpload } from '@/components/forms/ImageUpload/ImageUpload';
import { Button } from '@/components/ui/Button/Button';
import { client } from '@/lib/amplify-client';
import { collectDescendantIds } from '@/lib/server/categories/fetch';
import type { SerializableCategoryRecord } from '@/lib/server/categories/fetch';
import { categorySchema, type CategoryInput } from '@/schemas/category';

type Props = {
  defaultValues?: Partial<CategoryInput & { imageUrl?: string; imageBase64?: string }>;
  category?: SerializableCategoryRecord;
  onSubmit: (data: CategoryInput) => Promise<void>;
  submitLabel?: string;
};

export const CategoryForm = ({ defaultValues, category, onSubmit, submitLabel = '保存' }: Props) => {
  const [categories, setCategories] = useState<SerializableCategoryRecord[]>([]);
  const [serverError, setServerError] = useState<string>('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      parentId: defaultValues?.parentId ?? '',
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
    },
  });

  useEffect(() => {
    client.models.Category.list().then(({ data }) =>
      setCategories(JSON.parse(JSON.stringify(data)) as SerializableCategoryRecord[])
    );
  }, []);

  const handleFormSubmit = async (data: CategoryInput) => {
    setServerError('');
    try {
      await onSubmit(data);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : '保存に失敗しました');
    }
  };

  const excludeIds = category
    ? new Set([category.id, ...collectDescendantIds(category.id, categories)])
    : new Set<string>();

  const selectClass =
    'w-full rounded-md border border-border-input bg-surface px-3 py-2 text-sm text-foreground ' +
    'focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">
      {serverError && (
        <div className="rounded-md bg-destructive-subtle px-4 py-3 text-sm text-destructive-subtle-foreground">{serverError}</div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground-secondary">親カテゴリ</label>
        <select className={selectClass} {...register('parentId')}>
          <option value="">-- なし（ルートカテゴリ）--</option>
          {categories
            .filter((c) => !excludeIds.has(c.id))
            .map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
        </select>
      </div>

      <FormField
        label="カテゴリ名"
        type="text"
        required
        error={errors.name?.message}
        {...register('name')}
      />

      <FormField
        as="textarea"
        label="説明"
        error={errors.description?.message}
        rows={3}
        {...register('description')}
      />

      <Controller
        name="image"
        control={control}
        render={({ field }) => (
          <ImageUpload
            label="画像"
            currentImageUrl={category?.imageUrl}
            currentImageBase64={category?.imageBase64}
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
