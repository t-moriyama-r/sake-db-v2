'use server';

import { updateTag } from 'next/cache';
import { CACHE_TAGS } from '../cache';

/** 掲示板投稿キャッシュを無効化する。投稿作成・削除後に呼ぶ。 */
export async function revalidateBoardPostsCache(): Promise<void> {
  updateTag(CACHE_TAGS.boardPosts);
}
