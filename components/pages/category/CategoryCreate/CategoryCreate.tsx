'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryForm } from '@/components/pages/category/CategoryForm/CategoryForm';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/amplify-client';
import { routes } from '@/lib/routes';
import type { CategoryInput } from '@/schemas/category';

type Props = {
  parentCategoryId: string;
};

export const CategoryCreate = ({ parentCategoryId }: Props) => {
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
          defaultValues={{ parentId: parentCategoryId }}
          onSubmit={handleSubmit}
          submitLabel="作成する"
        />
      </div>
    </div>
  );
};

async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

