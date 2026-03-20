import type { Schema } from '../../data/resource';
import { getDataClient } from '../_shared/data-client';

/**
 * キーワードでお酒を検索する。
 * DynamoDB のフルテキスト検索は非対応のため、全件スキャン後にフィルタリングする。
 * TODO: 本番運用では OpenSearch / Amplify Search などへの移行を推奨。
 */
export const handler: Schema['searchLiquors']['functionHandler'] = async (event) => {
  const { keyword, limit = 20 } = event.arguments;
  const client = await getDataClient();

  const { data: liquors } = await client.models.Liquor.list();
  if (!liquors) return [];

  const lower = keyword.toLowerCase();
  const matched = liquors.filter(
    (l) =>
      l.name.toLowerCase().includes(lower) ||
      (l.description?.toLowerCase().includes(lower) ?? false),
  );

  return matched.slice(0, limit ?? 20);
};
