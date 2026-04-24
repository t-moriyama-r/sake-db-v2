import { a } from '@aws-amplify/backend';

/**
 * タグ
 *
 * - 公開読み取り可能
 * - ログインユーザーが作成・削除可能
 */
export const tagModels = {
  Tag: a
    .model({
      liquorId: a.id().required(),
      liquor: a.belongsTo('Liquor', 'liquorId'),
      text: a.string().required(),
    })
    .secondaryIndexes((index) => [index('text')])
    .authorization((allow) => [
      allow.guest().to(['read', 'create', 'delete']),
      allow.authenticated().to(['read', 'create', 'delete']),
      allow.groups(['admin']),
    ]),
};
