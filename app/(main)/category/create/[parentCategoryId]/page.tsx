import { redirect } from 'next/navigation';
import { CategoryCreate } from '@/components/pages/category/CategoryCreate/CategoryCreate';
import { routes } from '@/lib/routes';
import { getServerUser } from '@/lib/server/auth';
import { fetchAllCategories } from '@/lib/server/categories/fetch';

export default async function CategoryCreatePage({
  params,
}: {
  params: Promise<{ parentCategoryId: string }>;
}) {
  const { parentCategoryId } = await params;

  const user = await getServerUser();
  if (!user) return redirect(routes.home());

  const categories = await fetchAllCategories();

  return <CategoryCreate parentCategoryId={parentCategoryId} categories={categories} />;
}
