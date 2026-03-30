import { a } from '@aws-amplify/backend';

/** カテゴリ関連のモデル・型 */
export const categorySchema = {
  // ----------------------------------------------------------------
  // MODELS（DynamoDB テーブル）
  // ----------------------------------------------------------------

  /**
   * カテゴリ（階層構造）
   *
   * - 自己参照リレーション: parent / children (parentId で結合)
   * - 公開読み取り可能、書き込みは admin グループのみ
   */
  Category: a
    .model({
      name: a.string().required(),
      /** 親カテゴリの ID。ルートカテゴリは null */
      parentId: a.id(),
      parent: a.belongsTo('Category', 'parentId'),
      children: a.hasMany('Category', 'parentId'),
      description: a.string(),
      imageUrl: a.string(),
      /** S3 画像の縮小 Base64 */
      imageBase64: a.string(),
      versionNo: a.integer(),
      readonly: a.boolean().required(),
      createUserId: a.id(),
      createUserName: a.string(),
      updateUserId: a.id(),
      updateUserName: a.string(),
      liquors: a.hasMany('Liquor', 'categoryId'),
      categoryHistories: a.hasMany('CategoryHistory', 'categoryId'),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.groups(['admin']),
      /** シードスクリプト用（apiKey による書き込みを許可） */
      allow.publicApiKey(),
    ]),

  /**
   * カテゴリの編集履歴（バージョン管理）
   */
  CategoryHistory: a
    .model({
      categoryId: a.id().required(),
      category: a.belongsTo('Category', 'categoryId'),
      name: a.string().required(),
      parentId: a.id(),
      description: a.string(),
      imageUrl: a.string(),
      imageBase64: a.string(),
      versionNo: a.integer().required(),
      updateUserId: a.id(),
      updateUserName: a.string(),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.groups(['admin']),
    ]),

  // ----------------------------------------------------------------
  // CUSTOM TYPES（Lambda 戻り値・ネスト型）
  // ----------------------------------------------------------------

  /** カテゴリのパンくずリスト（Liquor.categoryTrail に埋め込まれる） */
  CategoryTrail: a.customType({
    id: a.id().required(),
    name: a.string().required(),
  }),
};
