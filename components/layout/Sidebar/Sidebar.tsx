import { headers } from 'next/headers';
import { fetchCategoryTree } from '@/lib/server/categories/fetch';
import { fetchLiquor } from '@/lib/server/liquors/fetch';
import { CategoryTree } from './CategoryTree';
import { MobileSidebarDrawer } from './MobileSidebarDrawer';

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

  return (
    <>
      <CategoryTree categoryTree={categoryTree} activeCategoryId={activeCategoryId} />
      <MobileSidebarDrawer categoryTree={categoryTree} activeCategoryId={activeCategoryId} />
    </>
  );
};
