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

  function handleDelete(): void {
    startTransition(async () => {
      await client.models.Liquor.delete({ id: liquorId });
      setDeleteDialog(false);
      router.push(routes.category.detail(categoryId));
    });
  }

  return { deleteDialog, setDeleteDialog, deleting, handleDelete };
}

