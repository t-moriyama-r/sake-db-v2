import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';
import { getGuestClient } from './client';
import { cacheTtl, CACHE_TAGS } from './cache';
import type { Schema } from '@/amplify/data/resource';

export type LiquorRecord = Schema['Liquor']['type'];
export type BoardPostRecord = Schema['BoardPost']['type'];
export type TagRecord = Schema['Tag']['type'];

/** 単一のお酒を取得する（unstable_cache でキャッシュ）。 */
export const fetchLiquor = unstable_cache(
  async (id: string): Promise<LiquorRecord | null> => {
    const client = getGuestClient();
    const { data } = await client.models.Liquor.get({ id });
    return data ?? null;
  },
  ['liquor'],
  { tags: [CACHE_TAGS.liquors], revalidate: cacheTtl(900) },
);

/**
 * 複数のカテゴリ ID に属するお酒を全件取得する（ページネーション対応）。
 * or フィルタを使って一括取得する。
 */
export const fetchLiquorsByCategories = unstable_cache(
  async (categoryIds: string[]): Promise<LiquorRecord[]> => {
    if (categoryIds.length === 0) return [];

    const client = getGuestClient();
    const all: LiquorRecord[] = [];
    const filter =
      categoryIds.length === 1
        ? { categoryId: { eq: categoryIds[0] } }
        : { or: categoryIds.map((id) => ({ categoryId: { eq: id } })) };

    let nextToken: string | null | undefined = undefined;

    do {
      const result = await client.models.Liquor.list({ filter, limit: 500, nextToken });
      if (result.errors?.length) {
        console.warn('お酒取得中にエラーが発生しました:', result.errors);
        break;
      }
      all.push(...result.data);
      nextToken = result.nextToken as string | null | undefined;
    } while (nextToken);

    return all;
  },
  ['liquors-by-categories'],
  { tags: [CACHE_TAGS.liquors], revalidate: cacheTtl(900) },
);

/**
 * ホームページ用のお酒一覧をランダムに取得する。
 * randomRecommendList Lambda で全件対象のシャッフルを行う。
 * データ量が増えたら OpenSearch や ElastiCache への移行を検討すること。
 */
export const fetchRandomLiquors = unstable_cache(
  async (limit: number): Promise<LiquorRecord[]> => {
    const client = getGuestClient();
    const { data } = await client.queries.randomRecommendList({ limit });
    return data ? (JSON.parse(data as string) as LiquorRecord[]) : [];
  },
  ['random-liquors'],
  { tags: [CACHE_TAGS.liquors], revalidate: cacheTtl(300) },
);

/**
 * 指定タグを持つお酒一覧を取得する（unstable_cache でキャッシュ）。
 * Tag.text の GSI（secondaryIndex）を使って効率的に検索する。
 */
export const fetchLiquorsByTag = unstable_cache(
  async (tag: string): Promise<LiquorRecord[]> => {
    const client = getGuestClient();
    const { data: tagRecords } = await client.models.Tag.listByText({ text: tag }, { limit: 500 });
    if (!tagRecords?.length) return [];

    const uniqueIds = [...new Set(tagRecords.map((t) => t.liquorId))];
    const results = await Promise.all(uniqueIds.map((id) => client.models.Liquor.get({ id })));
    return results
      .map((r) => r.data)
      .filter((d): d is NonNullable<typeof d> => d !== null && d !== undefined) as LiquorRecord[];
  },
  ['liquors-by-tag'],
  { tags: [CACHE_TAGS.liquors, CACHE_TAGS.tags], revalidate: cacheTtl(300) },
);

/** お酒キャッシュを無効化する。お酒作成・更新・削除後に呼ぶ。 */
export async function revalidateLiquorsCache(): Promise<void> {
  'use server';
  revalidateTag(CACHE_TAGS.liquors, 'max');
}

/** 指定お酒の掲示板投稿を取得する（unstable_cache でキャッシュ）。 */
export const fetchBoardPosts = unstable_cache(
  async (liquorId: string): Promise<BoardPostRecord[]> => {
    const client = getGuestClient();
    const { data } = await client.models.BoardPost.list({
      filter: { liquorId: { eq: liquorId } },
      limit: 200,
    });
    return data ?? [];
  },
  ['board-posts'],
  { tags: [CACHE_TAGS.boardPosts], revalidate: cacheTtl(300) },
);

/**
 * ユーザーの投稿一覧を取得する（unstable_cache でキャッシュ）。
 * BoardPost.userId の GSI（secondaryIndex）を使って効率的に検索する。
 */
export const fetchUserBoardPosts = unstable_cache(
  async (userId: string): Promise<BoardPostRecord[]> => {
    const client = getGuestClient();
    const { data } = await client.models.BoardPost.listByUserId({ userId }, { limit: 200 });
    return [...(data ?? [])].sort(
      (a, b) =>
        new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime(),
    );
  },
  ['user-board-posts'],
  { tags: [CACHE_TAGS.boardPosts], revalidate: cacheTtl(300) },
);

/** 掲示板投稿キャッシュを無効化する。投稿作成・削除後に呼ぶ。 */
export async function revalidateBoardPostsCache(): Promise<void> {
  'use server';
  revalidateTag(CACHE_TAGS.boardPosts, 'max');
}

/** 指定お酒のタグを取得する（unstable_cache でキャッシュ）。 */
export const fetchTags = unstable_cache(
  async (liquorId: string): Promise<TagRecord[]> => {
    const client = getGuestClient();
    const { data } = await client.models.Tag.list({
      filter: { liquorId: { eq: liquorId } },
      limit: 100,
    });
    return data ?? [];
  },
  ['tags'],
  { tags: [CACHE_TAGS.tags], revalidate: cacheTtl(600) },
);

/** タグキャッシュを無効化する。タグ作成・削除後に呼ぶ。 */
export async function revalidateTagsCache(): Promise<void> {
  'use server';
  revalidateTag(CACHE_TAGS.tags, 'max');
}
