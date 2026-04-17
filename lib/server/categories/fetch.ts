import type { Schema } from '@/amplify/data/resource';
import { fetchAll } from '../amplify-list';
import { withCache, CACHE_TAGS } from '../cache';
import { getGuestClient } from '../client';

export type CategoryRecord = Schema['Category']['type'];

export const fetchAllCategories = withCache(
  async (): Promise<CategoryRecord[]> => {
    console.log('[DEBUG] fetchAllCategories 開始');
    const client = getGuestClient();
    const all = await fetchAll((t, lim) => client.models.Category.list({ limit: lim, nextToken: t }));
    console.log('[DEBUG] fetchAllCategories 完了 件数:', all.length);
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

/**
 * サイドバー等でカテゴリツリーを表示する際に使うノード型。
 * liquors などのリレーションを含まず、シリアライズ可能。
 */
export type CategoryTreeNode = {
  id: string;
  name: string;
  parentId: string | null;
  children: CategoryTreeNode[];
};

/**
 * 全カテゴリをツリー構造（ルートノードの配列）で返す。
 * liquors などのリレーションは含まない。
 * サイドバーのような再帰表示用途向け。
 */
export const fetchCategoryTree = withCache(
  async (): Promise<CategoryTreeNode[]> => {
    const all = await fetchAllCategories();

    const build = (items: CategoryRecord[], parentId: string | null): CategoryTreeNode[] =>
      items
        .filter((c) => (c.parentId ?? null) === parentId)
        .map(({ id, name, parentId: pid }) => ({
          id,
          name,
          parentId: pid ?? null,
          children: build(items, id),
        }))
        .sort((a, b) => {
          if (a.name === 'その他') return 1;
          if (b.name === 'その他') return -1;
          return 0;
        });

    return build(all, null);
  },
  ['category-tree'],
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

/** パンくずリスト用のカテゴリ情報 */
export type CategoryBreadcrumbItem = { id: string; name: string };

/** 指定カテゴリからルートまでの祖先を含むパンくずリストを返す（自身含む）。 */
export function buildCategoryBreadcrumbs(
  categoryId: string,
  allCategories: CategoryRecord[],
): CategoryBreadcrumbItem[] {
  const category = allCategories.find((c) => c.id === categoryId);
  if (!category) return [];
  const ancestors = category.parentId
    ? buildCategoryBreadcrumbs(category.parentId, allCategories)
    : [];
  return [...ancestors, { id: category.id, name: category.name ?? '' }];
}
