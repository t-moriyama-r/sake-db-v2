import type { Schema } from '../../data/resource';
import { getDataClient } from '../_shared/data-client';

/**
 * お酒の現在データと編集履歴を返す。
 * 戻り値は { now: Liquor, histories: LiquorHistory[] } の JSON 文字列。
 */
export const handler: Schema['liquorHistories']['functionHandler'] = async (event) => {
  const { id } = event.arguments;
  const client = await getDataClient();

  const [{ data: now }, { data: histories }] = await Promise.all([
    client.models.Liquor.get({ id }),
    client.models.LiquorHistory.list({ filter: { liquorId: { eq: id } } }),
  ]);

  if (!now) throw new Error(`Liquor not found: ${id}`);

  return JSON.stringify({
    now,
    histories: (histories ?? []).sort((a, b) => (b.versionNo ?? 0) - (a.versionNo ?? 0)),
  });
};
