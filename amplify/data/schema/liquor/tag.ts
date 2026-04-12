import { a } from '@aws-amplify/backend';

/**
 * タグ
 *
 * - 公開読み取り可能
 * - ログインユーザーが作成可能、作成者（owner）が削除可能
 */
export const tagModels = {
  Tag: a
    .model({
      owner: a.string().authorization((allow) => [allow.owner().to(['read'])]),
      liquorId: a.id().required(),
      liquor: a.belongsTo('Liquor', 'liquorId'),
      text: a.string().required(),
    })
    .secondaryIndexes((index) => [index('text')])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read', 'create']),
      allow.owner().to(['delete']),
      allow.groups(['admin']),
    ]),
};
