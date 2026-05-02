import { redirect } from 'next/navigation';
import { CategoryCreate } from '@/components/pages/category/CategoryCreate/CategoryCreate';
import { getServerUser } from '@/lib/server/auth';

export default async function CategoryCreatePage({
  params,
}: {
  params: Promise<{ parentCategoryId: string }>;
}) {
  const { parentCategoryId } = await params;

  const user = await getServerUser();
  if (!user) redirect('/');

  return <CategoryCreate parentCategoryId={parentCategoryId} />;
}
