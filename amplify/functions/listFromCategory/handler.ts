import type { Schema } from '../../data/resource';
import { getDataClient } from '../_shared/data-client';

/**
 * 指定カテゴリのお酒一覧とカテゴリ情報を返す。
 */
export const handler: Schema['listFromCategory']['functionHandler'] = async (event) => {
  const { categoryId } = event.arguments;
  const client = await getDataClient();

  const [{ data: category }, { data: liquors }] = await Promise.all([
    client.models.Category.get({ id: categoryId }),
    client.models.Liquor.list({ filter: { categoryId: { eq: categoryId } } }),
  ]);

  if (!category) {
    throw new Error(`Category not found: ${categoryId}`);
  }

  return {
    categoryName: category.name,
    categoryDescription: category.description ?? null,
    // Liquor[] を JSON としてシリアライズして返す
    liquors: JSON.stringify(liquors ?? []),
  };
};
