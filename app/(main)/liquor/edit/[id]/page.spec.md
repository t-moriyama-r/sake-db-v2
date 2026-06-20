# 酒編集ページ仕様

## アクセス制御

- 認証: **不要**（未ログインでも閲覧・操作可）
- ページレベル・コンポーネントレベルともに認証ガードなし
- 存在しない ID: `notFound()` → 404

## 未ログインユーザーによる編集（apiKey 認証）

未ログインユーザーがお酒を編集できることは**意図した仕様**である。

### 仕組み

`useLiquorSave.ts` の保存処理でログイン状態を判定し、authMode を切り替える。

```typescript
const authMode = user ? 'userPool' : 'apiKey';
```

- ログイン済み: Cognito UserPool 認証（`userPool`）で Amplify Data に書き込む
- 未ログイン: API キー認証（`apiKey`）で Amplify Data に書き込む

### Amplify スキーマ側の設定

`amplify/data/schema/liquor/liquor.ts` の `Liquor` モデルに以下の認可ルールが設定されている。

```typescript
allow.guest().to(['read', 'create']),        // ゲスト（IAM）: 読み取り・作成
allow.authenticated().to(['read', 'create', 'update']),  // 認証済み: 読み取り・作成・更新
allow.publicApiKey(),                         // API キー: すべての操作
```

`allow.publicApiKey()` により、未ログインクライアントが `apiKey` authMode を指定して更新操作を行うことが許可されている。

編集時は `updateLiquor` と `createLiquorHistory` の両方に同じ `authMode` が渡される。

### 未ログイン時の動作

- `updateUserId` / `updateUserName` はすべて `undefined`（未設定）になる
- 更新者情報なしでレコードが上書きされる
- 編集前の状態は `LiquorHistory` に記録される

## 備考

誰でもお酒を編集できる仕様。認証によるアクセス制限は設けていない。
