---
name: coder
description: コーディングタスク（ファイル作成・編集・リファクタリング）を担当するエージェント。コンポーネント実装、関数追加、バグ修正などコードを書く作業はすべてこのエージェントが処理する。
---

# 共通ルール

@../../CLAUDE.md

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
