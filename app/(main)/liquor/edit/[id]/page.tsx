import { notFound } from 'next/navigation';
import { LiquorForm } from '@/components/pages/liquor/LiquorForm/LiquorForm';
import { fetchAllCategories } from '@/lib/server/categories/fetch';
import { fetchLiquor } from '@/lib/server/liquors/fetch';

export default async function LiquorEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [liquor, categories] = await Promise.all([
    fetchLiquor(id),
    fetchAllCategories(),
  ]);

  if (!liquor) notFound();

  return <LiquorForm mode="EDIT" liquor={liquor} categories={categories} />;
}
