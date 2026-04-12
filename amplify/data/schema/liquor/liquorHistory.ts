import { a } from '@aws-amplify/backend';
import { liquorHistories } from '../../../functions/liquorHistories/resource';

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
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.groups(['admin']),
    ]),

  /**
   * お酒の編集履歴。
   * 戻り値は JSON 文字列: { now: Liquor, histories: LiquorHistory[] }
   */
  liquorHistories: a
    .query()
    .arguments({ id: a.id().required() })
    .returns(a.json())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(liquorHistories)),
};
