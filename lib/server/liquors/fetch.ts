import type { Schema } from '@/amplify/data/resource';
import { fetchAll } from '@/lib/amplify-list';
import { withCache, CACHE_TAGS } from '../cache';
import { getGuestClient } from '../client';

export type LiquorRecord = Schema['Liquor']['type'];
export type SerializableLiquorRecord = Omit<
  LiquorRecord,
  'category' | 'boardPosts' | 'tags' | 'flavorVotes' | 'bookmarks' | 'liquorHistories'
> & {
  tags: { id: string; text: string }[];
};

export type LiquorHistoryRecord = Schema['LiquorHistory']['type'];
export type SerializableLiquorHistoryRecord = Omit<LiquorHistoryRecord, 'liquor'>;

/** LiquorRecord を tags 付きで SerializableLiquorRecord にシリアライズする。 */
function serializeLiquorRecord(
  record: LiquorRecord,
  tags: SerializableLiquorRecord['tags'] = [],
): SerializableLiquorRecord {
  const base = JSON.parse(JSON.stringify(record)) as Omit<SerializableLiquorRecord, 'tags'>;
  return { ...base, tags };
}

/** 単一のお酒を取得する。タグはリレーションから一緒に取得する。 */
export const fetchLiquor = withCache(
  async (id: string): Promise<SerializableLiquorRecord | null> => {
    const client = getGuestClient();
    const { data } = await client.models.Liquor.get({ id });
    if (!data) return null;
    const { data: tagsData } = await data.tags();
    return serializeLiquorRecord(
      data,
      tagsData.map(({ id: tagId, text }) => ({ id: tagId, text })),
    );
  },
  ['liquor'],
  { tags: [CACHE_TAGS.liquors, CACHE_TAGS.tags], revalidate: 900 },
);

/**
 * 複数のカテゴリ ID に属するお酒を全件取得する（ページネーション対応）。
 * or フィルタを使って一括取得する。
 */
export const fetchLiquorsByCategories = withCache(
  async (categoryIds: string[]): Promise<SerializableLiquorRecord[]> => {
    if (categoryIds.length === 0) return [];

    const client = getGuestClient();
    const filter =
      categoryIds.length === 1
        ? { categoryId: { eq: categoryIds[0] } }
        : { or: categoryIds.map((id) => ({ categoryId: { eq: id } })) };

    const result = await fetchAll((t, lim) => client.models.Liquor.list({ filter, limit: lim, nextToken: t }));
    return JSON.parse(JSON.stringify(result)) as SerializableLiquorRecord[];
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
  async (): Promise<SerializableLiquorRecord[]> => {
    const client = getGuestClient();
    const all = await fetchAll(client.models.Liquor.list);

    // Fisher-Yates シャッフル
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j]!, all[i]!];
    }

    return JSON.parse(JSON.stringify(all)) as SerializableLiquorRecord[];
  },
  ['all-liquors-random'],
  { tags: [CACHE_TAGS.liquors], revalidate: 60 },
);

/**
 * 指定タグを持つお酒一覧を取得する。
 * Tag.text の GSI（secondaryIndex）を使って効率的に検索する。
 * - fetchAll でページネーション全件取得（500件上限を撤廃）
 * - Liquor 取得は CHUNK_SIZE 件ずつ並列 BatchGet してスロットリングを抑制
 */
export const fetchLiquorsByTag = withCache(
  async (tag: string): Promise<SerializableLiquorRecord[]> => {
    const client = getGuestClient();

    const tagRecords = await fetchAll((nextToken, limit) =>
      client.models.Tag.listTagByText({ text: tag }, { limit, nextToken: nextToken ?? undefined }),
    );
    if (!tagRecords.length) return [];

    const uniqueIds = [...new Set(tagRecords.map((t) => t.liquorId))];
    const nested = await Promise.all(
      chunkArray(uniqueIds, CHUNK_SIZE).map((ids) =>
        Promise.all(ids.map((id) => client.models.Liquor.get({ id }))),
      ),
    );

    const result = nested
      .flat()
      .map((r) => r.data)
      .filter((d): d is NonNullable<typeof d> => d != null);
    return result.map((r) => serializeLiquorRecord(r));
  },
  ['liquors-by-tag'],
  { tags: [CACHE_TAGS.liquors, CACHE_TAGS.tags], revalidate: 300 },
);

/** 指定したお酒の編集履歴を全件取得する。versionNo の降順で返す。 */
export const fetchLiquorHistories = withCache(
  async (liquorId: string): Promise<SerializableLiquorHistoryRecord[]> => {
    const client = getGuestClient();
    const data = await fetchAll((nextToken, limit) =>
      client.models.LiquorHistory.list({
        filter: { liquorId: { eq: liquorId } },
        limit,
        nextToken: nextToken ?? undefined,
      }),
    );
    const sorted = data
      .filter((h): h is NonNullable<typeof h> => h !== null)
      .sort((a, b) => (b.versionNo ?? 0) - (a.versionNo ?? 0));
    return JSON.parse(JSON.stringify(sorted)) as SerializableLiquorHistoryRecord[];
  },
  ['liquor-histories'],
  { tags: [CACHE_TAGS.liquors], revalidate: 900 },
);

const CHUNK_SIZE = 100;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
