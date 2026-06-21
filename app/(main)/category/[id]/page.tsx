import { redirect } from 'next/navigation';
import { CategoryDetail } from '@/components/pages/category/CategoryDetail/CategoryDetail';
import { getServerUser } from '@/lib/server/auth';
import { fetchAllCategories, fetchCategory, buildCategoryBreadcrumbs } from '@/lib/server/categories/fetch';
import { fetchLiquorsByCategories } from '@/lib/server/liquors/fetch';
import { routes } from '@/lib/routes';

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [category, allCategories, liquors, user] = await Promise.all([
    fetchCategory(id),
    fetchAllCategories(),
    fetchLiquorsByCategories([id]),
    getServerUser(),
  ]);

  if (!category) return redirect(routes.home());

  const subCategories = allCategories.filter((c) => c.parentId === id);
  const breadcrumbs = buildCategoryBreadcrumbs(id, allCategories);
  const isLoggedIn = user !== null;

  return (
    <CategoryDetail
      categoryId={id}
      categoryName={category.name}
      categoryDescription={category.description}
      breadcrumbs={breadcrumbs}
      subCategories={subCategories}
      liquors={liquors}
      isLoggedIn={isLoggedIn}
    />
  );
}
