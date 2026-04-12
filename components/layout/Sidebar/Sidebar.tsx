import { headers } from 'next/headers';
import { fetchCategoryTree } from '@/lib/server/categories';
import { fetchLiquor } from '@/lib/server/liquors';
import { CategoryTree } from './CategoryTree';

export const Sidebar = async () => {
  const categoryTree = await fetchCategoryTree();

  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';

  let activeCategoryId: string | null = null;

  const liquorMatch = pathname.match(/^\/liquor\/([^/]+)$/);
  if (liquorMatch) {
    const liquor = await fetchLiquor(liquorMatch[1]);
    activeCategoryId = liquor?.categoryId ?? null;
  }

  return <CategoryTree categoryTree={categoryTree} activeCategoryId={activeCategoryId} />;
};
