import { useState } from 'react';
import type React from 'react';
import type { SerializableCategoryRecord } from '@/lib/server/categories/fetch';
import { client } from '@/lib/amplify-client';
import { revalidateCategoriesCache } from '@/lib/server/categories/revalidate';

type Args = {
  setCategories: React.Dispatch<React.SetStateAction<SerializableCategoryRecord[]>>;
};

export function useCategoryDelete({ setCategories }: Args): {
  deleteId: string | null;
  deleting: boolean;
  deleteError: string;
  startDelete: (id: string) => void;
  cancelDelete: () => void;
  handleDelete: () => Promise<void>;
} {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  const startDelete = (id: string) => {
    setDeleteId(id);
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setDeleteError('');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const { errors } = await client.models.Category.delete(
        { id: deleteId },
        { authMode: 'userPool' },
      );
      if (errors?.length) throw new Error(errors[0].message);
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
      await revalidateCategoriesCache();
      setDeleteId(null);
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : '削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  return { deleteId, deleting, deleteError, startDelete, cancelDelete, handleDelete };
}
