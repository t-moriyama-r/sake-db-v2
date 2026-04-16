'use client';

import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/amplify-client';

export function useLiquorFormActions() {
  const { user, isAdmin } = useAuth();

  async function resolveCategoryName(categoryId: string): Promise<string> {
    const { data: cat } = await client.models.Category.get({ id: categoryId }, { authMode: 'identityPool' });
    return cat?.name ?? '';
  }

  async function resolveImageBase64(
    image?: File | null,
    originalBase64?: string | null,
  ): Promise<string | undefined> {
    if (image) return convertToBase64(image);
    return originalBase64 ?? undefined;
  }

  return { user, isAdmin, resolveCategoryName, resolveImageBase64 };
}

async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
