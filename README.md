# sake-db v2

Vue / Go / GraphQL で構築された [sake-db](./sake-db/) を **Next.js (App Router) + AWS Amplify Gen2** でリプレイスしたプロジェクト。

---

## 技術スタック

| 役割 | 技術 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| バリデーション | React Hook Form + Zod |
| バックエンド / DB | AWS Amplify Gen2 (DynamoDB) |
| 認証 | AWS Cognito (Amplify Auth) |
| API | Amplify GraphQL (`generateClient<Schema>()`) |

---

## ディレクトリ構成

```
.
├── app/                         # Next.js App Router ページ
│   ├── layout.tsx               # ルートレイアウト（Header / Footer）
│   ├── page.tsx                 # ホーム（おすすめ一覧）
│   ├── auth/
│   │   ├── login/               # ログイン
│   │   ├── register/            # 新規登録
│   │   ├── password-reset/      # パスワードリセット申請
│   │   └── password-reset-exe/  # パスワードリセット実行
│   ├── discovery/
│   │   ├── category/[[...id]]/  # カテゴリ絞り込み
│   │   ├── search/              # キーワード検索
│   │   └── tag/[tag]/           # タグ検索
│   ├── liquor/
│   │   ├── [id]/                # お酒詳細
│   │   ├── create/[categoryId]/ # お酒登録
│   │   └── edit/[id]/           # お酒編集
│   ├── category/
│   │   ├── [id]/                # カテゴリ詳細
│   │   ├── create/[parentId]/   # カテゴリ作成
│   │   └── edit/[[...id]]/      # カテゴリ編集
│   ├── mypage/                  # マイページ（ブックマーク一覧）
│   │   └── edit/                # プロフィール編集
│   ├── user/[id]/               # ユーザー公開プロフィール
│   └── admin/                   # 管理画面
│
├── amplify/
│   ├── data/resource.ts         # GraphQL スキーマ（DynamoDB モデル定義）
│   ├── auth/resource.ts         # Cognito 認証設定
│   └── backend.ts               # バックエンド定義
│
├── components/
│   ├── AmplifyProvider.tsx      # Amplify 初期化（Client Component）
│   ├── layout/                  # Header / Footer / Sidebar
│   ├── ui/                      # 汎用 UI（Button / Dialog / Toast / StarRating / Tag / Spinner）
│   ├── forms/                   # 汎用フォームパーツ（FormField / ImageUpload）
│   ├── cards/                   # LiquorCard
│   ├── auth/                    # LoginForm / RegisterForm
│   ├── liquor/                  # LiquorForm / BoardPostForm
│   └── category/                # CategoryForm
│
├── hooks/
│   ├── useAuth.ts               # 認証フック（Cognito 操作）
│   └── useToast.ts              # トースト通知フック
│
├── lib/
│   └── amplify-client.ts        # generateClient<Schema>() シングルトン
│
└── schemas/                     # Zod バリデーションスキーマ
    ├── auth.ts                  # 認証・ユーザー編集
    ├── liquor.ts                # お酒登録・編集
    ├── category.ts              # カテゴリ登録・編集
    └── board.ts                 # 掲示板投稿・タグ
```

---

## セットアップ

### 前提条件

- Node.js 20+
- AWS アカウント + CLI 設定済み
- Amplify CLI: `npm install -g @aws-amplify/backend-cli`

### インストール

```bash
npm install
```

### ローカル開発

1. **Amplify Sandbox を起動**（別ターミナル）

   ```bash
   npx ampx sandbox
   ```

   `amplify_outputs.json` が生成されるまで待つ。

2. **開発サーバーを起動**

   ```bash
   npm run dev
   ```

   → http://localhost:3000

### 本番デプロイ

AWS Amplify Hosting へデプロイする場合:

```bash
npx ampx pipeline-deploy --branch main --app-id <Amplify App ID>
```

---

## Amplify Gen2 データ操作パターン

本プロジェクトでは `generateClient<Schema>()` による型付きクライアントを使用する。

```typescript
import { client } from '@/lib/amplify-client';

// 一覧取得
const { data } = await client.models.Liquor.list();

// 単件取得
const { data } = await client.models.Liquor.get({ id });

// 作成
await client.models.Liquor.create({ name: '八海山', ... });

// 更新
await client.models.Liquor.update({ id, name: '新名称' });

// 削除
await client.models.Liquor.delete({ id });

// フィルタ
const { data } = await client.models.Liquor.list({
  filter: { categoryId: { eq: 'xxx' } },
});
```

---

## フォームバリデーション

React Hook Form + Zod を組み合わせて使用。

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { liquorSchema, type LiquorInput } from '@/schemas/liquor';

const { register, handleSubmit, formState: { errors } } = useForm<LiquorInput>({
  resolver: zodResolver(liquorSchema),
});
```

---

## 認証

Amplify Auth (Cognito) を `useAuth` フックで操作する。

```typescript
const { user, isLogin, isAdmin, login, logout, register } = useAuth();
```

---

## 未実装（Lambda が必要な機能）

`amplify/data/resource.ts` のコメントに記載の通り、以下は Lambda 関数実装後に追加する:

| 機能 | 概要 |
|------|------|
| `getFlavorMap(liquorId)` | FlavorVote を集計してフレーバーマップを返す |
| `getVoted(liquorId)` | 自分のフレーバー投票を返す |
| `getRecommendLiquorList` | ブックマーク考慮のおすすめリスト |
| `randomRecommendList(limit)` | ランダムおすすめ（現在はクライアント側シャッフルで代替） |
| `searchLiquors(keyword, limit)` | 全文検索（現在は DynamoDB contains フィルタで代替） |
| `getUserByIdDetail(id)` | ユーザー詳細 + 評価履歴 |
| `checkAdmin` | 管理者確認 |
| Amazon アフィリエイト連携 | 商品情報・価格取得 |

---

## 主要画面一覧

| URL | 画面 |
|-----|------|
| `/` | ホーム（おすすめ一覧） |
| `/discovery/category` | カテゴリ一覧 |
| `/discovery/category/[id]` | カテゴリ絞り込み |
| `/discovery/search?q=...` | キーワード検索 |
| `/discovery/tag/[tag]` | タグ検索 |
| `/liquor/[id]` | お酒詳細・レビュー・タグ |
| `/liquor/create/[categoryId]` | お酒登録（要ログイン） |
| `/liquor/edit/[id]` | お酒編集（要ログインまたは管理者） |
| `/category/[id]` | カテゴリ詳細 |
| `/category/create/[parentId]` | カテゴリ作成（要管理者） |
| `/category/edit/[id]` | カテゴリ編集（要管理者） |
| `/auth/login` | ログイン |
| `/auth/register` | 新規登録 |
| `/auth/password-reset` | パスワードリセット申請 |
| `/auth/password-reset-exe` | パスワードリセット実行 |
| `/mypage` | マイページ・ブックマーク（要ログイン） |
| `/mypage/edit` | プロフィール編集（要ログイン） |
| `/user/[id]` | ユーザー公開プロフィール |
| `/admin` | 管理画面（要管理者） |
