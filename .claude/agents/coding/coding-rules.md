## コンポーネントのディレクトリ構造ルール

`components/` 配下にコンポーネントを作成する際は、必ず以下のルールに従う：

1. コンポーネント名と同名のディレクトリを作成し、その中に同名の `.tsx` ファイルを置く
   - 例: `Button` → `components/ui/Button/Button.tsx`
2. そのコンポーネントの内部からしか呼ばれないサブコンポーネントは、同ディレクトリ内に並列に定義する
   - 例: `CommentForm`（`LiquorDetailClient` 内部専用）→ `components/liquor/LiquorDetailClient/CommentForm.tsx`
3. 外部からインポートする際はファイル名まで明示する
   - 例: `import { Button } from '@/components/ui/Button/Button'`

## インポート・エクスポートルール

再エクスポート（バレルファイル）は **禁止**。ESLint で強制されている。

```typescript
// ❌ 禁止
export { foo } from './foo';
export * from './bar';

// ✅ 正しい: 使う側が直接インポートする
import { foo } from '@/lib/server/foo/foo';
```

## 型定義の配置ルール

型は、それを最初に使う関数・コンポーネントの直上に定義する。
ファイル先頭にまとめて列挙しない。

## useState のジェネリクスルール

`useState` には **必ずジェネリクスを明示する**。TypeScript が初期値から推論できる場合でも省略しない。

```typescript
// ❌ 禁止
const [flag, setFlag] = useState(false);
const [name, setName] = useState('');

// ✅ 正しい
const [flag, setFlag] = useState<boolean>(false);
const [name, setName] = useState<string>('');
const [items, setItems] = useState<Item[]>(initialItems);
```

## コンポーネントファイル内の定義順

コンポーネントファイルでは **コンポーネント本体を最初に書く**。ヘルパー関数・ユーティリティはコンポーネントの後に定義する。
コンポーネント内から参照できるよう、ヘルパーは `const` ではなく `function` 宣言を使う（ホイスティングにより前方参照が可能になる）。

## amplify/functions ファイル内の定義順

`amplify/functions/` 配下の `handler.ts` では **`export const handler`（メインロジック）を最初に書く**。  
handler から呼ばれるヘルパー関数はその後に定義する。

- ヘルパーは `const` ではなく `function` 宣言を使う（ホイスティングにより `handler` より後に定義しても前方参照が可能になる）
- モジュールレベルの変数・定数（`const client = ...` など）は import の直後に置く
- 他のファイルから import される型・定数（`export type`, `export const`）は、その性質上 handler より前に置いて構わない

```typescript
// ✅ 正しい順序
const s3 = new S3Client({});          // モジュール変数

export const handler = async () => {  // メインロジック（先頭）
  return helperFn();
};

async function helperFn() { ... }     // ヘルパー（後方）
```

## Amplify スキーマ編集ルール

`amplify/data/schema/` を編集する際は **`schema-editor` サブエージェントを使うこと**（`/edit-schema` コマンド経由）。

- **1ファイル1スキーマ**が絶対ルール。複数の `a.model()` を1ファイルに混在させない
- 関連するスキーマはディレクトリにまとめ、`index.ts` で集約する
- `a.model()` は必ず独立したファイルに分離する
- 編集後は `amplify/data/resource.ts` の import も更新し、`npx tsc --noEmit` で型チェックを行う

## Next.js について

<!-- BEGIN:nextjs-agent-rules -->

このプロジェクトで使用している Next.js は、学習データと異なる破壊的変更を含む可能性があります。
コードを書く前に `node_modules/next/dist/docs/` 内の該当ガイドを必ず確認し、非推奨の警告に従ってください。

<!-- END:nextjs-agent-rules -->

## ルートパス生成ルール

URL（`href`）は **直書き禁止**。必ず `lib/routes.ts` の `routes` オブジェクトを使うこと。

```typescript
// ❌ 禁止
href: `/discovery/tag/${encodeURIComponent(tag)}`;

// ✅ 正しい
import { routes } from '@/lib/routes';
href: routes.discovery.tag(tag);
```

新しいルートが必要な場合は `lib/routes.ts` に追加してから使う。

## Amplify 全件取得ルール

`client.models.XxxModel.list()` を呼ぶ際に `limit` 固定でページネーションを行わずに打ち切ることは禁止。
必ず `lib/amplify-list.ts` の `fetchAll` ユーティリティを使い、全件を取得すること。

サーバー・クライアントのどちらからでも `@/lib/amplify-list` を直接インポートする。
`lib/server/amplify-list.ts` / `lib/client/amplify-list.ts` は存在しない。

```typescript
// ❌ 禁止: limit 固定で打ち切り
const { data } = await client.models.BoardPost.listBoardPostByUserId({ userId }, { limit: 200 });

// ✅ 正しい: fetchAll で全件取得（Amplify 形式）
import { fetchAll } from '@/lib/amplify-list';
const result = await fetchAll(client.models.BoardPost.list);

// ✅ 正しい: fetchAll で全件取得（フィルター付き既存形式）
import { fetchAll } from '@/lib/amplify-list';
const result = await fetchAll((nextToken, limit) =>
  client.models.BoardPost.listBoardPostByUserId(
    { userId },
    { limit, nextToken: nextToken ?? undefined },
  ),
);
```

## サーバーサイド fetch 関数のシリアライズルール

`lib/server/*/fetch.ts` の関数は **必ず `Serializable*` 型を返すこと**。

- Amplify Gen2 のモデルには lazy loader 関数フィールドが含まれるため、Server Component から Client Component へ直接渡すとシリアライズエラーになる
- fetch 関数の内部で `JSON.parse(JSON.stringify(data)) as Serializable*` を適用してから返す
- `Serializable*` 型は同じファイル内で `Omit<XxxRecord, 'lazyField1' | 'lazyField2'>` として定義する
- page コンポーネントで独自にシリアライズしてはならない（fetch 関数が責務を持つ）

```typescript
// ✅ 正しい: fetch 関数内でシリアライズ
export type LiquorRecord = Schema['Liquor']['type'];
export type SerializableLiquorRecord = Omit<LiquorRecord, 'category' | 'boardPosts' | ...>;

export const fetchLiquor = withCache(
  async (id: string): Promise<SerializableLiquorRecord | null> => {
    const { data } = await client.models.Liquor.get({ id });
    return data ? JSON.parse(JSON.stringify(data)) as SerializableLiquorRecord : null;
  },
  ...
);

// ❌ 禁止: page コンポーネントで手動シリアライズ
const serializableLiquor = JSON.parse(JSON.stringify(liquor)) as SerializableLiquorRecord;
```

Client Component 内で Amplify クライアントを直接呼び出してデータを取得する場合も、
状態に保存する前に `JSON.parse(JSON.stringify(data))` を適用して lazy loader を除去すること。

## Amplify 設定値の取得ルール

Cognito User Pool ID などの Amplify 設定値は **ハードコード禁止**。`amplify_outputs.json` から動的に読み込むこと。

```typescript
// ❌ 禁止
const USER_POOL_ID = 'ap-northeast-1_CqSONoI3Y';

// ✅ 正しい
import outputs from '@/amplify_outputs.json';
const USER_POOL_ID: string | undefined = outputs?.auth?.user_pool_id;
```

`undefined` になる可能性があるため、使用前に undefined ガードを行うこと。

## catch ブロックの型安全性ルール

`catch` 節の変数には必ず `: unknown` を明示する。`e.message` などのプロパティへの直接アクセスは禁止。`instanceof Error` で型ガードしてから使うこと。

```typescript
// ❌ 禁止
} catch (e) {
  console.error(e.message);
}

// ✅ 正しい
} catch (e: unknown) {
  console.error('処理に失敗しました:', e instanceof Error ? e.message : String(e));
}
```

## アクセシビリティ（ARIA）ルール

### 装飾目的のアイコン・SVG

スクリーンリーダーに読み上げさせる必要のない装飾目的の SVG / アイコンには `aria-hidden="true"` を付ける。

```tsx
// ✅ 正しい
<svg aria-hidden="true" ...>...</svg>
```

### インタラクティブ要素のラベル

アイコンのみで構成された `button` や `a` など、テキストコンテンツが存在しないインタラクティブ要素には `aria-label` を付ける。

```tsx
// ✅ 正しい
<button aria-label="検索">
  <svg aria-hidden="true">...</svg>
</button>
```

### 開閉状態を持つボタン

ドロップダウンなど開閉状態を持つボタンには `aria-expanded={isOpen}` を付ける。

```tsx
// ✅ 正しい
<button aria-label="アカウントメニューを開く" aria-expanded={menuOpen}>
  ...
</button>
```

### クリック操作可能な要素

`onClick` を持つ要素には必ずインタラクティブ要素（`button` / `a`）を使う。`div` や `li` に `onClick` を直接付けることは禁止。

```tsx
// ❌ 禁止
<li onClick={() => onSelect(item)}>...</li>

// ✅ 正しい
<li>
  <button type="button" onClick={() => onSelect(item)}>...</button>
</li>
```

### 読み取り専用コンポーネントのラベリング

インタラクティブな操作を持たないが視覚的な情報を伝えるコンポーネント（星評価の表示など）は、コンテナに `role="img"` と `aria-label` を付け、個々の装飾要素には `aria-hidden="true"` を付ける。

```tsx
// ✅ 正しい: readonly の StarRating
<div role="img" aria-label={`${value}点`}>
  {stars.map((star) => (
    <span key={star} aria-hidden="true">
      ★
    </span>
  ))}
</div>
```

## ログメッセージ

`console.warn` / `console.error` などのログメッセージは**日本語**で記述する。

## ファイル名

`index.tsx` / `index.ts` などの `index` というファイル名は禁止。ディレクトリに切り出す場合もディレクトリ名と同名のファイルを使うこと。

```
// ❌ 禁止
components/layout/Header/index.tsx

// ✅ 正しい
components/layout/Header/Header.tsx
```

## コンポーネントの props 型名

コンポーネントの props 型名は **`Props`** に統一する。

同一ファイル内に複数コンポーネントが存在する場合、メインコンポーネントの props は `Props`、サブコンポーネントの props は **コンポーネント名と同名の `XxxProps`** を使う（例: `HistoryItem` → `HistoryItemProps`）。Union 型を構成するための内部型は `Props` に統一せず意味のある名前を維持する。

## React 19 ref-as-prop ルール

このプロジェクトは React 19 を使用する。`forwardRef` は **禁止**。ref は通常の prop として直接受け取る。

```typescript
// ❌ 禁止: React 18 以前の forwardRef パターン
import { forwardRef } from 'react';
export const Button = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  return <button ref={ref} {...props} />;
});

// ✅ 正しい: React 19 の ref-as-prop パターン
import { ButtonHTMLAttributes, RefAttributes } from 'react';
type Props = ButtonHTMLAttributes<HTMLButtonElement> & RefAttributes<HTMLButtonElement> & { ... };
export const Button = ({ ref, ...props }: Props) => {
  return <button ref={ref} {...props} />;
};
```

ref を受け取る必要がある場合は `RefAttributes<T>` を Props に intersection して `ref` を props から分解代入する。

## Button コンポーネントの type ルール

`Button` コンポーネント（`components/ui/Button/Button.tsx`）は `type` prop のデフォルト値として `"button"` を持つ。
フォーム送信ボタンとして使う場合のみ `type="submit"` を明示する。

```tsx
// ✅ 正しい: フォーム送信以外はデフォルトのまま
<Button onClick={handleCancel}>キャンセル</Button>

// ✅ 正しい: フォーム送信ボタンは type を明示
<Button type="submit" loading={isSubmitting}>送信</Button>
```

ネイティブ `<button>` 要素を直接使う場合は引き続き `type="button"` を明示すること（ARIAルールの例を参照）。

## 仕様ファイルルール（`.spec.md`）

意図した挙動（特に非自明なもの）は `.spec.md` に記録する。

### 配置ルール

- **ページ固有の仕様**: `page.tsx` と同じディレクトリに `page.spec.md` を置く
  - 例: `app/(main)/liquor/[id]/page.spec.md`
- **複数ページにまたがるコンポーネントの仕様**: コンポーネントと同ディレクトリに `ComponentName.spec.md` を置く
  - 例: `components/ui/Button/Button.spec.md`

### AIへの指示

バグ調査・issue作成・コードレビューを行う前に、対象ページのディレクトリにある **`page.spec.md`** を必ず確認すること。
意図した挙動を誤ってissue化することを防ぐため。`page.spec.md` がなければ `ComponentName.spec.md` も確認すること。

## 非nullアサーション（`!`）の使用ルール

非nullアサーション（`!`）の使用は **原則禁止**。型ガード、optional chaining（`?.`）、明示的な `undefined` / `null` チェックなど安全な代替手段を使うこと。

```typescript
// ❌ 禁止
const name = user!.name;
const first = items!.at(0)!.value;

// ✅ 正しい: 型ガードで絞り込む
if (user) {
  const name = user.name;
}

// ✅ 正しい: optional chaining とデフォルト値
const first = items?.at(0)?.value ?? 'default';

// ✅ 正しい: 明示的な undefined / null チェック
if (items === undefined) {
  throw new Error('items が存在しません');
}
const first = items.at(0)?.value;
```

非nullアサーションの使用がどうしても合理的だと判断される場合は、その意図を **必ずコメントで残すこと**。コメントなしでの `!` 使用は禁止。

```typescript
// ❌ 禁止: コメントなしの非nullアサーション
const element = document.getElementById('root')!;

// ✅ 正しい: 意図をコメントで明示
// index.html に静的に定義されているため必ず存在する
const element = document.getElementById('root')!;
```
