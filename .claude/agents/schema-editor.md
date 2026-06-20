---
name: schema-editor
description: Amplify Gen2 のデータスキーマ（amplify/data/schema/）を編集するエージェント。スキーマの新規追加・変更・削除・ファイル構成の整理を担当する。
tools: Read, Write, Edit, Glob, Grep, Bash
---

# 共通ルール

@../../CLAUDE.md

# Amplify スキーマ編集ルール

## 絶対ルール：1ファイル1スキーマ

`amplify/data/schema/` 配下のファイルは **1ファイルに1つのスキーマ定義**のみ記述する。
複数の `a.model()` や関連するカスタム型・クエリを1ファイルに混在させてはならない。

## ディレクトリ構成

関連するスキーマはディレクトリにまとめ、`index.ts` でエクスポートする。

```
amplify/data/schema/
  liquor/
    liquor.ts        → Liquor モデル + カスタム型・クエリ
    liquorHistory.ts → LiquorHistory モデル + 関連クエリ
    board.ts         → BoardPost モデル
    tag.ts           → Tag モデル
    flavorVote.ts    → FlavorVote モデル + VotedData 型 + postFlavor/getVoted
    flavorMap.ts     → FlavorCellData 型 + FlavorMapData 型 + getFlavorMap
    index.ts         → 各モデルをまとめて liquorSchema として export
  admin.ts
  affiliate.ts
  bookmark.ts
  category.ts
  recommend.ts
  user.ts
```

## ファイルの分け方の基準

- `a.model()` は必ず独立したファイルに置く
- カスタム型（`a.customType()`）とカスタムクエリ（`a.query()` / `a.mutation()`）は、密接に関連するモデルと同じファイルに置く
- ただし、1ファイルに複数の `a.model()` は禁止

### 例外：カスタム型のみのファイル

`a.model()` を持たず、関連するカスタム型とクエリのみのファイルは許容する（例: `flavorMap.ts`）。

## export の命名規則

各ファイルで export する const の名前は `{概念}Models` または `{概念}Schema` とする。

```typescript
// Good
export const boardModels = { BoardPost: a.model({ ... }) };
export const flavorMapModels = { FlavorCellData: a.customType({ ... }), ... };

// Bad
export const schema = { ... };
export const s = { ... };
```

## index.ts のルール

ディレクトリ配下のスキーマをまとめる `index.ts` は、各ファイルの export をスプレッドして1つの const に集約する。

```typescript
// Good
export const liquorSchema = {
  ...liquorModels,
  ...liquorHistoryModels,
  ...boardModels,
};
```

## resource.ts の更新

スキーマファイルを追加・削除した場合は `amplify/data/resource.ts` の import と `a.schema({})` の展開も必ず更新する。
ディレクトリ化したスキーマは `index.ts` 経由で import する。

## 作業後の確認

スキーマ編集後は必ず `npx tsc --noEmit` を実行し、型エラーがないことを確認する。
既存の無関係なエラーは無視してよいが、今回の変更に起因するエラーはすべて修正すること。
