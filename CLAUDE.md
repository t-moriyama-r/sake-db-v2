# プロジェクトルール

このファイルは Claude Code がプロジェクト全体で守るべきルールを定義します。
`.claude/agents/` 配下のサブエージェントもこのファイルを参照してください。

## コンポーネントのディレクトリ構造ルール

`components/` 配下にコンポーネントを作成する際は、必ず以下のルールに従う：

1. コンポーネント名と同名のディレクトリを作成し、その中に同名の `.tsx` ファイルを置く
   - 例: `Button` → `components/ui/Button/Button.tsx`
2. そのコンポーネントの内部からしか呼ばれないサブコンポーネントは、同ディレクトリ内に並列に定義する
   - 例: `BoardPostForm`（`LiquorDetailClient` 内部専用）→ `components/liquor/LiquorDetailClient/BoardPostForm.tsx`
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
href: `/discovery/tag/${encodeURIComponent(tag)}`

// ✅ 正しい
import { routes } from '@/lib/routes';
href: routes.discovery.tag(tag)
```

新しいルートが必要な場合は `lib/routes.ts` に追加してから使う。

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

