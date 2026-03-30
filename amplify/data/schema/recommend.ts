import { a } from '@aws-amplify/backend';
import { getRecommendLiquorList } from '../../functions/getRecommendLiquorList/resource';

/**
 * おすすめ関連の型・クエリ
 *
 * 専用テーブルはなく、Lambda が BookMark・BoardPost・Liquor を横断集計して返す。
 */
export const recommendSchema = {
  // ----------------------------------------------------------------
  // CUSTOM TYPES（Lambda 戻り値）
  // ----------------------------------------------------------------

  RecommendLiquor: a.customType({
    id: a.id().required(),
    name: a.string().required(),
    categoryId: a.id().required(),
    categoryName: a.string().required(),
    imageBase64: a.string(),
    description: a.string().required(),
  }),

  RecommendUser: a.customType({
    id: a.id().required(),
    name: a.string().required(),
    imageBase64: a.string(),
  }),

  Recommend: a.customType({
    rate: a.integer().required(),
    comment: a.string().required(),
    liquor: a.ref('RecommendLiquor').required(),
    user: a.ref('RecommendUser').required(),
    updatedAt: a.datetime().required(),
  }),

  // ----------------------------------------------------------------
  // CUSTOM QUERIES
  // ----------------------------------------------------------------

  /** ブックマーク考慮のおすすめレビューリスト */
  getRecommendLiquorList: a
    .query()
    .returns(a.ref('Recommend').array().required())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(getRecommendLiquorList)),
};
