import { notFound } from 'next/navigation';
import { LiquorForm } from '@/components/pages/liquor/LiquorForm/LiquorForm';
import { fetchAllCategories } from '@/lib/server/categories/fetch';
import { fetchLiquor, fetchLiquorHistories } from '@/lib/server/liquors/fetch';

export default async function LiquorEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [liquor, categories, histories] = await Promise.all([
    fetchLiquor(id),
    fetchAllCategories(),
    fetchLiquorHistories(id),
  ]);

  if (!liquor) return notFound();

  return <LiquorForm mode="EDIT" liquor={liquor} categories={categories} histories={histories} />;
}
