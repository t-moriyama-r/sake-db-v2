import { a } from '@aws-amplify/backend';
import { getAffiliateData } from '../../functions/getAffiliateData/resource';

/**
 * Amazon アフィリエイト関連の型・クエリ
 *
 * DynamoDB モデルはなく、Lambda が PA-API を呼び出して返す。
 */
export const affiliateSchema = {
  // ----------------------------------------------------------------
  // CUSTOM TYPES（Lambda 戻り値）
  // ----------------------------------------------------------------

  AffiliateItem: a.customType({
    name: a.string().required(),
    price: a.integer(),
    URL: a.string().required(),
    imageURL: a.string(),
  }),

  AffiliateData: a.customType({
    items: a.ref('AffiliateItem').array(),
    lowestPrice: a.integer(),
  }),

  // ----------------------------------------------------------------
  // CUSTOM QUERIES
  // ----------------------------------------------------------------

  /** Amazon アフィリエイトデータ取得（PA-API） */
  getAffiliateData: a
    .query()
    .arguments({ name: a.string().required(), limit: a.integer() })
    .returns(a.ref('AffiliateData').required())
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(getAffiliateData)),
};
