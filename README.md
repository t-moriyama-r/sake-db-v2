# sake-db v2

Vue / Go / GraphQL で構築された [sake-db](./sake-db/) を **Next.js (App Router) + AWS Amplify Gen2** でリプレイスしたプロジェクト。

---

## 技術スタック

| 役割 | 技術 |
|------|------|
| フレームワーク | Next.js (App Router) |
| UI | React + Tailwind CSS v4 |
| バリデーション | React Hook Form + Zod |
| バックエンド / DB | AWS Amplify Gen2 (DynamoDB) |
| 認証 | AWS Cognito (Amplify Auth) |
| API | Amplify GraphQL (`generateClient<Schema>()`) |

---

## ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [日常作業チートシート](./docs/development.md) | よく使うコマンド・シーダー・Sandbox 操作など |
| [セットアップ](./docs/setup.md) | 環境構築・ローカル開発・デプロイ手順 |
| [アーキテクチャ](./docs/architecture.md) | ディレクトリ構成・データ操作パターン・主要画面一覧 |
| [コーディングルール](./docs/coding-rules.md) | コンポーネント設計・インポート規約・型定義ルールなど |
| [AI 活用ガイド](./.claude/README.md) | Claude Code エージェント・コマンドの使い方 |
