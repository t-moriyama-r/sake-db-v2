import { redirect } from 'next/navigation';
import { CategoryCreate } from '@/components/pages/category/CategoryCreate/CategoryCreate';
import { getServerUser } from '@/lib/server/auth';
import { routes } from '@/lib/routes';

export default async function CategoryCreatePage({
  params,
}: {
  params: Promise<{ parentCategoryId: string }>;
}) {
  const { parentCategoryId } = await params;

  const user = await getServerUser();
  if (!user) return redirect(routes.home());

  return <CategoryCreate parentCategoryId={parentCategoryId} />;
}
