'use client';

import { useRouter } from 'next/navigation';
import { useLiquorFormActions } from '@/hooks/useLiquorFormActions';
import { client } from '@/lib/amplify-client';
import type { LiquorInput } from '@/schemas/liquor';
import { LiquorForm } from '@/components/liquor/LiquorForm/LiquorForm';
import type { Schema } from '@/amplify/data/resource';

type Category = Schema['Category']['type'];
type Liquor = Schema['Liquor']['type'];

type LiquorFormClientProps = {
  categories: Category[];
  categoryId?: string;
  liquor?: Liquor;
};

export function LiquorFormClient({ categories, categoryId, liquor }: LiquorFormClientProps) {
  const router = useRouter();
  const { user, resolveCategoryName, resolveImageBase64 } = useLiquorFormActions();

  const handleSubmit = async (data: LiquorInput) => {
    if (liquor) {
      if (!user) return;

      const categoryName = await resolveCategoryName(data.categoryId, liquor.categoryId, liquor.categoryName);
      const imageBase64 = await resolveImageBase64(data.image, liquor.imageBase64);

      await client.models.Liquor.update({
        id: liquor.id,
        categoryId: data.categoryId,
        categoryName,
        name: data.name,
        description: data.description ?? undefined,
        youtube: data.youtube ?? undefined,
        imageBase64,
        versionNo: (liquor.versionNo ?? 0) + 1,
        updateUserId: user.id,
        updateUserName: user.name,
      });

      await client.models.LiquorHistory.create({
        liquorId: liquor.id,
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

      router.push(`/liquor/${liquor.id}`);
    } else {
      const originalCategoryName = categories.find((c) => c.id === categoryId)?.name;
      const categoryName = await resolveCategoryName(data.categoryId, categoryId, originalCategoryName);
      const imageBase64 = await resolveImageBase64(data.image);

      const { data: newLiquor } = await client.models.Liquor.create({
        categoryId: data.categoryId,
        categoryName,
        name: data.name,
        description: data.description ?? undefined,
        youtube: data.youtube ?? undefined,
        imageBase64,
        rate5Users: [],
        rate4Users: [],
        rate3Users: [],
        rate2Users: [],
        rate1Users: [],
        versionNo: 1,
        createUserId: user?.id,
        createUserName: user?.name,
        updateUserId: user?.id,
        updateUserName: user?.name,
      }, { authMode: 'identityPool' });

      router.push(`/liquor/${newLiquor?.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        {liquor ? 'お酒を編集' : 'お酒を登録'}
      </h1>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <LiquorForm
          categories={categories}
          liquor={liquor}
          defaultValues={liquor ? {
            categoryId: liquor.categoryId,
            name: liquor.name,
            description: liquor.description ?? '',
            youtube: liquor.youtube ?? '',
            imageUrl: liquor.imageUrl ?? '',
            imageBase64: liquor.imageBase64 ?? '',
          } : { categoryId }}
          onSubmit={handleSubmit}
          submitLabel={liquor ? '更新する' : '登録する'}
        />
      </div>
    </div>
  );
}
