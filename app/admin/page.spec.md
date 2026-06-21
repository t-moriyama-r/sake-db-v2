# 管理画面仕様

## アクセス制御

- 認証: **必須**（管理者ロールが必要）
- 非管理者・未ログイン時: `routes.home()` へクライアントサイドリダイレクト
- ガード方式: `useAuth()` の `isAdmin` を監視してリダイレクト

## 操作と authMode

カテゴリの削除には `authMode: 'userPool'` を明示する必要がある。
`authMode` を省略すると権限不足でエラーになる（Amplify の defaultAuthorizationMode がゲストアクセス設定の場合）。

## エラーハンドリング

- カテゴリ削除で `errors` レスポンスが返った場合、`deleteError` にメッセージをセットしてダイアログ内に表示する
- `errors` チェックを省略すると削除失敗がサイレントになる（エラーが UI に反映されない）
