import { fetchCategoryTree } from '@/lib/server/categories';
import { SidebarClient } from './SidebarClient';

export const Sidebar = async () => {
  const categoryTree = await fetchCategoryTree();
  return <SidebarClient categoryTree={categoryTree} />;
};
