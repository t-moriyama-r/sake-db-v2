import { fetchRootCategories } from '@/lib/server/categories';
import { SidebarClient } from './SidebarClient';

export const Sidebar = async () => {
  const rootCategories = await fetchRootCategories();
  const nodes = rootCategories.map(({ id, name }) => ({ id, name }));
  return <SidebarClient rootCategories={nodes} />;
};
