import type { Schema } from '../../data/resource';
import { getDataClient } from '../_shared/data-client';

/**
 * フレーバーマップの x/y 軸ラベル（カテゴリ共通）。
 * カテゴリごとに異なる場合は DB 管理に変更すること。
 */
const X_NAMES = ['辛口', 'やや辛口', '普通', 'やや甘口', '甘口'];
const Y_NAMES = ['淡麗', 'やや淡麗', '普通', 'やや濃醇', '濃醇'];

/**
 * 対象お酒の FlavorVote レコードを集計して FlavorMapData を返す。
 * ログインユーザーの投票は userAmount、ゲストは guestAmount にカウント。
 */
export const handler: Schema['getFlavorMap']['functionHandler'] = async (event) => {
  const { liquorId } = event.arguments;
  const client = await getDataClient();

  const { data: votes } = await client.models.FlavorVote.list({
    filter: { liquorId: { eq: liquorId } },
  });

  if (!votes || votes.length === 0) return null;

  const categoryId = votes[0]!.categoryId;
  const cellMap = new Map<string, { userAmount: number; guestAmount: number }>();
  let userFullAmount = 0;
  let guestFullAmount = 0;

  for (const vote of votes) {
    const key = `${vote.x},${vote.y}`;
    const cell = cellMap.get(key) ?? { userAmount: 0, guestAmount: 0 };
    // owner が設定されていればログインユーザー票、なければゲスト票
    if (vote.owner) {
      cell.userAmount++;
      userFullAmount++;
    } else {
      cell.guestAmount++;
      guestFullAmount++;
    }
    cellMap.set(key, cell);
  }

  const totalAmount = userFullAmount + guestFullAmount;
  const mapData = Array.from(cellMap.entries()).map(([key, cell]) => {
    const [x, y] = key.split(',').map(Number) as [number, number];
    return {
      x,
      y,
      rate: totalAmount > 0
        ? ((cell.userAmount + cell.guestAmount) / totalAmount) * 100
        : 0,
      userAmount: cell.userAmount,
      guestAmount: cell.guestAmount,
    };
  });

  return { categoryId, xNames: X_NAMES, yNames: Y_NAMES, userFullAmount, guestFullAmount, mapData };
};
