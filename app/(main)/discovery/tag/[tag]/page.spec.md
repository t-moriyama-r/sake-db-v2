# タグ検索ページ仕様

## アクセス制御

- 認証: 不要（未ログインでも閲覧可）

## 動作

- URL パラメータ `tag`（URL エンコード済み）を `decodeURIComponent` してタグ文字列を取得する
- `fetchLiquorsByTag(tag)` でそのタグを持つお酒を全件取得して表示する
- 0件の場合は「見つかりませんでした」メッセージを表示する

## データ取得（fetchLiquorsByTag）

1. `Tag.listTagByText` GSI でタグテキストに一致する `Tag` レコードを全件取得する
2. 取得した `Tag.liquorId` を重複排除し、`Liquor.get` を `CHUNK_SIZE`（100）件ずつ並列 BatchGet する
3. 結果を `JSON.parse(JSON.stringify(...))` でシリアライズして返す

### tags フィールドについて

`SerializableLiquorRecord.tags` は `{ id: string; text: string }[]` 型だが、
`fetchLiquorsByTag` が返す各レコードの `tags` フィールドは **空配列 `[]`** になる。

これは Amplify Gen2 のモデルリレーション（lazy loader）をシリアライズの前に解決していないことによる仕様上の制約であり、
バグではない。タグ情報が必要な場面では `fetchLiquor` を個別に呼び出すこと。

同じ制約は以下の関数にも適用される:
- `fetchLiquorsByCategories`（`lib/server/liquors/fetch.ts`）
- `fetchAllLiquorsRandomly`（`lib/server/liquors/fetch.ts`）
- `fetchBookmarksSSR`（`lib/server/bookmarks/fetch.ts`）
