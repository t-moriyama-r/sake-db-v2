'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { routes } from '@/lib/routes';
import { deleteLiquorWithRelated } from '@/lib/server/liquors/actions';

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
      const { error } = await deleteLiquorWithRelated(liquorId);
      if (error) {
        setDeleteError(error);
        return;
      }
      setDeleteDialog(false);
      router.push(routes.category.detail(categoryId));
    });
  }

  return { deleteDialog, setDeleteDialog, deleting, handleDelete, deleteError };
}

