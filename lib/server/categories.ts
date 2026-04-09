import { revalidateTag } from 'next/cache';
import { getGuestClient } from './client';
import { withCache, CACHE_TAGS } from './cache';
import type { Schema } from '@/amplify/data/resource';

export type CategoryRecord = Schema['Category']['type'];

export const fetchAllCategories = withCache(
  async (): Promise<CategoryRecord[]> => {
    const client = getGuestClient();
    const all: CategoryRecord[] = [];
    let nextToken: string | null | undefined = undefined;

    do {
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
  { tags: [CACHE_TAGS.categories], revalidate: 3600 },
);

/** ルートカテゴリ（parentId が null）のみ取得する。 */
export const fetchRootCategories = withCache(
  async (): Promise<CategoryRecord[]> => {
    const all = await fetchAllCategories();
    return all.filter((c) => !c.parentId);
  },
  ['root-categories'],
  { tags: [CACHE_TAGS.categories], revalidate: 3600 },
);

/** 指定 ID のカテゴリ単体を取得する。 */
export const fetchCategory = withCache(
  async (id: string): Promise<CategoryRecord | null> => {
    const client = getGuestClient();
    const { data } = await client.models.Category.get({ id });
    return data ?? null;
  },
  ['category'],
  { tags: [CACHE_TAGS.categories], revalidate: 3600 },
);

/** 指定カテゴリを起点に全子孫 ID を BFS で収集する（自身を含む）。 */
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

/** カテゴリキャッシュを無効化する。カテゴリ作成・更新・削除後に呼ぶ。 */
export async function revalidateCategoriesCache(): Promise<void> {
  'use server';
  revalidateTag(CACHE_TAGS.categories, 'max');
}
