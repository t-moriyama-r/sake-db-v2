import { unstable_cache } from 'next/cache';
import { getGuestClient } from './client';
import type { Schema } from '@/amplify/data/resource';

export type CategoryRecord = Schema['Category']['type'];

/**
 * 全カテゴリをページネーション付きで取得する（unstable_cache でキャッシュ）。
 * revalidateTag('categories') で即時無効化できる。
 */
export const fetchAllCategories = unstable_cache(
  async (): Promise<CategoryRecord[]> => {
    const client = getGuestClient();
    const all: CategoryRecord[] = [];
    let nextToken: string | null | undefined = undefined;

    do {
      // eslint-disable-next-line no-await-in-loop
      const result = await client.models.Category.list({ limit: 500, nextToken });
      if (result.errors?.length) {
        console.warn('カテゴリ取得中にエラーが発生しました:', result.errors);
        break;
      }
      all.push(...result.data);
      nextToken = result.nextToken as string | null | undefined;
    } while (nextToken);

    return all;
  },
  ['all-categories'],
  { tags: ['categories'], revalidate: 3600 },
);

/**
 * ルートカテゴリ（parentId が null）のみ取得する。
 */
export const fetchRootCategories = unstable_cache(
  async (): Promise<CategoryRecord[]> => {
    const all = await fetchAllCategories();
    return all.filter((c) => !c.parentId);
  },
  ['root-categories'],
  { tags: ['categories'], revalidate: 3600 },
);

/**
 * 指定カテゴリを起点に全子孫 ID を BFS で収集する（自身を含む）。
 */
export function collectDescendantIds(
  rootId: string,
  allCategories: CategoryRecord[],
): string[] {
  const childrenMap = new Map<string, string[]>();
  for (const cat of allCategories) {
    if (!cat.parentId) continue;
    const siblings = childrenMap.get(cat.parentId) ?? [];
    siblings.push(cat.id);
    childrenMap.set(cat.parentId, siblings);
  }

  const result: string[] = [];
  const queue: string[] = [rootId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);
    queue.push(...(childrenMap.get(current) ?? []));
  }
  return result;
}

/**
 * 指定 ID のカテゴリ単体を取得する（unstable_cache でキャッシュ）。
 */
export const fetchCategory = unstable_cache(
  async (id: string): Promise<CategoryRecord | null> => {
    const client = getGuestClient();
    const { data } = await client.models.Category.get({ id });
    return data ?? null;
  },
  ['category'],
  { tags: ['categories'], revalidate: 3600 },
);
