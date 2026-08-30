import { notFound } from 'next/navigation';
import { CategoryDetail } from '@/components/pages/category/CategoryDetail/CategoryDetail';
import { getServerUser } from '@/lib/server/auth';
import {
  fetchAllCategories,
  fetchCategory,
  buildCategoryBreadcrumbs,
} from '@/lib/server/categories/fetch';
import { fetchLiquorsByCategories } from '@/lib/server/liquors/fetch';

export default async function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [category, allCategories, liquors, user] = await Promise.all([
    fetchCategory(id),
    fetchAllCategories(),
    fetchLiquorsByCategories([id]),
    getServerUser(),
  ]);

  if (!category) return notFound();

  const subCategories = allCategories
    .filter((c) => c.parentId === id)
    .map((c) => ({ id: c.id, name: c.name ?? '' }));
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
