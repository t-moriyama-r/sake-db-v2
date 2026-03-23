import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { checkAdmin } from '../functions/checkAdmin/resource';
import { getAffiliateData } from '../functions/getAffiliateData/resource';
import { getFlavorMap } from '../functions/getFlavorMap/resource';
import { getVoted } from '../functions/getVoted/resource';
import { getRecommendLiquorList } from '../functions/getRecommendLiquorList/resource';
import { randomRecommendList } from '../functions/randomRecommendList/resource';
import { listFromCategory } from '../functions/listFromCategory/resource';
import { searchLiquors } from '../functions/searchLiquors/resource';
import { searchLiquorsByTag } from '../functions/searchLiquorsByTag/resource';
import { liquorHistories } from '../functions/liquorHistories/resource';
import { getUserByIdDetail } from '../functions/getUserByIdDetail/resource';
import { getIsBookMarked } from '../functions/getIsBookMarked/resource';
import { postFlavor } from '../functions/postFlavor/resource';

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
  // ================================================================
  // CUSTOM TYPES
  // ================================================================

  /** カテゴリのパンくずリスト */
  CategoryTrail: a.customType({
    id: a.id().required(),
    name: a.string().required(),
  }),

  // ---- Amazon アフィリエイト ----

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

  // ---- フレーバーマップ ----

  /** フレーバーマップの 1 セル（集計値） */
  FlavorCellData: a.customType({
    x: a.float().required(),
    y: a.float().required(),
    rate: a.float().required(),
    userAmount: a.integer().required(),
    guestAmount: a.integer().required(),
  }),

  /** フレーバーマップ全体（Lambda で集計して返す） */
  FlavorMapData: a.customType({
    categoryId: a.id().required(),
    xNames: a.string().array().required(),
    yNames: a.string().array().required(),
    userFullAmount: a.integer().required(),
    guestFullAmount: a.integer().required(),
    mapData: a.ref('FlavorCellData').array().required(),
  }),

  /** 自分が投票したフレーバーデータ */
  VotedData: a.customType({
    liquorId: a.id().required(),
    userId: a.id().required(),
    categoryId: a.id().required(),
    x: a.float().required(),
    y: a.float().required(),
    updatedAt: a.datetime().required(),
  }),

  // ---- ブックマーク ----

  BookMarkListUser: a.customType({
    userId: a.id().required(),
    name: a.string().required(),
    imageBase64: a.string(),
    createdAt: a.datetime().required(),
  }),

  // ---- おすすめ ----

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

  // ---- ユーザー ----

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

  // ---- カテゴリ別お酒一覧 ----

  /**
   * listFromCategory の戻り値。
   * liquors フィールドは JSON シリアライズされた Liquor[] を返す。
   * フロントエンドで JSON.parse して使用すること。
   */
  ListFromCategory: a.customType({
    categoryName: a.string().required(),
    categoryDescription: a.string(),
    liquors: a.json().required(),
  }),

  // ================================================================
  // MODELS（DynamoDB テーブル）
  // ================================================================

  /**
   * ユーザープロフィール（名前・画像など Cognito 外の属性を管理）
   *
   * - cognitoId は Cognito の sub（UUID）
   * - フロントエンドでログイン後に create、更新は update で行う
   * - getUserByIdDetail Lambda はこのモデルからユーザー情報を取得する
   */
  UserProfile: a
    .model({
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
    ]),

  /**
   * お酒（sake）
   *
   * - 公開読み取り可能
   * - ログインユーザーが作成・更新可能
   * - rate*Users: 各評価をつけたユーザー ID の配列（非正規化）
   */
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
    ]),

  /**
   * 掲示板投稿（お酒へのレビュー・コメント）
   *
   * - 公開読み取り可能
   * - @optionalAuth: 未ログインでも投稿可能（guest create を許可）
   * - 投稿者（owner）が更新・削除可能
   */
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
      youtube: a.string(),
      /** 評価なしの場合は null */
      rate: a.integer(),
    })
    .authorization((allow) => [
      allow.guest().to(['read', 'create']),
      allow.authenticated().to(['read', 'create']),
      allow.owner().to(['update', 'delete']),
      allow.groups(['admin']),
    ]),

  /**
   * タグ
   *
   * - 公開読み取り可能
   * - ログインユーザーが作成可能、作成者（owner）が削除可能
   */
  Tag: a
    .model({
      liquorId: a.id().required(),
      liquor: a.belongsTo('Liquor', 'liquorId'),
      text: a.string().required(),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read', 'create']),
      allow.owner().to(['delete']),
      allow.groups(['admin']),
    ]),

  /**
   * ブックマーク
   *
   * - 自分のブックマークのみ参照・操作可能
   */
  BookMark: a
    .model({
      liquorId: a.id().required(),
      liquor: a.belongsTo('Liquor', 'liquorId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['admin']),
    ]),

  /**
   * フレーバーマップ投票（個別投票レコード）
   *
   * - @optionalAuth: 未ログインでも投票可能
   * - 集計は getFlavorMap Lambda で行う
   */
  FlavorVote: a
    .model({
      liquorId: a.id().required(),
      liquor: a.belongsTo('Liquor', 'liquorId'),
      /** カテゴリごとにフレーバー軸が異なるため保持 */
      categoryId: a.id().required(),
      x: a.float().required(),
      y: a.float().required(),
    })
    .authorization((allow) => [
      allow.guest().to(['read', 'create']),
      allow.owner().to(['read', 'create', 'update', 'delete']),
      allow.groups(['admin']),
    ]),

  /**
   * お酒の編集履歴（バージョン管理）
   */
  LiquorHistory: a
    .model({
      liquorId: a.id().required(),
      liquor: a.belongsTo('Liquor', 'liquorId'),
      categoryId: a.id().required(),
      categoryName: a.string().required(),
      name: a.string().required(),
      description: a.string(),
      imageUrl: a.string(),
      imageBase64: a.string(),
      youtube: a.string(),
      versionNo: a.integer().required(),
      updateUserId: a.id(),
      updateUserName: a.string(),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.groups(['admin']),
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

  // ================================================================
  // CUSTOM QUERIES
  // ================================================================

  /** admin グループに所属しているか判定 */
  checkAdmin: a
    .query()
    .returns(a.boolean().required())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(checkAdmin)),

  /** Amazon アフィリエイトデータ取得（PA-API） */
  getAffiliateData: a
    .query()
    .arguments({ name: a.string().required(), limit: a.integer() })
    .returns(a.ref('AffiliateData').required())
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(getAffiliateData)),

  /** FlavorVote を集計してフレーバーマップを返す */
  getFlavorMap: a
    .query()
    .arguments({ liquorId: a.id().required() })
    .returns(a.ref('FlavorMapData'))
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(getFlavorMap)),

  /** 現在のユーザーが対象お酒に投票したデータを返す */
  getVoted: a
    .query()
    .arguments({ liquorId: a.id().required() })
    .returns(a.ref('VotedData'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(getVoted)),

  /** ブックマーク考慮のおすすめレビューリスト */
  getRecommendLiquorList: a
    .query()
    .returns(a.ref('Recommend').array().required())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(getRecommendLiquorList)),

  /**
   * ランダムなお酒リスト。
   * 戻り値は JSON シリアライズされた Liquor[]。
   */
  randomRecommendList: a
    .query()
    .arguments({ limit: a.integer().required() })
    .returns(a.json().required())
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(randomRecommendList)),

  /**
   * カテゴリ別お酒一覧。
   * liquors フィールドは JSON 文字列（Liquor[]）。
   */
  listFromCategory: a
    .query()
    .arguments({ categoryId: a.id().required() })
    .returns(a.ref('ListFromCategory').required())
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(listFromCategory)),

  /**
   * キーワード検索。
   * 戻り値は JSON シリアライズされた Liquor[]。
   */
  searchLiquors: a
    .query()
    .arguments({ keyword: a.string().required(), limit: a.integer() })
    .returns(a.json().required())
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(searchLiquors)),

  /**
   * タグで検索。
   * 戻り値は JSON シリアライズされた Liquor[]。
   */
  searchLiquorsByTag: a
    .query()
    .arguments({ tag: a.string().required() })
    .returns(a.json().required())
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(searchLiquorsByTag)),

  /**
   * お酒の編集履歴。
   * 戻り値は JSON 文字列: { now: Liquor, histories: LiquorHistory[] }
   */
  liquorHistories: a
    .query()
    .arguments({ id: a.id().required() })
    .returns(a.json())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(liquorHistories)),

  /** ユーザープロフィールと評価リストを返す */
  getUserByIdDetail: a
    .query()
    .arguments({ id: a.string().required() })
    .returns(a.ref('UserPageData').required())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(getUserByIdDetail)),

  /** 対象お酒をブックマーク済みか判定 */
  getIsBookMarked: a
    .query()
    .arguments({ id: a.string().required() })
    .returns(a.boolean().required())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(getIsBookMarked)),

  // ================================================================
  // CUSTOM MUTATIONS
  // ================================================================

  /** フレーバーマップへの投票（upsert）。未ログインでも投票可能 */
  postFlavor: a
    .mutation()
    .arguments({
      liquorId: a.id().required(),
      x: a.float().required(),
      y: a.float().required(),
    })
    .returns(a.boolean().required())
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(postFlavor)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    /** デフォルトは Cognito UserPool 認証 */
    defaultAuthorizationMode: 'userPool',
    /** 未ログインユーザーのアクセスには identityPool を使用 */
  },
});
