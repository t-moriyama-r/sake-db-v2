'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryForm } from '@/components/pages/category/CategoryForm/CategoryForm';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/amplify-client';
import { convertFileToBase64 } from '@/lib/client/fileUtils';
import { routes } from '@/lib/routes';
import type { SerializableCategoryRecord } from '@/lib/server/categories/fetch';
import { revalidateCategoriesCache } from '@/lib/server/categories/revalidate';
import type { CategoryInput } from '@/schemas/category';

type Props = {
  categoryId?: string;
  category?: SerializableCategoryRecord;
  categories: SerializableCategoryRecord[];
};

export const CategoryEdit = ({ categoryId, category, categories }: Props) => {
  const router = useRouter();
  const { user, isLogin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isLogin) {
      router.replace(routes.home());
    }
  }, [isLoading, isLogin, router]);

  const handleSubmit = async (data: CategoryInput) => {
    if (!user) return;
    let imageBase64: string | undefined = category?.imageBase64 ?? undefined;
    if (data.image) {
      imageBase64 = await convertFileToBase64(data.image);
    }
    if (categoryId && category) {
      await client.models.CategoryHistory.create({
        categoryId,
        name: category.name,
        parentId: category.parentId ?? undefined,
        description: category.description ?? undefined,
        imageUrl: category.imageUrl ?? undefined,
        imageBase64: category.imageBase64 ?? undefined,
        versionNo: category.versionNo ?? 0,
        updateUserId: category.updateUserId ?? undefined,
        updateUserName: category.updateUserName ?? undefined,
      });

      await client.models.Category.update({
        id: categoryId,
        name: data.name,
        parentId: data.parentId || undefined,
        description: data.description ?? undefined,
        imageBase64,
        versionNo: (category.versionNo ?? 0) + 1,
        updateUserId: user.id,
        updateUserName: user.name,
      });
      await revalidateCategoriesCache();
      router.push(routes.category.detail(categoryId));
    } else {
      await client.models.Category.create({
        name: data.name,
        parentId: data.parentId || undefined,
        description: data.description ?? undefined,
        imageBase64,
        readonly: false,
        versionNo: 1,
        createUserId: user.id,
        createUserName: user.name,
        updateUserId: user.id,
        updateUserName: user.name,
      });
      await revalidateCategoriesCache();
      router.push(routes.admin());
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        {category ? 'カテゴリを編集' : 'カテゴリを作成'}
      </h1>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <CategoryForm
          categories={categories}
          category={category}
          defaultValues={
            category
              ? {
                  parentId: category.parentId ?? '',
                  name: category.name,
                  description: category.description ?? '',
                  imageUrl: category.imageUrl ?? '',
                  imageBase64: category.imageBase64 ?? '',
                }
              : undefined
          }
          onSubmit={handleSubmit}
          submitLabel={category ? '更新する' : '作成する'}
        />
      </div>
    </div>
  );
};


