import { unstable_cache } from 'next/cache';
import { getGuestClient } from './client';
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
  { tags: ['liquors'], revalidate: 900 },
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
      // eslint-disable-next-line no-await-in-loop
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
  { tags: ['liquors'], revalidate: 900 },
);

/** ホームページ用のお酒一覧をランダムに取得する。 */
export const fetchRandomLiquors = unstable_cache(
  async (limit: number): Promise<LiquorRecord[]> => {
    const client = getGuestClient();
    const { data } = await client.models.Liquor.list({ limit: 100 });
    return [...data].sort(() => Math.random() - 0.5).slice(0, limit);
  },
  ['random-liquors'],
  { tags: ['liquors'], revalidate: 300 },
);

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
  { tags: ['board-posts'], revalidate: 300 },
);

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
  { tags: ['tags'], revalidate: 600 },
);

/** 指定タグを持つお酒一覧を取得する（unstable_cache でキャッシュ）。 */
export const fetchLiquorsByTag = unstable_cache(
  async (tag: string): Promise<LiquorRecord[]> => {
    const client = getGuestClient();
    const { data: tagRecords } = await client.models.Tag.list({
      filter: { text: { eq: tag } },
      limit: 500,
    });
    if (!tagRecords?.length) return [];

    const uniqueIds = [...new Set(tagRecords.map((t) => t.liquorId))];
    const results = await Promise.all(uniqueIds.map((id) => client.models.Liquor.get({ id })));
    return results
      .map((r) => r.data)
      .filter((d): d is NonNullable<typeof d> => d !== null && d !== undefined) as LiquorRecord[];
  },
  ['liquors-by-tag'],
  { tags: ['liquors', 'tags'], revalidate: 300 },
);

/** ユーザーの投稿一覧を取得する（unstable_cache でキャッシュ）。 */
export const fetchUserBoardPosts = unstable_cache(
  async (userId: string): Promise<BoardPostRecord[]> => {
    const client = getGuestClient();
    const { data } = await client.models.BoardPost.list({
      filter: { userId: { eq: userId } },
      limit: 200,
    });
    return [...(data ?? [])].sort(
      (a, b) =>
        new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime(),
    );
  },
  ['user-board-posts'],
  { tags: ['board-posts'], revalidate: 300 },
);
