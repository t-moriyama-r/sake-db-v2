# 酒作成ページ仕様

## アクセス制御

- 認証: **不要**（未ログインでも閲覧・操作可）
- ページレベル・コンポーネントレベルともに認証ガードなし

## 未ログインユーザーによる作成（identityPool 認証）

未ログインユーザーがお酒を作成できることは**意図した仕様**である。

### 仕組み

`createLiquor`（`lib/repository/liquor.ts`）は `authMode: 'identityPool'` を固定で使用する。
これは Amplify の identityPool（Cognito Identity Pool）によるゲスト（匿名）認証であり、
未ログインユーザーでも作成操作を行うことができる。

```typescript
// lib/repository/liquor.ts
export async function createLiquor(input: LiquorCreateInput): Promise<string | undefined> {
  const { data: newLiquor } = await client.models.Liquor.create(input, {
    authMode: 'identityPool',
  });
  return newLiquor?.id;
}
```

`useLiquorSave.ts` は `createLiquor` に `authMode` を渡さない。`createLiquor` 内で固定されているため不要。
更新（`updateLiquor` / `createLiquorHistory`）のみログイン状態で authMode を切り替える。

```typescript
// useLiquorSave.ts（更新・履歴作成のみ authMode を切り替える）
const authMode = user ? 'userPool' : 'apiKey';
```

- 新規作成: Cognito Identity Pool 認証（`identityPool`）で書き込む（ログイン有無に関わらず固定）
- 更新・履歴作成: ログイン済みは `userPool`、未ログインは `apiKey`

### Amplify スキーマ側の設定

`amplify/data/schema/liquor/liquor.ts` の `Liquor` モデルに以下の認可ルールが設定されている。

```typescript
allow.guest().to(['read', 'create']),        // ゲスト（IAM）: 読み取り・作成
allow.authenticated().to(['read', 'create', 'update']),  // 認証済み: 読み取り・作成・更新
allow.publicApiKey(),                         // API キー: すべての操作（シードスクリプト用）
```

`allow.guest()` により、未ログインクライアントが `identityPool` authMode を指定して作成操作を行うことが許可されている。

### 未ログイン時の動作

- `createUserId` / `createUserName` / `updateUserId` / `updateUserName` はすべて `undefined`（未設定）になる
- 作成者情報なしでレコードが登録される

## 備考

誰でもお酒を登録できる仕様。認証によるアクセス制限は設けていない。
未ログインユーザーでも作成できる仕様であるため、`createLiquor` の `authMode` は `identityPool` 固定でなければならない。変更するとゲストアクセスが壊れるため、修正しないこと（PR #74 で差し戻し済み）。
