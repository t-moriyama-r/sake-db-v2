'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/amplify-client';
import type { Schema } from '@/amplify/data/resource';
import type { CategoryInput } from '@/schemas/category';
import { CategoryForm } from '@/components/category/CategoryForm';
import { Spinner } from '@/components/ui/Spinner';

type Category = Schema['Category']['type'];

export const CategoryEditPage = () => {
  const params = useParams();
  const categoryId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(!!categoryId);

  useEffect(() => {
    if (!isAdmin) { router.replace('/'); return; }
    if (!categoryId) { setLoading(false); return; }
    client.models.Category.get({ id: categoryId })
      .then(({ data }) => {
        if (!data) { router.replace('/admin'); return; }
        setCategory(data);
      })
      .finally(() => setLoading(false));
  }, [categoryId, isAdmin, router]);

  const handleSubmit = async (data: CategoryInput) => {
    if (!user) return;
    if (categoryId && category) {
      // 履歴を保存
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
        versionNo: (category.versionNo ?? 0) + 1,
        updateUserId: user.id,
        updateUserName: user.name,
      });
      router.push(`/category/${categoryId}`);
    } else {
      // 新規作成
      await client.models.Category.create({
        name: data.name,
        parentId: data.parentId || undefined,
        description: data.description ?? undefined,
        readonly: false,
        versionNo: 1,
        createUserId: user.id,
        createUserName: user.name,
        updateUserId: user.id,
        updateUserName: user.name,
      });
      router.push('/admin');
    }
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {category ? 'カテゴリを編集' : 'カテゴリを作成'}
      </h1>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <CategoryForm
          category={category ?? undefined}
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
}
