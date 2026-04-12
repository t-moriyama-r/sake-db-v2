import { a } from '@aws-amplify/backend';
import { getFlavorMap } from '../../../functions/getFlavorMap/resource';

/**
 * フレーバーマップ表示用の集計データ
 *
 * - FlavorCellData: マップの 1 セル分の集計値
 * - FlavorMapData: マップ全体（FlavorCellData[] を含む親）
 * - getFlavorMap: FlavorVote を集計してマップを返す Lambda クエリ
 */
export const flavorMapModels = {
  /** フレーバーマップの 1 セル（集計値） */
  FlavorCellData: a.customType({
    x: a.float().required(),
    y: a.float().required(),
    rate: a.float().required(),
    userAmount: a.integer().required(),
    guestAmount: a.integer().required(),
  }),

  /** フレーバーマップ全体（Lambda で集計して返す） */
  FlavorMapData: a.customType({
    categoryId: a.id().required(),
    xNames: a.string().array().required(),
    yNames: a.string().array().required(),
    userFullAmount: a.integer().required(),
    guestFullAmount: a.integer().required(),
    mapData: a.ref('FlavorCellData').array().required(),
  }),

  /** FlavorVote を集計してフレーバーマップを返す */
  getFlavorMap: a
    .query()
    .arguments({ liquorId: a.id().required() })
    .returns(a.ref('FlavorMapData'))
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(getFlavorMap)),
};
