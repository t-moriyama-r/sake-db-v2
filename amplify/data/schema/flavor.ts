import { a } from '@aws-amplify/backend';
import { getFlavorMap } from '../../functions/getFlavorMap/resource';
import { getVoted } from '../../functions/getVoted/resource';
import { postFlavor } from '../../functions/postFlavor/resource';

/** フレーバーマップ関連のモデル・型・クエリ・ミューテーション */
export const flavorSchema = {
  // ----------------------------------------------------------------
  // MODELS（DynamoDB テーブル）
  // ----------------------------------------------------------------

  /**
   * フレーバーマップ投票（個別投票レコード）
   *
   * - @optionalAuth: 未ログインでも投票可能
   * - 集計は getFlavorMap Lambda で行う
   */
  FlavorVote: a
    .model({
      owner: a.string().authorization((allow) => [allow.owner().to(['read'])]),
      liquorId: a.id().required(),
      liquor: a.belongsTo('Liquor', 'liquorId'),
      /** カテゴリごとにフレーバー軸が異なるため保持 */
      categoryId: a.id().required(),
      x: a.float().required(),
      y: a.float().required(),
    })
    .authorization((allow) => [
      allow.guest().to(['read', 'create']),
      allow.owner().to(['read', 'create', 'update', 'delete']),
      allow.groups(['admin']),
    ]),

  // ----------------------------------------------------------------
  // CUSTOM TYPES（Lambda 戻り値）
  // ----------------------------------------------------------------

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

  /** 自分が投票したフレーバーデータ */
  VotedData: a.customType({
    liquorId: a.id().required(),
    userId: a.id().required(),
    categoryId: a.id().required(),
    x: a.float().required(),
    y: a.float().required(),
    updatedAt: a.datetime().required(),
  }),

  // ----------------------------------------------------------------
  // CUSTOM QUERIES / MUTATIONS
  // ----------------------------------------------------------------

  /** FlavorVote を集計してフレーバーマップを返す */
  getFlavorMap: a
    .query()
    .arguments({ liquorId: a.id().required() })
    .returns(a.ref('FlavorMapData'))
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(getFlavorMap)),

  /** 現在のユーザーが対象お酒に投票したデータを返す */
  getVoted: a
    .query()
    .arguments({ liquorId: a.id().required() })
    .returns(a.ref('VotedData'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(getVoted)),

  /** フレーバーマップへの投票（upsert）。未ログインでも投票可能 */
  postFlavor: a
    .mutation()
    .arguments({
      liquorId: a.id().required(),
      x: a.float().required(),
      y: a.float().required(),
    })
    .returns(a.boolean().required())
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(postFlavor)),
};
