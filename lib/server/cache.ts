import { cache } from 'react';
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
 * 環境変数 CACHE_ENABLED=true が設定されていない場合は revalidate を60秒に固定する。
 * 本番環境では options で指定した revalidate が使われる。
 */
export const withCache = <Args extends unknown[], Return>(
  fn: (...args: Args) => Promise<Return>,
  key: string[],
  options: { tags: string[]; revalidate?: number },
): ((...args: Args) => Promise<Return>) => {
  const effectiveOptions =
    process.env.CACHE_ENABLED === 'true' ? options : { ...options, revalidate: 60 };
  const cached = unstable_cache(fn, key, effectiveOptions) as (...args: Args) => Promise<Return>;
  return cache(cached);
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
