"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { FormField } from '@/components/forms/FormField/FormField';
import { ImageUpload } from '@/components/forms/ImageUpload/ImageUpload';
import { Button } from '@/components/ui/Button/Button';
import { liquorSchema, type LiquorInput } from '@/schemas/liquor';
import type { SerializableCategoryRecord } from '@/lib/server/categories/fetch';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
import { CategoryCascadeSelect } from './CategoryCascadeSelect';

type Props = {
  categories: SerializableCategoryRecord[];
  defaultValues?: Partial<LiquorInput>;
  liquor?: SerializableLiquorRecord;
  onSubmitAction: (data: LiquorInput) => Promise<void>;
};
export function LiquorFormFields({ categories, defaultValues, liquor, onSubmitAction }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LiquorInput>({
    resolver: zodResolver(liquorSchema),
    defaultValues: getDefaultValues(defaultValues),
  });

  return (
    <form onSubmit={handleSubmit(onSubmitAction)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground-secondary">
          カテゴリ <span className="text-destructive">*</span>
        </label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <CategoryCascadeSelect
              categories={categories}
              value={field.value}
              onChange={field.onChange}
              error={errors.categoryId?.message}
            />
          )}
        />
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
        {liquor ? '更新する' : '登録する'}
      </Button>
    </form>
  );
}


function getDefaultValues(defaultValues?: Props['defaultValues']): LiquorInput {
  return {
    categoryId: defaultValues?.categoryId ?? '',
    name: defaultValues?.name ?? '',
    description: defaultValues?.description ?? '',
    youtube: defaultValues?.youtube ?? '',
  };
}
