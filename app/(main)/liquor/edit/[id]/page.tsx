import { notFound } from 'next/navigation';
import { LiquorForm } from '@/components/pages/liquor/LiquorForm/LiquorForm';
import { fetchAllCategories } from '@/lib/server/categories/fetch';
import { getGuestClient } from '@/lib/server/client';

export default async function LiquorEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const guestClient = getGuestClient();
  const [{ data: liquor }, categories] = await Promise.all([
    guestClient.models.Liquor.get({ id }),
    fetchAllCategories(),
  ]);

  if (!liquor) notFound();

  return <LiquorForm mode="EDIT" liquor={liquor} categories={categories} />;
}
