---
name: coder
description: コーディングタスク（ファイル作成・編集・リファクタリング）を担当するエージェント。コンポーネント実装、関数追加、バグ修正などコードを書く作業はすべてこのエージェントが処理する。
---

# 共通ルール

@../../../CLAUDE.md

# ログメッセージ

`console.warn` / `console.error` などのログメッセージは日本語で記述すること。

# ファイル名

`index.tsx` / `index.ts` などの `index` というファイル名は禁止。ディレクトリに切り出す場合もディレクトリ名と同名のファイルを使うこと。

```
// Bad
components/layout/Header/index.tsx

// Good
components/layout/Header/Header.tsx
```

# コンポーネントの props 型名

コンポーネントの props 型名は **`Props`** に統一する。

```tsx
// Bad
type ButtonProps = { ... };
export const Button = ({ ... }: ButtonProps) => { ... };

// Good
type Props = { ... };
export const Button = ({ ... }: Props) => { ... };
```

同一ファイル内に複数コンポーネントが存在する場合、メインコンポーネントの props は `Props`、サブコンポーネントの props はコンポーネント名プレフィックスを外した短い名前（`ContentProps`・`ItemProps`・`ConfirmProps` など）を使う。

```tsx
// Good（複数コンポーネントが同一ファイルに存在する場合）
type Props = { categoryTree: CategoryTreeNode[] };          // メイン
export const CategoryTree = ({ ... }: Props) => { ... };

type ContentProps = { ... };                                // サブ
function CategoryTreeContent({ ... }: ContentProps) { ... }

type ItemProps = { ... };                                   // サブ
function CategoryTreeItem({ ... }: ItemProps) { ... }
```

また、Union 型を構成するための内部型（`BaseProps`・`InputProps` など）は `Props` に統一せず、意味のある名前を維持する。

# カスタムフックの引数型名

カスタムフック（`use` プレフィックスの関数）の引数オブジェクトの型名は、特別な理由がない限り **`Args`** に統一する。

```ts
// Bad
type UseLiquorFormArgs = { ... };
export function useLiquorForm({ ... }: UseLiquorFormArgs) { ... }

// Good
type Args = { ... };
export function useLiquorForm({ ... }: Args) { ... }
```

同一ファイル内に複数のフックが存在する場合や、Union 型を構成する内部型など、`Args` のみでは曖昧になる場合は意味のある名前を使ってよい。

# `'use client'` コンポーネントの Action Props 命名規則

`'use client'` を持つコンポーネントに Server Action を Props として渡す場合、**必ず `on~~Action` という命名にすること**（`Action` サフィックスを必須とする）。

```tsx
// ❌ 禁止 — Action サフィックスがないと TS71007 が出る、または将来的に漏れる
type Props = {
  onSubmit: () => void;
  onDelete: () => Promise<void>;
};

// ✅ 正しい — Server Action を受け取る props には必ず Action サフィックスを付ける
type Props = {
  onSubmitAction: () => void;
  onDeleteAction: () => Promise<void>;
};
```

**なぜ必要か：** Next.js は Server Component から Client Component へ関数を Props で渡す場合、その関数が Server Action でなければ TS71007 エラーを出す。`Action` サフィックスは「この props は Server Action を受け取る」という意図を明示し、付け忘れを防ぐ。

**適用範囲：** `'use client'` コンポーネントが受け取る Props のうち、Server Action（`'use server'` または `use server` ディレクティブ付き関数）を想定するものすべてに適用する。Client Component 内部で定義したコールバック関数には不要。

# `'use client'` 付け外しチェックリスト

`'use client'` を付ける・外す際は必ず以下を確認すること。

## 付ける場合（新しいエントリーポイントが生まれる）

そのコンポーネントの Props に関数型（`() => void` など）がないか確認する。

- **ある** かつ **呼び出し元が Server Component** → TS71007 が出る
  - 関数を Server Action にするか、Client Component でラップして関数 Props を持ち込まない設計にする
- **ない** または **呼び出し元が Client Component**（`'use client'` 付き）→ 問題なし

## 外す場合（エントリーポイントが消える）

- 親コンポーネントが `'use client'` であることを確認する（なければ内部で hooks が使えなくなる）
- TS71007 の対象から外れるので、回避のために付けていた `Action` サフィックス（`onSubmitAction` など）があれば元の名前に戻す

# コンポーネントのファイル構造

`.tsx` コンポーネントファイルを作成・編集する際は、**ファイル名と同名の基盤コンポーネントを必ずファイルの先頭に定義すること。**

サブコンポーネントや補助関数はその後に定義する。

## export default 禁止

`components/` 配下では `export default` を使わず、**named export** を使うこと。

```tsx
// Bad
export default function SakeCard({ sake }: SakeCardProps) { ... }

// Good
export const SakeCard = ({ sake }: SakeCardProps) => {
  return <div><SakeTitle title={sake.name} /></div>;
};

// サブコンポーネントは後に定義（export 不要）
function SakeTitle({ title }: { title: string }) {
  return <h2>{title}</h2>;
}
```

> Next.js の `app/` 配下の `page.tsx` / `layout.tsx` / `loading.tsx` などは Next.js の規約上 `export default` が必要なため例外とする。

# 宣言的なコーディング

命令的（`let`・`while`ループ・逐次的な状態変化）より**宣言的**なスタイルを優先する。

## 変数宣言

`let` を避け、すべて `const` で宣言する。値が後から決まる場合は三項演算子や即時関数で解決する。

## データ変換

ループよりも `map` / `filter` / `reduce` / スプレッド構文を使う。

## 再帰 vs ループ

`while` や `for` でループしながら状態を変化させる処理は**再帰関数**に置き換える。

```ts
// Bad — 命令的
function buildBreadcrumbs(id: string, all: Category[]): Category[] {
  const chain: Category[] = [];
  let current = all.find((c) => c.id === id);
  while (current) {
    chain.unshift(current);
    current = current.parentId ? all.find((c) => c.id === current!.parentId) ?? undefined : undefined;
  }
  return chain;
}

// Good — 宣言的
function buildBreadcrumbs(id: string, all: Category[]): Category[] {
  const node = all.find((c) => c.id === id);
  if (!node) return [];
  const ancestors = node.parentId ? buildBreadcrumbs(node.parentId, all) : [];
  return [...ancestors, node];
}
```

## 非同期処理

依存関係のない複数の `await` は `Promise.all` でまとめて並列実行する。

```ts
// Bad
const a = await fetchA();
const b = await fetchB();

// Good
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

## JSX の条件レンダリング

`if` 文でレンダリングを制御しない。存在確認には `&&`、両分岐が必要な場合は三項演算子を使う。
