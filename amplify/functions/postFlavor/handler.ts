import type { Schema } from '../../data/resource';
import { getDataClient } from '../_shared/data-client';

type CognitoIdentity = { sub: string } | null;

/**
 * フレーバーマップへの投票を作成または更新する（upsert）。
 * - ログインユーザー: 既存投票があれば更新、なければ作成
 * - ゲスト: 毎回新規作成
 */
export const handler: Schema['postFlavor']['functionHandler'] = async (event) => {
  const { liquorId, x, y } = event.arguments;
  const identity = event.identity as CognitoIdentity;
  const client = await getDataClient();

  // categoryId はお酒レコードから取得
  const { data: liquor } = await client.models.Liquor.get({ id: liquorId });
  if (!liquor) throw new Error(`Liquor not found: ${liquorId}`);

  const categoryId = liquor.categoryId;

  if (identity?.sub) {
    // ログインユーザー: 既存投票を探して upsert
    const { data: existing } = await client.models.FlavorVote.list({
      filter: { and: [{ liquorId: { eq: liquorId } }, { owner: { eq: identity.sub } }] },
    });

    const current = existing?.[0];
    if (current) {
      await client.models.FlavorVote.update({ id: current.id, x, y });
    } else {
      await client.models.FlavorVote.create({ liquorId, categoryId, x, y });
    }
  } else {
    // ゲスト: 新規作成
    await client.models.FlavorVote.create({ liquorId, categoryId, x, y });
  }

  return true;
};
