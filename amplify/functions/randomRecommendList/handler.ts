import type { Schema } from '../../data/resource';
import { getDataClient } from '../_shared/data-client';

/**
 * ランダムなお酒リストを返す。
 * DynamoDB はランダム取得を直接サポートしないため、全件取得後にシャッフルする。
 * データ量が増えたら OpenSearch や ElastiCache への移行を検討すること。
 */
export const handler: Schema['randomRecommendList']['functionHandler'] = async (event) => {
  const { limit } = event.arguments;
  const client = await getDataClient();

  const { data: liquors } = await client.models.Liquor.list();
  if (!liquors || liquors.length === 0) return JSON.stringify([]);

  // Fisher-Yates シャッフル
  const arr = [...liquors];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }

  return JSON.stringify(arr.slice(0, limit));
};
