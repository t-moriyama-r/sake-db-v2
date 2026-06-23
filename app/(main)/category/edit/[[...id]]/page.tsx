import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { CategoryEdit } from '@/components/pages/category/CategoryEdit/CategoryEdit';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { routes } from '@/lib/routes';
import { getServerUser } from '@/lib/server/auth';
import { fetchAllCategories, fetchCategory } from '@/lib/server/categories/fetch';

export default async function CategoryEditPage({
  params,
}: {
  params: Promise<{ id?: string[] }>;
}) {
  const { id } = await params;
  const categoryId = id?.[0];

  const user = await getServerUser();
  if (!user) return redirect(routes.home());

  const [category, categories] = await Promise.all([
    categoryId ? fetchCategory(categoryId) : Promise.resolve(undefined),
    fetchAllCategories(),
  ]);
  if (categoryId && !category) return redirect(routes.admin());

  return (
    <Suspense fallback={<div className="flex justify-center py-32"><Spinner size="lg" /></div>}>
      <CategoryEdit
        categoryId={categoryId}
        category={category ?? undefined}
        categories={categories}
      />
    </Suspense>
  );
}
