/**
 * Category モデル シーダー
 *
 * 各カテゴリには固定 ID を割り当てる。
 * これにより liquors.ts 等から安定した ID 参照が可能になり、
 * 「その他」のような同名カテゴリの衝突を防ぐ。
 *
 * 注意: DB に旧 ID（自動生成）でカテゴリが既に存在する場合は、
 *       一度削除してから再シードすること。
 */

import type { Schema } from '@/amplify/data/resource';
import { buildSeeder } from './runner';

// id は固定値で管理するため Omit から除外する
type Category = Omit<
  Schema['Category']['type'],
  'createdAt' | 'updatedAt' | 'children' | 'parent' | 'liquors' | 'categoryHistories'
>;
type CategoryTree = Category & { children?: CategoryTree[] };

/**
 * liquors.ts 等から参照するカテゴリ定数。
 * key はシーダーコード内の識別子（DB の name と異なる場合がある）。
 * name が「その他」のように重複する場合も key で一意に区別できる。
 */
export const CATEGORIES = {
  // ── 蒸留酒 ──
  スペイサイド: { id: 'cat-speyside', name: 'スペイサイド' },
  ハイランド: { id: 'cat-highland', name: 'ハイランド' },
  ローランド: { id: 'cat-lowland', name: 'ローランド' },
  アイランズ: { id: 'cat-islands', name: 'アイランズ' },
  アイラ: { id: 'cat-islay', name: 'アイラ' },
  キャンベルタウン: { id: 'cat-campbeltown', name: 'キャンベルタウン' },
  アイリッシュウイスキー: { id: 'cat-irish-whisky', name: 'アイリッシュウイスキー' },
  アメリカンウイスキー: { id: 'cat-american-whisky', name: 'アメリカンウイスキー' },
  カナディアンウイスキー: { id: 'cat-canadian-whisky', name: 'カナディアンウイスキー' },
  ジャパニーズウイスキー: { id: 'cat-japanese-whisky', name: 'ジャパニーズウイスキー' },
  ジン: { id: 'cat-gin', name: 'ジン' },
  ラム: { id: 'cat-rum', name: 'ラム' },
  ホワイトラム: { id: 'cat-rum-white', name: 'ホワイトラム' },
  ホワイトラムキューバ: { id: 'cat-rum-white-cuba', name: 'キューバ' },
  ホワイトラムバルバドス: { id: 'cat-rum-white-barbados', name: 'バルバドス' },
  ホワイトラムプエルトリコ: { id: 'cat-rum-white-puertorico', name: 'プエルトリコ' },
  ホワイトラムニカラグア: { id: 'cat-rum-white-nicaragua', name: 'ニカラグア' },
  ゴールドラム: { id: 'cat-rum-gold', name: 'ゴールドラム' },
  ゴールドラムジャマイカ: { id: 'cat-rum-gold-jamaica', name: 'ジャマイカ' },
  ゴールドラムキューバ: { id: 'cat-rum-gold-cuba', name: 'キューバ' },
  ゴールドラムバルバドス: { id: 'cat-rum-gold-barbados', name: 'バルバドス' },
  ゴールドラムプエルトリコ: { id: 'cat-rum-gold-puertorico', name: 'プエルトリコ' },
  ダークラム: { id: 'cat-rum-dark', name: 'ダークラム' },
  ダークラムジャマイカ: { id: 'cat-rum-dark-jamaica', name: 'ジャマイカ' },
  ダークラムガイアナ: { id: 'cat-rum-dark-guyana', name: 'ガイアナ（デメラーラ）' },
  ダークラムグアテマラ: { id: 'cat-rum-dark-guatemala', name: 'グアテマラ' },
  ダークラムベネズエラ: { id: 'cat-rum-dark-venezuela', name: 'ベネズエラ' },
  スパイスドラム: { id: 'cat-rum-spiced', name: 'スパイスドラム' },
  アグリコールラム: { id: 'cat-rum-agricole', name: 'アグリコールラム' },
  マルティニーク: { id: 'cat-rum-martinique', name: 'マルティニーク' },
  グアドループ: { id: 'cat-rum-guadeloupe', name: 'グアドループ' },
  ブランデー: { id: 'cat-brandy', name: 'ブランデー' },
  ウォッカ: { id: 'cat-vodka', name: 'ウォッカ' },
  テキーラ: { id: 'cat-tequila', name: 'テキーラ' },
  // ── 醸造酒 ──
  日本酒: { id: 'cat-sake', name: '日本酒' },
  ビール: { id: 'cat-beer', name: 'ビール' },
  ビールラガー: { id: 'cat-beer-lager', name: 'ラガー' },
  ピルスナー: { id: 'cat-beer-pilsner', name: 'ピルスナー' },
  ヘレス: { id: 'cat-beer-helles', name: 'ヘレス' },
  デュンケル: { id: 'cat-beer-dunkel', name: 'デュンケル' },
  ボック: { id: 'cat-beer-bock', name: 'ボック' },
  ビールエール: { id: 'cat-beer-ale', name: 'エール' },
  IPA: { id: 'cat-beer-ipa', name: 'IPA' },
  ペールエール: { id: 'cat-beer-pale-ale', name: 'ペールエール' },
  スタウト: { id: 'cat-beer-stout', name: 'スタウト' },
  ヴァイツェン: { id: 'cat-beer-weizen', name: 'ヴァイツェン' },
  ベルジャン: { id: 'cat-beer-belgian', name: 'ベルジャン' },
  フルーツビール: { id: 'cat-beer-fruit', name: 'フルーツビール' },
  赤ワイン: { id: 'cat-red-wine', name: '赤ワイン' },
  白ワイン: { id: 'cat-white-wine', name: '白ワイン' },
  ロゼワイン: { id: 'cat-rose-wine', name: 'ロゼワイン' },
  スパークリングワイン: { id: 'cat-sparkling', name: 'スパークリングワイン' },
  デザートワイン: { id: 'cat-dessert-wine', name: 'デザートワイン' },
  // ── 混成酒(リキュール) ──
  フルーツ系: { id: 'cat-fruit', name: 'フルーツ系' },
  ハーブ系: { id: 'cat-herb', name: 'ハーブ系' },
  ナッツ系: { id: 'cat-nuts', name: 'ナッツ系' },
  コーヒー系: { id: 'cat-coffee', name: 'コーヒー系' },
  カカオ系: { id: 'cat-cacao', name: 'カカオ系' },
  カカオホワイト: { id: 'cat-cacao-white', name: 'ホワイト' },
  カカオブラウン: { id: 'cat-cacao-brown', name: 'ブラウン' },
  リキュールその他: { id: 'cat-liqueur-other', name: 'その他' },
} as const;

const tree: CategoryTree[] = [
  {
    id: 'cat-distilled',
    name: '蒸留酒',
    readonly: true,
    versionNo: 1,
    children: [
      {
        id: 'cat-whisky',
        name: 'ウイスキー',
        readonly: true,
        versionNo: 1,
        children: [
          {
            id: 'cat-scotch',
            name: 'スコッチウイスキー',
            readonly: true,
            versionNo: 1,
            children: [
              { ...CATEGORIES.スペイサイド, readonly: true, versionNo: 1 },
              { ...CATEGORIES.ハイランド, readonly: true, versionNo: 1 },
              { ...CATEGORIES.ローランド, readonly: true, versionNo: 1 },
              { ...CATEGORIES.アイランズ, readonly: true, versionNo: 1 },
              { ...CATEGORIES.アイラ, readonly: true, versionNo: 1 },
              { ...CATEGORIES.キャンベルタウン, readonly: true, versionNo: 1 },
            ],
          },
          { ...CATEGORIES.アイリッシュウイスキー, readonly: true, versionNo: 1 },
          { ...CATEGORIES.アメリカンウイスキー, readonly: true, versionNo: 1 },
          { ...CATEGORIES.カナディアンウイスキー, readonly: true, versionNo: 1 },
          { ...CATEGORIES.ジャパニーズウイスキー, readonly: true, versionNo: 1 },
        ],
      },
      { ...CATEGORIES.ジン, readonly: true, versionNo: 1 },
      {
        ...CATEGORIES.ラム,
        readonly: true,
        versionNo: 1,
        children: [
          {
            ...CATEGORIES.ホワイトラム,
            readonly: true,
            versionNo: 1,
            children: [
              { ...CATEGORIES.ホワイトラムキューバ, readonly: true, versionNo: 1 },
              { ...CATEGORIES.ホワイトラムバルバドス, readonly: true, versionNo: 1 },
              { ...CATEGORIES.ホワイトラムプエルトリコ, readonly: true, versionNo: 1 },
              { ...CATEGORIES.ホワイトラムニカラグア, readonly: true, versionNo: 1 },
            ],
          },
          {
            ...CATEGORIES.ゴールドラム,
            readonly: true,
            versionNo: 1,
            children: [
              { ...CATEGORIES.ゴールドラムジャマイカ, readonly: true, versionNo: 1 },
              { ...CATEGORIES.ゴールドラムキューバ, readonly: true, versionNo: 1 },
              { ...CATEGORIES.ゴールドラムバルバドス, readonly: true, versionNo: 1 },
              { ...CATEGORIES.ゴールドラムプエルトリコ, readonly: true, versionNo: 1 },
            ],
          },
          {
            ...CATEGORIES.ダークラム,
            readonly: true,
            versionNo: 1,
            children: [
              { ...CATEGORIES.ダークラムジャマイカ, readonly: true, versionNo: 1 },
              { ...CATEGORIES.ダークラムガイアナ, readonly: true, versionNo: 1 },
              { ...CATEGORIES.ダークラムグアテマラ, readonly: true, versionNo: 1 },
              { ...CATEGORIES.ダークラムベネズエラ, readonly: true, versionNo: 1 },
            ],
          },
          { ...CATEGORIES.スパイスドラム, readonly: true, versionNo: 1 },
          {
            ...CATEGORIES.アグリコールラム,
            readonly: true,
            versionNo: 1,
            children: [
              { ...CATEGORIES.マルティニーク, readonly: true, versionNo: 1 },
              { ...CATEGORIES.グアドループ, readonly: true, versionNo: 1 },
            ],
          },
        ],
      },
      { ...CATEGORIES.ブランデー, readonly: true, versionNo: 1 },
      { ...CATEGORIES.ウォッカ, readonly: true, versionNo: 1 },
      { ...CATEGORIES.テキーラ, readonly: true, versionNo: 1 },
    ],
  },
  {
    id: 'cat-brewed',
    name: '醸造酒',
    readonly: true,
    versionNo: 1,
    children: [
      { ...CATEGORIES.日本酒, readonly: true, versionNo: 1 },
      {
        ...CATEGORIES.ビール,
        readonly: true,
        versionNo: 1,
        children: [
          {
            ...CATEGORIES.ビールラガー,
            readonly: true,
            versionNo: 1,
            children: [
              { ...CATEGORIES.ピルスナー, readonly: true, versionNo: 1 },
              { ...CATEGORIES.ヘレス, readonly: true, versionNo: 1 },
              { ...CATEGORIES.デュンケル, readonly: true, versionNo: 1 },
              { ...CATEGORIES.ボック, readonly: true, versionNo: 1 },
            ],
          },
          {
            ...CATEGORIES.ビールエール,
            readonly: true,
            versionNo: 1,
            children: [
              { ...CATEGORIES.IPA, readonly: true, versionNo: 1 },
              { ...CATEGORIES.ペールエール, readonly: true, versionNo: 1 },
              { ...CATEGORIES.スタウト, readonly: true, versionNo: 1 },
              { ...CATEGORIES.ヴァイツェン, readonly: true, versionNo: 1 },
              { ...CATEGORIES.ベルジャン, readonly: true, versionNo: 1 },
            ],
          },
          { ...CATEGORIES.フルーツビール, readonly: true, versionNo: 1 },
        ],
      },
      {
        id: 'cat-wine',
        name: 'ワイン',
        readonly: true,
        versionNo: 1,
        children: [
          { ...CATEGORIES.赤ワイン, readonly: true, versionNo: 1 },
          { ...CATEGORIES.白ワイン, readonly: true, versionNo: 1 },
          { ...CATEGORIES.ロゼワイン, readonly: true, versionNo: 1 },
          { ...CATEGORIES.スパークリングワイン, readonly: true, versionNo: 1 },
          { ...CATEGORIES.デザートワイン, readonly: true, versionNo: 1 },
        ],
      },
      { id: 'cat-brewed-other', name: 'その他', readonly: true, versionNo: 1 },
    ],
  },
  {
    id: 'cat-liqueur',
    name: '混成酒(リキュール)',
    readonly: true,
    versionNo: 1,
    children: [
      { ...CATEGORIES.フルーツ系, readonly: true, versionNo: 1 },
      { ...CATEGORIES.ハーブ系, readonly: true, versionNo: 1 },
      {
        ...CATEGORIES.ナッツ系,
        readonly: true,
        versionNo: 1,
        children: [
          { ...CATEGORIES.コーヒー系, readonly: true, versionNo: 1 },
          {
            ...CATEGORIES.カカオ系,
            readonly: true,
            versionNo: 1,
            children: [
              { ...CATEGORIES.カカオホワイト, readonly: true, versionNo: 1 },
              { ...CATEGORIES.カカオブラウン, readonly: true, versionNo: 1 },
            ],
          },
        ],
      },
      { ...CATEGORIES.リキュールその他, readonly: true, versionNo: 1 },
    ],
  },
  { id: 'cat-other', name: 'その他', readonly: true, versionNo: 1 },
];

// ツリーをフラット配列に変換する。parent はオブジェクト参照で親を示す。
function flatten(
  nodes: CategoryTree[],
  parent: Category | null = null,
): Array<{ item: Category; parent: Category | null }> {
  return nodes.flatMap(({ children, ...item }) => [
    { item, parent },
    ...flatten(children ?? [], item),
  ]);
}

export const categoriesSeeder = buildSeeder<Category, Schema['Category']['type']>({
  modelName: 'Category',
  data: flatten(tree),
  toKey: (c, parentId) => `${c.name}:${parentId ?? ''}`,
  toExistingKey: (r) => `${r.name}:${r.parentId ?? ''}`,
  getLabel: (c) => c.name,
  create: (client, c, parentId) =>
    client.models.Category.create({
      id: c.id,
      name: c.name,
      parentId: parentId ?? undefined,
      readonly: c.readonly,
      versionNo: c.versionNo,
    }),
  delete: (client, id) => client.models.Category.delete({ id }),
  list: (client, token) => client.models.Category.list({ limit: 500, nextToken: token }),
});
