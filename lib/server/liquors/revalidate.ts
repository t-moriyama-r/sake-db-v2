'use server';

import { updateTag } from 'next/cache';
import { CACHE_TAGS } from '../cache';

/** お酒キャッシュを無効化する。お酒作成・更新・削除後に呼ぶ。 */
export async function revalidateLiquorsCache(): Promise<void> {
  updateTag(CACHE_TAGS.liquors);
}
