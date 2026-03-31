/**
 * Category モデル シーダー
 */

import type { Schema } from '@/amplify/data/resource';
import { buildSeeder } from './runner';

// Amplify 自動生成フィールド・リレーション型は Omit してシード用の型に絞る
type Category = Omit<
  Schema['Category']['type'],
  'id' | 'createdAt' | 'updatedAt' | 'children' | 'parent' | 'liquors' | 'categoryHistories'
>;
type CategoryTree = Category & { children?: CategoryTree[] };

const tree: CategoryTree[] = [
  {
    name: '蒸留酒', readonly: true, versionNo: 1, children: [
      {
        name: 'ウイスキー', readonly: true, versionNo: 1, children: [
          {
            name: 'スコッチウイスキー', readonly: true, versionNo: 1, children: [
              { name: 'スペイサイド',     readonly: true, versionNo: 1 },
              { name: 'ハイランド',       readonly: true, versionNo: 1 },
              { name: 'ローランド',       readonly: true, versionNo: 1 },
              { name: 'アイランズ',       readonly: true, versionNo: 1 },
              { name: 'アイラ',           readonly: true, versionNo: 1 },
              { name: 'キャンベルタウン', readonly: true, versionNo: 1 },
            ],
          },
          { name: 'アイリッシュウイスキー', readonly: true, versionNo: 1 },
          { name: 'アメリカンウイスキー',   readonly: true, versionNo: 1 },
          { name: 'カナディアンウイスキー', readonly: true, versionNo: 1 },
          { name: 'ジャパニーズウイスキー', readonly: true, versionNo: 1 },
        ],
      },
      { name: 'ジン',       readonly: true, versionNo: 1 },
      { name: 'ラム',       readonly: true, versionNo: 1 },
      { name: 'ブランデー', readonly: true, versionNo: 1 },
      { name: 'ウォッカ',   readonly: true, versionNo: 1 },
      { name: 'テキーラ',   readonly: true, versionNo: 1 },
    ],
  },
  {
    name: '醸造酒', readonly: true, versionNo: 1, children: [
      { name: '日本酒', readonly: true, versionNo: 1 },
      { name: 'ビール', readonly: true, versionNo: 1 },
      { name: 'ワイン', readonly: true, versionNo: 1 },
      { name: 'その他', readonly: true, versionNo: 1 },
    ],
  },
  { name: '混成酒(リキュール)', readonly: true, versionNo: 1 },
  { name: 'その他',             readonly: true, versionNo: 1 },
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
      name: c.name,
      parentId: parentId ?? undefined,
      readonly: c.readonly,
      versionNo: c.versionNo,
    }),
  list: (client, token) =>
    client.models.Category.list({ limit: 500, nextToken: token }),
});
