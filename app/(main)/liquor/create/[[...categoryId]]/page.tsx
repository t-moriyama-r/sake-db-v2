import { fetchAllCategories } from '@/lib/server/categories/fetch';
import { LiquorFormClient } from '@/components/liquor/LiquorFormClient/LiquorFormClient';

export default async function LiquorCreatePage({
  params,
}: {
  params: Promise<{ categoryId?: string[] }>;
}) {
  const [{ categoryId }, categories] = await Promise.all([
    params,
    fetchAllCategories(),
  ]);

  return <LiquorFormClient categoryId={categoryId?.[0]} categories={categories} />;
}
