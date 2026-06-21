import { a } from '@aws-amplify/backend';

/**
 * フレーバーマップ投票レコード
 *
 * - FlavorVote: 個別投票レコード（DynamoDB）
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
      allow.guest().to(['read']),
      allow.authenticated().to(['read', 'create']),
      allow.owner().to(['read', 'create', 'update', 'delete']),
      allow.groups(['admin']),
    ]),
};
