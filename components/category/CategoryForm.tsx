'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { categorySchema, type CategoryInput } from '@/schemas/category';
import { client } from '@/lib/amplify-client';
import type { Schema } from '@/amplify/data/resource';
import { FormField } from '@/components/forms/FormField';
import ImageUpload from '@/components/forms/ImageUpload';
import Button from '@/components/ui/Button';

type Category = Schema['Category']['type'];

type CategoryFormProps = {
  defaultValues?: Partial<CategoryInput & { imageUrl?: string; imageBase64?: string }>;
  category?: Category;
  onSubmit: (data: CategoryInput) => Promise<void>;
  submitLabel?: string;
};

export default function CategoryForm({ defaultValues, category, onSubmit, submitLabel = '保存' }: CategoryFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [serverError, setServerError] = useState('');

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
    client.models.Category.list().then(({ data }) => setCategories(data));
  }, []);

  const handleFormSubmit = async (data: CategoryInput) => {
    setServerError('');
    try {
      await onSubmit(data);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : '保存に失敗しました');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">
      {serverError && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">親カテゴリ</label>
        <select
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          {...register('parentId')}
        >
          <option value="">-- なし（ルートカテゴリ）--</option>
          {categories
            .filter((c) => c.id !== category?.id)
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
