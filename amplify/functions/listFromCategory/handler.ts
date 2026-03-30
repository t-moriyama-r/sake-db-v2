import type { Schema } from '../../data/resource';
import { getDataClient } from '../_shared/data-client';

type CategoryModel = Schema['Category']['type'];
type LiquorModel = Schema['Liquor']['type'];

type ListResult<T> = { data: T[]; nextToken: string | null | undefined; errors: { message: string }[] | undefined };

/**
 * 全カテゴリを取得してページネーションで結合する。
 */
async function fetchAllCategories(): Promise<CategoryModel[]> {
  const client = await getDataClient();
  const all: CategoryModel[] = [];
  let nextToken: string | null | undefined = undefined;

  do {
    const { data, nextToken: token, errors } = await client.models.Category.list({
      limit: 500,
      nextToken,
    }) as ListResult<CategoryModel>;
    if (errors?.length) {
      console.warn('カテゴリ取得中にエラーが発生しました:', errors);
      break;
    }
    all.push(...data);
    nextToken = token;
  } while (nextToken);

  return all;
}

/**
 * 全お酒をページネーションで取得する（複数カテゴリIDを or フィルタで指定）。
 */
async function fetchLiquorsByCategories(categoryIds: string[]): Promise<LiquorModel[]> {
  if (categoryIds.length === 0) return [];

  const client = await getDataClient();
  const all: LiquorModel[] = [];
  const filter =
    categoryIds.length === 1
      ? { categoryId: { eq: categoryIds[0] } }
      : { or: categoryIds.map((id) => ({ categoryId: { eq: id } })) };

  let nextToken: string | null | undefined = undefined;

  do {
    const { data, nextToken: token, errors } = await client.models.Liquor.list({
      filter,
      limit: 500,
      nextToken,
    }) as ListResult<LiquorModel>;
    if (errors?.length) {
      console.warn('お酒取得中にエラーが発生しました:', errors);
      break;
    }
    all.push(...data);
    nextToken = token;
  } while (nextToken);

  return all;
}

/**
 * 指定カテゴリIDを起点に、全子孫カテゴリのIDをBFSで収集する（自身を含む）。
 */
function collectDescendantIds(rootId: string, allCategories: CategoryModel[]): string[] {
  const childrenMap = new Map<string, string[]>();
  for (const cat of allCategories) {
    if (cat.parentId == null) continue;
    const siblings = childrenMap.get(cat.parentId) ?? [];
    siblings.push(cat.id);
    childrenMap.set(cat.parentId, siblings);
  }

  const result: string[] = [];
  const queue: string[] = [rootId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);
    const children = childrenMap.get(current) ?? [];
    queue.push(...children);
  }
  return result;
}

/**
 * 指定カテゴリおよび全サブカテゴリのお酒一覧とカテゴリ情報を返す。
 */
export const handler: Schema['listFromCategory']['functionHandler'] = async (event) => {
  const { categoryId } = event.arguments;
  const client = await getDataClient();

  const [{ data: category }, allCategories] = await Promise.all([
    client.models.Category.get({ id: categoryId }),
    fetchAllCategories(),
  ]);

  if (!category) {
    throw new Error(`カテゴリが見つかりません: ${categoryId}`);
  }

  const descendantIds = collectDescendantIds(categoryId, allCategories);
  const liquors = await fetchLiquorsByCategories(descendantIds);

  return {
    categoryName: category.name,
    categoryDescription: category.description ?? null,
    liquors: JSON.stringify(liquors),
  };
};
