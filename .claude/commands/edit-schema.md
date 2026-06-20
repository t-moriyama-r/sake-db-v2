---
description: Amplify データスキーマの編集（追加・変更・削除・ファイル構成整理）を schema-editor エージェントで実行する
argument-hint: "[編集内容の説明]"
---

以下の Amplify スキーマ編集タスクを実行してください。

**タスク:** $ARGUMENTS

## 守るべきルール

- `amplify/data/schema/` 配下は **1ファイル1スキーマ**
- `a.model()` は必ず独立したファイルに分離する
- 関連するスキーマはディレクトリにまとめ、`index.ts` で集約する
- 編集後は `amplify/data/resource.ts` の import も更新する
- 完了後は `npx tsc --noEmit` で型チェックを行い、今回の変更に起因するエラーをすべて修正する

現在のスキーマ構成（`amplify/data/schema/`）を確認してから作業を開始してください。
