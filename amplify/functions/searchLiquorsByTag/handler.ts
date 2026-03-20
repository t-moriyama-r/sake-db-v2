import type { Schema } from '../../data/resource';
import { getDataClient } from '../_shared/data-client';

/**
 * タグテキストでお酒を検索する。
 * 一致するタグに紐づく Liquor を返す（重複排除済み）。
 */
export const handler: Schema['searchLiquorsByTag']['functionHandler'] = async (event) => {
  const { tag } = event.arguments;
  const client = await getDataClient();

  const { data: tags } = await client.models.Tag.list({
    filter: { text: { eq: tag } },
  });
  if (!tags || tags.length === 0) return [];

  const uniqueLiquorIds = [...new Set(tags.map((t) => t.liquorId))];

  const liquors = await Promise.all(
    uniqueLiquorIds.map((id) => client.models.Liquor.get({ id })),
  );

  return liquors.flatMap(({ data }) => (data ? [data] : []));
};
