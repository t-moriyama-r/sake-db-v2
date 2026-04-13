import { a } from '@aws-amplify/backend';

/**
 * お酒（sake）
 *
 * - 公開読み取り可能
 * - ログインユーザーが作成・更新可能
 * - rate*Users: 各評価をつけたユーザー ID の配列（非正規化）
 */
export const liquorModels = {
  Liquor: a
    .model({
      categoryId: a.id().required(),
      category: a.belongsTo('Category', 'categoryId'),
      /** 表示高速化のため非正規化して保持 */
      categoryName: a.string().required(),
      /** パンくずリスト用（非正規化） */
      categoryTrail: a.ref('CategoryTrail').array(),
      name: a.string().required(),
      description: a.string(),
      /** S3 画像 URL */
      imageUrl: a.string(),
      /** 縮小 Base64 */
      imageBase64: a.string(),
      youtube: a.string(),
      /** 評価 5 をつけたユーザー ID 一覧 */
      rate5Users: a.string().array().required(),
      rate4Users: a.string().array().required(),
      rate3Users: a.string().array().required(),
      rate2Users: a.string().array().required(),
      rate1Users: a.string().array().required(),
      /** 掲示板投稿（未ログイン含む）のrate平均 */
      boardAvgRate: a.float(),
      /** 掲示板投稿のうち rate を設定した件数（未ログイン含む） */
      boardRateCount: a.integer(),
      createUserId: a.id(),
      createUserName: a.string(),
      updateUserId: a.id(),
      updateUserName: a.string(),
      versionNo: a.integer().required(),
      boardPosts: a.hasMany('BoardPost', 'liquorId'),
      tags: a.hasMany('Tag', 'liquorId'),
      flavorVotes: a.hasMany('FlavorVote', 'liquorId'),
      bookmarks: a.hasMany('BookMark', 'liquorId'),
      liquorHistories: a.hasMany('LiquorHistory', 'liquorId'),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read', 'create', 'update']),
      allow.groups(['admin']),
      /** シードスクリプト用（apiKey による書き込みを許可） */
      allow.publicApiKey(),
    ]),
};
