# アーキテクチャ

## 技術スタック

| 役割 | 技術 |
|------|------|
| フレームワーク | Next.js (App Router) |
| UI | React + Tailwind CSS v4 |
| バリデーション | React Hook Form + Zod |
| バックエンド / DB | AWS Amplify Gen2 (DynamoDB) |
| 認証 | AWS Cognito (Amplify Auth) |
| API | Amplify GraphQL (`generateClient<Schema>()`) |

## ディレクトリ構成

```
.
├── app/                         # Next.js App Router ページ
│   ├── layout.tsx               # ルートレイアウト（Header / Footer）
│   ├── page.tsx                 # ホーム（おすすめ一覧）
│   ├── (main)/
│   │   ├── discovery/           # カテゴリ絞り込み / キーワード検索 / タグ検索
│   │   ├── liquor/              # お酒詳細・登録・編集
│   │   ├── category/            # カテゴリ詳細・作成・編集
│   │   ├── mypage/              # マイページ・プロフィール編集
│   │   ├── user/[id]/           # ユーザー公開プロフィール
│   │   ├── login/               # ログイン
│   │   ├── register/            # 新規登録
│   │   ├── password-reset/      # パスワードリセット申請
│   │   └── password-reset-exe/  # パスワードリセット実行
│   ├── admin/                   # 管理画面
│   └── api/                     # API Route（認証・検索）
│
├── amplify/
│   ├── data/
│   │   ├── resource.ts          # GraphQL スキーマ集約
│   │   └── schema/              # スキーマ定義（1ファイル1スキーマ）
│   ├── auth/resource.ts         # Cognito 認証設定
│   ├── functions/               # Lambda 関数
│   ├── storage/resource.ts      # S3 ストレージ設定
│   └── backend.ts               # バックエンド定義
│
├── components/
│   ├── layout/                  # Header / Sidebar
│   ├── ui/                      # Button / Dialog / Toast / StarRating / Tag / Spinner
│   ├── forms/                   # FormField / ImageUpload
│   ├── auth/                    # LoginForm / RegisterForm など
│   ├── liquor/                  # LiquorDetailClient など
│   └── pages/                   # ページ固有コンポーネント
│
├── hooks/                       # useAuth / useToast / useTheme など
├── lib/
│   ├── amplify-client.ts        # generateClient<Schema>() シングルトン
│   ├── repository/              # データ取得ロジック（サーバーサイド）
│   └── server/                  # サーバーサイドユーティリティ
├── schemas/                     # Zod バリデーションスキーマ
├── providers/                   # AmplifyProvider / ThemeProvider
└── docs/                        # プロジェクトドキュメント（本ディレクトリ）
```

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

## 認証

Amplify Auth (Cognito) を `useAuth` フックで操作する。

```typescript
const { user, isLogin, isAdmin, login, logout, register } = useAuth();
```

## 主要画面一覧

| URL | 画面 | 権限 |
|-----|------|------|
| `/` | ホーム（おすすめ一覧） | 全員 |
| `/discovery/category` | カテゴリ一覧 | 全員 |
| `/discovery/category/[id]` | カテゴリ絞り込み | 全員 |
| `/discovery/search?q=...` | キーワード検索 | 全員 |
| `/liquor/[id]` | お酒詳細・レビュー・タグ | 全員 |
| `/liquor/create/[categoryId]` | お酒登録 | 要ログイン |
| `/liquor/edit/[id]` | お酒編集 | 要ログイン or 管理者 |
| `/mypage` | マイページ・ブックマーク | 要ログイン |
| `/mypage/edit` | プロフィール編集 | 要ログイン |
| `/user/[id]` | ユーザー公開プロフィール | 全員 |
| `/login` | ログイン | - |
| `/register` | 新規登録 | - |
| `/password-reset` | パスワードリセット申請 | - |
| `/admin` | 管理画面 | 要管理者 |

## 未実装機能（Lambda 実装待ち）

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

