'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/amplify-client';
import type { Schema } from '@/amplify/data/resource';
import type { LiquorInput } from '@/schemas/liquor';
import { LiquorForm } from '@/components/liquor/LiquorForm/LiquorForm';
import { Spinner } from '@/components/ui/Spinner/Spinner';

type Liquor = Schema['Liquor']['type'];

export default function LiquorEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLogin, isAdmin } = useAuth();

  const [liquor, setLiquor] = useState<Liquor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLogin) { router.replace('/auth/login'); return; }
    client.models.Liquor.get({ id })
      .then(({ data }) => {
        if (!data) { router.replace('/'); return; }
        if (!isAdmin && data.createUserId !== user?.id) { router.replace(`/liquor/${id}`); return; }
        setLiquor(data);
      })
      .finally(() => setLoading(false));
  }, [id, isLogin, isAdmin, user, router]);

  const handleSubmit = async (data: LiquorInput) => {
    if (!liquor || !user) return;
    await client.models.Liquor.update({
      id,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description ?? undefined,
      youtube: data.youtube ?? undefined,
      versionNo: (liquor.versionNo ?? 0) + 1,
      updateUserId: user.id,
      updateUserName: user.name,
    });

    await client.models.LiquorHistory.create({
      liquorId: id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categoryId: parseInt(liquor.categoryId) as any,
      categoryName: liquor.categoryName,
      name: liquor.name,
      description: liquor.description ?? undefined,
      imageUrl: liquor.imageUrl ?? undefined,
      imageBase64: liquor.imageBase64 ?? undefined,
      youtube: liquor.youtube ?? undefined,
      versionNo: liquor.versionNo ?? 0,
      updateUserId: liquor.updateUserId ?? undefined,
      updateUserName: liquor.updateUserName ?? undefined,
    });

    router.push(`/liquor/${id}`);
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!liquor) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">お酒を編集</h1>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <LiquorForm
          liquor={liquor}
          defaultValues={{
            categoryId: liquor.categoryId,
            name: liquor.name,
            description: liquor.description ?? '',
            youtube: liquor.youtube ?? '',
            imageUrl: liquor.imageUrl ?? '',
            imageBase64: liquor.imageBase64 ?? '',
          }}
          onSubmit={handleSubmit}
          submitLabel="更新する"
        />
      </div>
    </div>
  );
}
