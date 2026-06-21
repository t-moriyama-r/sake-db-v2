import { a } from '@aws-amplify/backend';

/**
 * 掲示板投稿（お酒へのレビュー・コメント）
 *
 * - 公開読み取り可能
 * - 未ログインでも投稿可能（guest create を許可）
 * - 投稿者（owner）が更新・削除可能
 */
export const boardModels = {
  BoardPost: a
    .model({
      liquorId: a.id().required(),
      liquor: a.belongsTo('Liquor', 'liquorId'),
      /** 匿名投稿は null */
      userId: a.id(),
      userName: a.string(),
      userImageBase64: a.string(),
      categoryId: a.id().required(),
      categoryName: a.string().required(),
      liquorName: a.string().required(),
      text: a.string().required(),
      /** 評価なしの場合は null */
      rate: a.integer(),
    })
    .secondaryIndexes((index) => [index('userId'), index('liquorId')])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.publicApiKey().to(['read', 'create']),
      allow.authenticated().to(['read', 'create']),
      allow.owner().to(['create', 'update', 'delete']),
      allow.groups(['admin']),
    ]),
};
