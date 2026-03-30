import { a } from '@aws-amplify/backend';
import { getIsBookMarked } from '../../functions/getIsBookMarked/resource';

/** ブックマーク関連のモデル・型・クエリ */
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
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['admin']),
    ]),

  // ----------------------------------------------------------------
  // CUSTOM TYPES（Lambda 戻り値）
  // ----------------------------------------------------------------

  BookMarkListUser: a.customType({
    userId: a.id().required(),
    name: a.string().required(),
    imageBase64: a.string(),
    createdAt: a.datetime().required(),
  }),

  // ----------------------------------------------------------------
  // CUSTOM QUERIES
  // ----------------------------------------------------------------

  /** 対象お酒をブックマーク済みか判定 */
  getIsBookMarked: a
    .query()
    .arguments({ id: a.string().required() })
    .returns(a.boolean().required())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(getIsBookMarked)),
};
