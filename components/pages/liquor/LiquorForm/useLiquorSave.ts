'use client';

import { useRouter } from 'next/navigation';
import { useActionError } from '@/hooks/useActionError';
import { updateLiquor, createLiquorHistory, createLiquor } from '@/lib/repository/liquor';
import { routes } from '@/lib/routes';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
import { revalidateLiquorsCache } from '@/lib/server/liquors/revalidate';
import type { LiquorInput } from '@/schemas/liquor';
import { useLiquorFormActions } from './useLiquorFormActions';

type UseLiquorSaveOptions = {
  liquor?: SerializableLiquorRecord;
};

export function useLiquorSave({ liquor }: UseLiquorSaveOptions) {
  const router = useRouter();
  const { user, resolveCategoryName, resolveImageBase64 } = useLiquorFormActions();
  const { actionError, withActionError } = useActionError();

  async function save(value: LiquorInput): Promise<void> {
    await withActionError(async () => {
      const authMode = user ? 'userPool' : 'apiKey';
      if (liquor) {
        const categoryName = await resolveCategoryName(value.categoryId);
        const imageBase64 = await resolveImageBase64(value.image, liquor.imageBase64);

        await updateLiquor({
          id: liquor.id,
          categoryId: value.categoryId,
          categoryName,
          name: value.name,
          description: value.description ?? undefined,
          youtube: value.youtube ?? undefined,
          imageBase64,
          versionNo: (liquor.versionNo ?? 0) + 1,
          updateUserId: user?.id,
          updateUserName: user?.name,
        }, authMode);

        await createLiquorHistory({
          liquorId: liquor.id,
          categoryId: liquor.categoryId,
          categoryName: liquor.categoryName,
          name: liquor.name,
          description: liquor.description ?? undefined,
          imageUrl: liquor.imageUrl ?? undefined,
          imageBase64: liquor.imageBase64 ?? undefined,
          youtube: liquor.youtube ?? undefined,
          versionNo: liquor.versionNo ?? 0,
          updateUserId: liquor.updateUserId ?? undefined,
          updateUserName: liquor.updateUserName ?? undefined,
        }, authMode);

        await revalidateLiquorsCache();
        router.push(routes.liquor.detail(liquor.id));
      } else {
        const categoryName = await resolveCategoryName(value.categoryId);
        const imageBase64 = await resolveImageBase64(value.image);

        const id = await createLiquor({
          categoryId: value.categoryId,
          categoryName,
          name: value.name,
          description: value.description ?? undefined,
          youtube: value.youtube ?? undefined,
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
        });

        if (id) {
          await revalidateLiquorsCache();
          router.push(routes.liquor.detail(id));
        }
      }
    }, '保存に失敗しました');
  }

  return { save, saveError: actionError };
}
