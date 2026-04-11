---
name: coder
description: コーディングタスク（ファイル作成・編集・リファクタリング）を担当するエージェント。コンポーネント実装、関数追加、バグ修正などコードを書く作業はすべてこのエージェントが処理する。
---

# 共通ルール

@../../CLAUDE.md

# ログメッセージ

`console.warn` / `console.error` などのログメッセージは日本語で記述すること。

# コンポーネントのファイル構造

`.tsx` コンポーネントファイルを作成・編集する際は、**ファイル名と同名の基盤コンポーネント（`export default` されるメインコンポーネント）を必ずファイルの先頭に定義すること。**

サブコンポーネントや補助関数はその後に定義する。

```tsx
// components/SakeCard.tsx — 正しい構造

export default function SakeCard({ sake }: SakeCardProps) {
  return <div><SakeTitle title={sake.name} /></div>;
}

// サブコンポーネントは後に定義
function SakeTitle({ title }: { title: string }) {
  return <h2>{title}</h2>;
}
```
