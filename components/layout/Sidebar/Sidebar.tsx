import { fetchCategoryTree } from '@/lib/server/categories';
import { CategoryTree } from './CategoryTree';

export const Sidebar = async () => {
  const categoryTree = await fetchCategoryTree();
  return <CategoryTree categoryTree={categoryTree} />;
};
