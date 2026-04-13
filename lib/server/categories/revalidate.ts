'use server';

import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '../cache';

/** カテゴリキャッシュを無効化する。カテゴリ作成・更新・削除後に呼ぶ。 */
export async function revalidateCategoriesCache(): Promise<void> {
  revalidateTag(CACHE_TAGS.categories, 'max');
}
