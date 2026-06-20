import { LiquorForm } from '@/components/pages/liquor/LiquorForm/LiquorForm';
import { fetchAllCategories } from '@/lib/server/categories/fetch';

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
