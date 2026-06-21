import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { buildSearchCache } from '../functions/liquor/buildSearchCache/resource';
import { bookmarkSchema } from './schema/bookmark';
import { categorySchema } from './schema/category';
import { liquorSchema } from './schema/liquor/liquorSchema';
import { userSchema } from './schema/user';

/**
 * sake-db GraphQL スキーマを Amplify Gen 2 に移植したデータスキーマ。
 *
 * 認証ルールの対応:
 *   @auth         → allow.authenticated()
 *   @optionalAuth → allow.guest() + allow.authenticated()
 *   @adminAuth    → allow.groups(['admin'])
 *   (なし/公開)   → allow.guest() + allow.authenticated()
 *
 * ユーザー属性の管理:
 *   名前・プロフィール・画像は UserProfile モデル (DynamoDB) で管理。
 *   メール・パスワードは Amplify Auth (Cognito) で管理。
 *   フロントエンドから直接 client.models.UserProfile を操作すること。
 */
const schema = a.schema({
  ...bookmarkSchema,
  ...categorySchema,
  ...liquorSchema,
  ...userSchema,
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    /** デフォルトは Cognito UserPool 認証 */
    defaultAuthorizationMode: 'userPool',
    /** 未ログインユーザーのアクセスには identityPool を使用 */
    /** シードスクリプトなどサーバーサイド処理用 API キー */
    apiKeyAuthorizationMode: { expiresInDays: 365 },
  },
  /**
   * Data にアクセスする Lambda 関数を登録する。
   * buildSearchCache: EventBridge で 1 時間ごとに実行される検索インデックス構築関数。
   */
  functions: {
    buildSearchCache,
  },
});
