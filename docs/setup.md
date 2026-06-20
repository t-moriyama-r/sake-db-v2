# セットアップ

## 前提条件

- Node.js 20+
- AWS アカウント + CLI 設定済み
- Amplify CLI: `npm install -g @aws-amplify/backend-cli`

## AWS プロファイルの設定

`npm run sandbox` や `npm run seed` は `sake-db` という名前の AWS プロファイルを使用します。
事前に以下のコマンドで設定してください。

```bash
aws configure --profile sake-db
```

対話形式で Access Key ID・Secret Access Key・リージョン（例: `ap-northeast-1`）・出力形式（例: `json`）を入力します。

## インストール

```bash
npm install
```

## ローカル開発

1. **Amplify Sandbox を起動**（別ターミナル）

   ```bash
   npm run sandbox
   ```

   `amplify_outputs.json` が生成されるまで待つ。

2. **開発サーバーを起動**

   ```bash
   npm run dev
   ```

   → http://localhost:3000

## 本番デプロイ

AWS Amplify Hosting へデプロイする場合:

```bash
npx ampx pipeline-deploy --branch main --app-id <Amplify App ID>
```

