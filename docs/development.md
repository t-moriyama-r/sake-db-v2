# 日常作業チートシート

開発中によく使うコマンドや手順をまとめたリファレンスページ。  
各項目の詳細は該当ドキュメントを参照してください。

---

## ローカル開発の起動

```bash
# Sandbox と開発サーバーを同時起動（推奨）
npm run start:local

# 個別に起動する場合
npm run sandbox   # 別ターミナルで Amplify Sandbox を起動
npm run dev       # Next.js 開発サーバー → https://localhost:3000
```

> 初回またはスキーマ変更後は Sandbox が `amplify_outputs.json` を再生成するまで待つこと。  
> 詳細: [セットアップ](./setup.md)

---

## シーダー（初期データ投入）

```bash
# 実際には書き込まず投入予定データを確認する
npm run seed:dry-run

# 実行
npm run seed

# --refresh オプション付き（既存データを全削除してから再投入）
cross-env AWS_PROFILE=sake-db npx tsx scripts/seed.ts --refresh
```

**前提条件：** Sandbox が起動済みで `amplify_outputs.json` が存在すること。

シーダーを追加する場合は `scripts/seed/<モデル名>.ts` を作成し、`scripts/seed.ts` の `seeders` 配列に追加する。

---

## 検索キャッシュのビルド

```bash
npm run invoke:search-cache
```

検索キャッシュ用 Lambda を手動で呼び出す。検索結果がおかしい場合やデータ投入後に実行する。

---

## Sandbox の操作

```bash
npm run sandbox         # 起動
npm run sandbox:delete  # 削除
npm run sandbox:reset   # 削除して再起動（スキーマ変更で壊れた場合など）
```

---

## 型チェック・Lint・テスト

```bash
npx tsc --noEmit     # 型チェック
npm run lint         # ESLint
npm run test         # Vitest（一括実行）
npm run test:watch   # Vitest（監視モード）
```

スキーマ編集後は必ず型チェックを実行すること。  
詳細: [コーディングルール](./coding-rules.md) / [テスト](./testing.md)

---

## スキーマの編集

スキーマ編集は直接ファイルを触らず、Claude Code の `/edit-schema` コマンドを使うこと。

```
/edit-schema [編集内容の説明]
```

詳細: [AI 活用ガイド](../.claude/README.md)

---

## デプロイ

```bash
npx ampx pipeline-deploy --branch main --app-id <Amplify App ID>
```

詳細: [セットアップ](./setup.md)

