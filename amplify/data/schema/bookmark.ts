import { a } from '@aws-amplify/backend';

/** ブックマーク関連のモデル */
export const bookmarkSchema = {
  // ----------------------------------------------------------------
  // MODELS（DynamoDB テーブル）
  // ----------------------------------------------------------------

  /**
   * ブックマーク
   *
   * - 自分のブックマークのみ参照・操作可能
   */
  BookMark: a
    .model({
      owner: a.string().authorization((allow) => [allow.owner().to(['read'])]),
      liquorId: a.id().required(),
      liquor: a.belongsTo('Liquor', 'liquorId'),
    })
    .secondaryIndexes((index) => [index('liquorId')])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['admin']),
    ]),
};
