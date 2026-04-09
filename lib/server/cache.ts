/** キャッシュタグ定数。タグ名のタイポによる無効化漏れを防ぐ。 */
export const CACHE_TAGS = {
  categories: 'categories',
  liquors: 'liquors',
  boardPosts: 'board-posts',
  tags: 'tags',
} as const;

/**
 * unstable_cache の revalidate 値を返す。
 * 環境変数 CACHE_ENABLED=true が設定されていない場合はキャッシュを無効化する。
 */
export const cacheTtl = (ttl: number) =>
  process.env.CACHE_ENABLED === 'true' ? ttl : 0;
