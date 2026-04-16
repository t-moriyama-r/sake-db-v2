import { fetchAllCategories } from '@/lib/server/categories/fetch';
import { LiquorForm } from '@/components/liquor/LiquorForm/LiquorForm';

export default async function LiquorCreatePage({
  params,
}: {
  params: Promise<{ categoryId?: string[] }>;
}) {
  const [{ categoryId }, categories] = await Promise.all([
    params,
    fetchAllCategories(),
  ]);

  return <LiquorForm mode="NEW" categoryId={categoryId?.[0]} categories={categories} />;
}
