# AI 活用ガイド

このプロジェクトでは **Claude Code** を利用した AI 支援開発を採用しています。  
エージェント・コマンドを活用することで、ルールに則った一貫性のある開発が可能になります。

## ルールファイルの構成

| ファイル            | 役割                                                 |
| ------------------- | ---------------------------------------------------- |
| `CLAUDE.md`         | プロジェクト全体のルール定義（全エージェントが参照） |
| `.claude/agents/`   | サブエージェント定義                                 |
| `.claude/commands/` | スラッシュコマンド定義                               |
| `.claude/skills/`   | スキル定義（特定の作業手順のパッケージ）             |

## サブエージェント

### 汎用 (`.claude/agents/`)

| エージェント           | 役割                       |
| ---------------------- | -------------------------- |
| `routine-orchestrator` | 日次ルーティンの総合司令塔 |

### コーディング (`.claude/agents/coding/`)

| エージェント       | 役割                                                     |
| ------------------ | -------------------------------------------------------- |
| `coder`            | コンポーネント実装・関数追加・バグ修正・リファクタリング |
| `reviewer`         | 実装済みコードのレビュー・品質ゲート                     |
| `review-responder` | オープンPRのレビューコメントを読んでコードを修正         |
| `schema-editor`    | Amplify スキーマ（`amplify/data/schema/`）の編集         |

`coder` の主なルール：

- `index.tsx` / `index.ts` ファイル名禁止（ディレクトリ名と同名のファイルを使う）
- props 型名は `Props` に統一
- コンポーネント本体を先に書き、ヘルパーは `function` 宣言で後方に定義

`schema-editor` の主なルール：

- 1ファイル1スキーマ（複数の `a.model()` を混在させない）
- 編集後は `amplify/data/resource.ts` の import を更新
- `npx tsc --noEmit` で型チェックを行い、エラーを修正

### issue管理 (`.claude/agents/issue/`)

| エージェント    | 役割                                              |
| --------------- | ------------------------------------------------- |
| `issue-manager` | GitHub issueの選定・完了処理・ラベル管理          |
| `fixer`         | issueの実装・差し戻し修正・ブランチ管理・コミット |
| `investigator`  | コードベース調査・バグ発見・新規issue作成         |
| `pr-creator`    | PR作成・issueリンク                               |
| `spec-manager`  | 仕様ドキュメント・CLAUDE.md の更新管理            |

## スラッシュコマンド

### `/edit-schema [編集内容の説明]`

Amplify データスキーマの編集（追加・変更・削除・ファイル構成整理）を `schema-editor` エージェントで実行する。

**使用例：**

```
/edit-schema Liquor モデルに description フィールドを追加する
/edit-schema FlavorVote スキーマを独立ファイルに分離する
```

## スキル (`.claude/skills/`)

[isamu/claude](https://github.com/isamu/claude) の知見を本プロジェクト向けに翻案したもの。`/スキル名` で明示的に呼び出せるほか、該当する依頼をすると自動的に適用される。

| スキル             | 役割                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `issue-draft`      | 漠然としたアイデアを調査・設計選択肢付きの GitHub issue に仕上げて起票する（実装はしない） |
| `dep-upgrade-safe` | npm パッケージを破壊的変更の調査・コード移行込みで安全にアップグレードする                 |
| `ci-fix`           | 失敗した GitHub Actions を根本原因分析して修正し、緑になるまで見届ける                     |
| `bot-review-loop`  | PR のレビューボット指摘を検証・修正・返信するループ。マージは人間が行う                    |
| `test-writing`     | Vitest のユニットテストを規約（`docs/testing.md`）に従って作成する                         |

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
