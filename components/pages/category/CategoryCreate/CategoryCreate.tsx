'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryForm } from '@/components/pages/category/CategoryForm/CategoryForm';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/amplify-client';
import { convertFileToBase64 } from '@/lib/client/fileUtils';
import { routes } from '@/lib/routes';
import type { SerializableCategoryRecord } from '@/lib/server/categories/fetch';
import type { CategoryInput } from '@/schemas/category';

type Props = {
  parentCategoryId: string;
  categories: SerializableCategoryRecord[];
};

export const CategoryCreate = ({ parentCategoryId, categories }: Props) => {
  const router = useRouter();
  const { user, isLogin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isLogin) {
      router.replace(routes.home());
    }
  }, [isLoading, isLogin, router]);

  const handleSubmit = async (data: CategoryInput) => {
    let imageBase64: string | undefined;
    if (data.image) {
      imageBase64 = await convertFileToBase64(data.image);
    }
    await client.models.Category.create({
      name: data.name,
      parentId: data.parentId || parentCategoryId || undefined,
      description: data.description ?? undefined,
      imageBase64,
      readonly: false,
      createUserId: user?.id,
      createUserName: user?.name,
      updateUserId: user?.id,
      updateUserName: user?.name,
      versionNo: 1,
    });
    router.push(parentCategoryId ? routes.category.detail(parentCategoryId) : routes.admin());
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">カテゴリを作成</h1>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <CategoryForm
          categories={categories}
          defaultValues={{ parentId: parentCategoryId }}
          onSubmit={handleSubmit}
          submitLabel="作成する"
        />
      </div>
    </div>
  );
};


