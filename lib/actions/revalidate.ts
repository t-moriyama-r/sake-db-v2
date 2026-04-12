'use server';

import { updateTag } from 'next/cache';

export async function revalidateLiquorsCache(): Promise<void> {
  updateTag('liquors');
}

export async function revalidateBoardPostsCache(): Promise<void> {
  updateTag('board-posts');
}

export async function revalidateCategoriesCache(): Promise<void> {
  updateTag('categories');
}

export async function revalidateTagsCache(): Promise<void> {
  updateTag('tags');
}
