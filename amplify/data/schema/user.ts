import { a } from '@aws-amplify/backend';

/** ユーザー関連のモデル */
export const userSchema = {
  // ----------------------------------------------------------------
  // MODELS（DynamoDB テーブル）
  // ----------------------------------------------------------------

  /**
   * ユーザープロフィール（名前・画像など Cognito 外の属性を管理）
   *
   * - cognitoId は Cognito の sub（UUID）
   * - フロントエンドでログイン後に create、更新は update で行う
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
};
