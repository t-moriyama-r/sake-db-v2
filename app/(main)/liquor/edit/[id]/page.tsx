import { notFound } from 'next/navigation';
import { fetchAllCategories } from '@/lib/server/categories/fetch';
import { getGuestClient } from '@/lib/server/client';
import { LiquorFormClient } from '@/components/liquor/LiquorFormClient/LiquorFormClient';

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

  return <LiquorFormClient liquor={liquor} categories={categories} />;
}
