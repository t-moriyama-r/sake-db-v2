'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/amplify-client';

type Options = {
  liquorId: string;
  categoryId: string;
};

export function useLiquorDelete({ liquorId, categoryId }: Options) {
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  async function handleDelete(): Promise<void> {
    setDeleting(true);
    try {
      await client.models.Liquor.delete({ id: liquorId });
      router.push(`/category/${categoryId}`);
    } finally {
      setDeleting(false);
      setDeleteDialog(false);
    }
  }

  return { deleteDialog, setDeleteDialog, deleting, handleDelete };
}

