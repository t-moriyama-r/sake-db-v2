import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';

/** キャッシュタグ定数。タグ名のタイポによる無効化漏れを防ぐ。 */
export const CACHE_TAGS = {
  categories: 'categories',
  liquors: 'liquors',
  boardPosts: 'board-posts',
  tags: 'tags',
} as const;

/**
 * unstable_cache のラッパー。
 * 環境変数 CACHE_ENABLED=true が設定されていない場合はキャッシュをスキップし、
 * 毎回フレッシュなデータを取得する。
 */
export const withCache = <Args extends unknown[], Return>(
  fn: (...args: Args) => Promise<Return>,
  key: string[],
  options: { tags: string[]; revalidate?: number },
): ((...args: Args) => Promise<Return>) => {
  if (process.env.CACHE_ENABLED !== 'true') return fn;
  return unstable_cache(fn, key, options) as (...args: Args) => Promise<Return>;
};

/** カテゴリキャッシュを無効化する。カテゴリ作成・更新・削除後に呼ぶ。 */
export async function revalidateCategoriesCache(): Promise<void> {
  'use server';
  revalidateTag(CACHE_TAGS.categories, 'max');
}

/** お酒キャッシュを無効化する。お酒作成・更新・削除後に呼ぶ。 */
export async function revalidateLiquorsCache(): Promise<void> {
  'use server';
  revalidateTag(CACHE_TAGS.liquors, 'max');
}

/** 掲示板投稿キャッシュを無効化する。投稿作成・削除後に呼ぶ。 */
export async function revalidateBoardPostsCache(): Promise<void> {
  'use server';
  revalidateTag(CACHE_TAGS.boardPosts, 'max');
}

/** タグキャッシュを無効化する。タグ作成・削除後に呼ぶ。 */
export async function revalidateTagsCache(): Promise<void> {
  'use server';
  revalidateTag(CACHE_TAGS.tags, 'max');
}
