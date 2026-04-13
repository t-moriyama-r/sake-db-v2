import { getGuestClient } from '../client';
import { withCache, CACHE_TAGS } from '../cache';
import { fetchAll } from '../amplify-list';
import type { Schema } from '@/amplify/data/resource';

export type LiquorRecord = Schema['Liquor']['type'];

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
    const filter =
      categoryIds.length === 1
        ? { categoryId: { eq: categoryIds[0] } }
        : { or: categoryIds.map((id) => ({ categoryId: { eq: id } })) };

    return fetchAll((t, lim) => client.models.Liquor.list({ filter, limit: lim, nextToken: t }));
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
    const all = await fetchAll((t, lim) => client.models.Liquor.list({ limit: lim, nextToken: t }));

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
