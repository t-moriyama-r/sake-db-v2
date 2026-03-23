'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/amplify-client';
import type { CategoryInput } from '@/schemas/category';
import { CategoryForm } from '@/components/category/CategoryForm';

export default function CategoryCreatePage() {
  const { parentCategoryId } = useParams<{ parentCategoryId: string }>();
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  if (!isAdmin) {
    router.replace('/');
    return null;
  }

  const handleSubmit = async (data: CategoryInput) => {
    await client.models.Category.create({
      name: data.name,
      parentId: data.parentId || parentCategoryId || undefined,
      description: data.description ?? undefined,
      readonly: false,
      createUserId: user?.id,
      createUserName: user?.name,
      updateUserId: user?.id,
      updateUserName: user?.name,
      versionNo: 1,
    });
    router.push(parentCategoryId ? `/category/${parentCategoryId}` : '/admin');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">カテゴリを作成</h1>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <CategoryForm
          defaultValues={{ parentId: parentCategoryId }}
          onSubmit={handleSubmit}
          submitLabel="作成する"
        />
      </div>
    </div>
  );
}
