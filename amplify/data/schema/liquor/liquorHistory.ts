import { a } from '@aws-amplify/backend';

/**
 * お酒の編集履歴（バージョン管理）
 *
 * - Liquor とは別 DynamoDB テーブル（1:N のリレーション）
 * - 公開読み取り可能、書き込みはシステム管理のみ
 */
export const liquorHistoryModels = {
  LiquorHistory: a
    .model({
      liquorId: a.id().required(),
      liquor: a.belongsTo('Liquor', 'liquorId'),
      categoryId: a.id().required(),
      categoryName: a.string().required(),
      name: a.string().required(),
      description: a.string(),
      imageUrl: a.string(),
      imageBase64: a.string(),
      youtube: a.string(),
      versionNo: a.integer().required(),
      updateUserId: a.id(),
      updateUserName: a.string(),
    })
    .secondaryIndexes((index) => [index('liquorId')])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read', 'create']),
      allow.groups(['admin']),
      allow.publicApiKey(),
    ]),
};
