import { a } from '@aws-amplify/backend';
import { getVoted } from '../../../functions/getVoted/resource';
import { postFlavor } from '../../../functions/postFlavor/resource';

/**
 * フレーバーマップ投票レコード・操作
 *
 * - FlavorVote: 個別投票レコード（DynamoDB）
 * - VotedData: ログインユーザー自身の投票座標（Lambda 戻り値）
 * - postFlavor: 投票（upsert）。未ログインでも投票可能
 * - getVoted: 自分の投票データ取得
 */
export const flavorVoteModels = {
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

  /** 自分が投票したフレーバーデータ */
  VotedData: a.customType({
    liquorId: a.id().required(),
    userId: a.id().required(),
    categoryId: a.id().required(),
    x: a.float().required(),
    y: a.float().required(),
    updatedAt: a.datetime().required(),
  }),

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

  /** 現在のユーザーが対象お酒に投票したデータを返す */
  getVoted: a
    .query()
    .arguments({ liquorId: a.id().required() })
    .returns(a.ref('VotedData'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(getVoted)),
};
