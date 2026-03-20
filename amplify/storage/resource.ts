import { defineStorage } from '@aws-amplify/backend';

/**
 * S3 ストレージ設定
 *
 * パス構成:
 *   liquors/{liquorId}/       - お酒の画像
 *   categories/{categoryId}/  - カテゴリの画像
 *   profile-images/{entity_id}/ - ユーザーのプロフィール画像（entity_id は Cognito IdentityID）
 *
 * entity_id トークンはアクセス時に実際の IdentityID へ置換される。
 * フロントエンドからは `uploadData({ path: 'profile-images/{identityId}/avatar.jpg', ... })` のように使う。
 */
export const storage = defineStorage({
  name: 'sakeDbStorage',
  access: (allow) => ({
    // ---- お酒画像 ----
    // 未ログインでも閲覧可能、ログインユーザーが投稿・更新可、admin のみ削除可
    'liquors/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write']),
      allow.groups(['admin']).to(['read', 'write', 'delete']),
    ],

    // ---- カテゴリ画像 ----
    // 未ログインでも閲覧可能、admin のみ書き込み・削除可
    'categories/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
      allow.groups(['admin']).to(['read', 'write', 'delete']),
    ],

    // ---- プロフィール画像 ----
    // 本人のみ書き込み・削除可、ログインユーザーが閲覧可
    'profile-images/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']),
    ],
  }),
});
