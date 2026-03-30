import { a } from '@aws-amplify/backend';
import { getUserByIdDetail } from '../../functions/getUserByIdDetail/resource';

/** ユーザー関連のモデル・型・クエリ */
export const userSchema = {
  // ----------------------------------------------------------------
  // MODELS（DynamoDB テーブル）
  // ----------------------------------------------------------------

  /**
   * ユーザープロフィール（名前・画像など Cognito 外の属性を管理）
   *
   * - cognitoId は Cognito の sub（UUID）
   * - フロントエンドでログイン後に create、更新は update で行う
   * - getUserByIdDetail Lambda はこのモデルからユーザー情報を取得する
   */
  UserProfile: a
    .model({
      owner: a.string().authorization((allow) => [allow.owner().to(['read'])]),
      /** Cognito sub（UUID） */
      cognitoId: a.id().required(),
      name: a.string().required(),
      email: a.string().required(),
      profile: a.string(),
      /** 縮小 Base64 プロフィール画像 */
      imageBase64: a.string(),
      roles: a.string().array(),
    })
    .secondaryIndexes((index) => [index('cognitoId')])
    .authorization((allow) => [
      allow.owner().to(['read', 'create', 'update']),
      allow.authenticated().to(['read']),
      allow.groups(['admin']),
    ]),

  // ----------------------------------------------------------------
  // CUSTOM TYPES（Lambda 戻り値）
  // ----------------------------------------------------------------

  /** カスタムクエリ・Lambda の戻り値用ユーザー型 */
  UserProfileData: a.customType({
    id: a.id().required(),
    name: a.string().required(),
    email: a.string().required(),
    profile: a.string(),
    imageBase64: a.string(),
    roles: a.string().array(),
  }),

  UserLiquor: a.customType({
    id: a.id().required(),
    liquorId: a.id().required(),
    name: a.string().required(),
    categoryId: a.id().required(),
    categoryName: a.string().required(),
    imageBase64: a.string(),
    comment: a.string(),
    rate: a.integer(),
    updatedAt: a.datetime().required(),
  }),

  UserEvaluateList: a.customType({
    recentComments: a.ref('UserLiquor').array(),
    rate5Liquors: a.ref('UserLiquor').array(),
    rate4Liquors: a.ref('UserLiquor').array(),
    rate3Liquors: a.ref('UserLiquor').array(),
    rate2Liquors: a.ref('UserLiquor').array(),
    rate1Liquors: a.ref('UserLiquor').array(),
    noRateLiquors: a.ref('UserLiquor').array(),
  }),

  UserPageData: a.customType({
    evaluateList: a.ref('UserEvaluateList').required(),
    user: a.ref('UserProfileData').required(),
  }),

  // ----------------------------------------------------------------
  // CUSTOM QUERIES
  // ----------------------------------------------------------------

  /** ユーザープロフィールと評価リストを返す */
  getUserByIdDetail: a
    .query()
    .arguments({ id: a.string().required() })
    .returns(a.ref('UserPageData').required())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(getUserByIdDetail)),
};
