'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/amplify-client';
import { routes } from '@/lib/routes';

type Options = {
  liquorId: string;
  categoryId: string;
};

export function useLiquorDelete({ liquorId, categoryId }: Options) {
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [deleting, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleDelete(): void {
    setDeleteError(null);
    startTransition(async () => {
      try {
        const { errors } = await client.models.Liquor.delete({ id: liquorId });
        if (errors?.length) throw new Error(errors[0].message);
        setDeleteDialog(false);
        router.push(routes.category.detail(categoryId));
      } catch (e: unknown) {
        setDeleteError(e instanceof Error ? e.message : '削除に失敗しました');
      }
    });
  }

  return { deleteDialog, setDeleteDialog, deleting, handleDelete, deleteError };
}

