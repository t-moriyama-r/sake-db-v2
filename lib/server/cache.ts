import { cache } from 'react';
import { unstable_cache } from 'next/cache';

/** CACHE_ENABLED=true が設定されていない環境（開発）かどうかを返す。 */
function isDevelopmentEnv(): boolean {
  return process.env.CACHE_ENABLED !== 'true';
}

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
  const effectiveOptions = isDevelopmentEnv() ? { ...options, revalidate: 60 } : options;
  const cached = unstable_cache(fn, key, effectiveOptions) as (...args: Args) => Promise<Return>;
  return cache(cached);
};
