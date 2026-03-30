import { fetchRootCategories } from '@/lib/server/categories';
import { SidebarClient } from './SidebarClient';

export const Sidebar = async () => {
  const rootCategories = await fetchRootCategories();
  return <SidebarClient rootCategories={rootCategories} />;
};
