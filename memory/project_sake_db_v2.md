---
name: sake-db-v2 プロジェクト概要
description: Vue/Go/GraphQL の sake-db を Next.js + Amplify Gen2 でリプレイスするプロジェクトの詳細
type: project
---

Vue/Go/GraphQL で構築された sake-db を Next.js (App Router) + AWS Amplify Gen2 でリプレイス。

**Why:** フルスタックをモダンなサーバーレス構成（DynamoDB + Cognito + Lambda）に移行するため。

**How to apply:** フロントエンドのコードベースは実装済み。Lambda 関数（getFlavorMap, searchLiquors 等）は未実装で amplify/functions/ 配下にスケルトンがある。

実装済みファイル構成:

- app/ : Next.js App Router 全ページ（18ページ）
- components/ : UI コンポーネント群
- hooks/ : useAuth, useToast
- schemas/ : Zod バリデーションスキーマ（auth, liquor, category, board）
- lib/amplify-client.ts : generateClient<Schema>() シングルトン

データモデル: Category, Liquor, BoardPost, Tag, BookMark, FlavorVote, LiquorHistory, CategoryHistory

認証: AWS Cognito（useAuth フックで操作）
バリデーション: React Hook Form + Zod

未実装（Lambda 必要）:

- getFlavorMap, getVoted（フレーバーマップ集計）
- randomRecommendList（現在クライアントシャッフルで代替）
- searchLiquors（現在 DynamoDB contains フィルタで代替）
- getUserByIdDetail
- Amazon アフィリエイト連携
