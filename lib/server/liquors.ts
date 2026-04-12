import { updateTag } from 'next/cache';
import { getGuestClient } from './client';
import { withCache, CACHE_TAGS } from './cache';
import type { Schema } from '@/amplify/data/resource';

export type LiquorRecord = Schema['Liquor']['type'];
export type BoardPostRecord = Schema['BoardPost']['type'];
export type TagRecord = Schema['Tag']['type'];

/** 単一のお酒を取得する。 */
export const fetchLiquor = withCache(
  async (id: string): Promise<LiquorRecord | null> => {
    const client = getGuestClient();
    const { data } = await client.models.Liquor.get({ id });
    return data ?? null;
  },
  ['liquor'],
  { tags: [CACHE_TAGS.liquors], revalidate: 900 },
);

/**
 * 複数のカテゴリ ID に属するお酒を全件取得する（ページネーション対応）。
 * or フィルタを使って一括取得する。
 */
export const fetchLiquorsByCategories = withCache(
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
  { tags: [CACHE_TAGS.liquors], revalidate: 900 },
);

/**
 * ホームページ用のお酒一覧を全件ランダム順で取得する。
 * DynamoDB はランダム取得を直接サポートしないため、全件取得後にシャッフルする。
 * データ量が増えたら OpenSearch や ElastiCache への移行を検討すること。
 */
export const fetchAllLiquorsRandomly = withCache(
  async (): Promise<LiquorRecord[]> => {
    const client = getGuestClient();
    const all: LiquorRecord[] = [];
    let nextToken: string | null | undefined = undefined;

    do {
      const result = await client.models.Liquor.list({ limit: 500, nextToken });
      if (result.errors?.length) {
        console.warn('お酒取得中にエラーが発生しました:', result.errors);
        break;
      }
      all.push(...result.data);
      nextToken = result.nextToken as string | null | undefined;
    } while (nextToken);

    // Fisher-Yates シャッフル
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j]!, all[i]!];
    }

    return all;
  },
  ['all-liquors-random'],
  { tags: [CACHE_TAGS.liquors], revalidate: 60 },
);

/**
 * 指定タグを持つお酒一覧を取得する。
 * Tag.text の GSI（secondaryIndex）を使って効率的に検索する。
 */
export const fetchLiquorsByTag = withCache(
  async (tag: string): Promise<LiquorRecord[]> => {
    const client = getGuestClient();
    const { data: tagRecords } = await client.models.Tag.listTagByText({ text: tag }, { limit: 500 });
    if (!tagRecords?.length) return [];

    const uniqueIds = [...new Set(tagRecords.map((t) => t.liquorId))];
    const results = await Promise.all(uniqueIds.map((id) => client.models.Liquor.get({ id })));
    return results
      .map((r) => r.data)
      .filter((d): d is NonNullable<typeof d> => d !== null && d !== undefined) as LiquorRecord[];
  },
  ['liquors-by-tag'],
  { tags: [CACHE_TAGS.liquors, CACHE_TAGS.tags], revalidate: 300 },
);

/** お酒キャッシュを無効化する。お酒作成・更新・削除後に呼ぶ。 */
export async function revalidateLiquorsCache(): Promise<void> {
  'use server';
  updateTag(CACHE_TAGS.liquors);
}

/** 指定お酒の掲示板投稿を取得する。 */
export const fetchBoardPosts = withCache(
  async (liquorId: string): Promise<BoardPostRecord[]> => {
    const client = getGuestClient();
    const { data } = await client.models.BoardPost.list({
      filter: { liquorId: { eq: liquorId } },
      limit: 200,
    });
    return data ?? [];
  },
  ['board-posts'],
  { tags: [CACHE_TAGS.boardPosts], revalidate: 300 },
);

/**
 * ユーザーの投稿一覧を取得する。
 * BoardPost.userId の GSI（secondaryIndex）を使って効率的に検索する。
 */
export const fetchUserBoardPosts = withCache(
  async (userId: string): Promise<BoardPostRecord[]> => {
    const client = getGuestClient();
    const { data } = await client.models.BoardPost.listBoardPostByUserId({ userId }, { limit: 200 });
    return [...(data ?? [])].sort(
      (a, b) =>
        new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime(),
    );
  },
  ['user-board-posts'],
  { tags: [CACHE_TAGS.boardPosts], revalidate: 300 },
);

/** 掲示板投稿キャッシュを無効化する。投稿作成・削除後に呼ぶ。 */
export async function revalidateBoardPostsCache(): Promise<void> {
  'use server';
  updateTag(CACHE_TAGS.boardPosts);
}

/** 指定お酒のタグを取得する。 */
export const fetchTags = withCache(
  async (liquorId: string): Promise<TagRecord[]> => {
    const client = getGuestClient();
    const { data } = await client.models.Tag.list({
      filter: { liquorId: { eq: liquorId } },
      limit: 100,
    });
    return data ?? [];
  },
  ['tags'],
  { tags: [CACHE_TAGS.tags], revalidate: 600 },
);

/** タグキャッシュを無効化する。タグ作成・削除後に呼ぶ。 */
export async function revalidateTagsCache(): Promise<void> {
  'use server';
  updateTag(CACHE_TAGS.tags);
}
