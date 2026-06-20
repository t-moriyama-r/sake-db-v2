# AI 活用ガイド

このプロジェクトでは **Claude Code** を利用した AI 支援開発を採用しています。  
エージェント・コマンドを活用することで、ルールに則った一貫性のある開発が可能になります。

## ルールファイルの構成

| ファイル | 役割 |
|----------|------|
| `CLAUDE.md` | プロジェクト全体のルール定義（全エージェントが参照） |
| `.claude/agents/` | サブエージェント定義 |
| `.claude/commands/` | スラッシュコマンド定義 |

## サブエージェント

### 汎用 (`.claude/agents/`)

| エージェント | 役割 |
|---|---|
| `routine-orchestrator` | 日次ルーティンの総合司令塔 |

### コーディング (`.claude/agents/coding/`)

| エージェント | 役割 |
|---|---|
| `coder` | コンポーネント実装・関数追加・バグ修正・リファクタリング |
| `fixer` | issueの実装・差し戻し修正・ブランチ管理・コミット |
| `reviewer` | 実装済みコードのレビュー・品質ゲート |
| `review-responder` | オープンPRのレビューコメントを読んでコードを修正 |
| `schema-editor` | Amplify スキーマ（`amplify/data/schema/`）の編集 |

`coder` の主なルール：
- `index.tsx` / `index.ts` ファイル名禁止（ディレクトリ名と同名のファイルを使う）
- props 型名は `Props` に統一
- コンポーネント本体を先に書き、ヘルパーは `function` 宣言で後方に定義

`schema-editor` の主なルール：
- 1ファイル1スキーマ（複数の `a.model()` を混在させない）
- 編集後は `amplify/data/resource.ts` の import を更新
- `npx tsc --noEmit` で型チェックを行い、エラーを修正

### issue管理 (`.claude/agents/issue/`)

| エージェント | 役割 |
|---|---|
| `issue-manager` | GitHub issueの選定・完了処理・ラベル管理 |
| `investigator` | コードベース調査・バグ発見・新規issue作成 |
| `pr-creator` | PR作成・issueリンク |
| `spec-manager` | 仕様ドキュメント・CLAUDE.md の更新管理 |

## スラッシュコマンド

### `/edit-schema [編集内容の説明]`

Amplify データスキーマの編集（追加・変更・削除・ファイル構成整理）を `schema-editor` エージェントで実行する。

**使用例：**
```
/edit-schema Liquor モデルに description フィールドを追加する
/edit-schema FlavorVote スキーマを独立ファイルに分離する
```

## オーケストレーション

複雑なタスクでは、Claude Code がエージェントを自動的にオーケストレーションします。  
例えば「新機能の追加」タスクでは：

1. `general` がタスクを分析・計画
2. `schema-editor` がスキーマ変更を担当
3. `coder` がコンポーネント・ロジックの実装を担当

各エージェントは独立して動作しますが、いずれも `CLAUDE.md` のプロジェクトルールに従います。

## 日次ルーティン

`routine-orchestrator` が起点となり、`coding/` と `issue/` 配下のエージェントを順番に呼び出す。
詳細なフローは `.claude/agents/routine-orchestrator.md` を参照。

### Instructions（claude.ai/code/routines に設定）

```
routine-orchestrator エージェントを呼び出し、日次メンテナンスを実行してください。
```
