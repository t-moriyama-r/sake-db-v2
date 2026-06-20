'use server';

import { updateTag } from 'next/cache';
import { CACHE_TAGS } from '../cache';

/** タグキャッシュを無効化する。タグ作成・削除後に呼ぶ。 */
export async function revalidateTagsCache(): Promise<void> {
  updateTag(CACHE_TAGS.tags);
}
