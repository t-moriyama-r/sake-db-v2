# コーディングルール

## コンポーネントのディレクトリ構造

`components/` 配下にコンポーネントを作成する際は、必ず以下のルールに従う：

1. コンポーネント名と同名のディレクトリを作成し、その中に同名の `.tsx` ファイルを置く
   ```
   components/ui/Button/Button.tsx  ✅
   components/ui/Button/index.tsx   ❌（index ファイル禁止）
   ```

2. そのコンポーネントの内部からしか呼ばれないサブコンポーネントは、同ディレクトリ内に並列に定義する
   ```
   components/liquor/LiquorDetailClient/LiquorDetailClient.tsx
   components/liquor/LiquorDetailClient/CommentForm.tsx  ← 内部専用
   ```

## インポート・エクスポート

再エクスポート（バレルファイル）は **禁止**。ESLint で強制されている。

```typescript
// ❌ 禁止
export { foo } from './foo';
export * from './bar';

// ✅ 正しい: 使う側が直接インポートする
import { foo } from '@/lib/server/foo/foo';
```

外部からインポートする際はファイル名まで明示する：

```typescript
import { Button } from '@/components/ui/Button/Button';
```

## 型定義の配置

型は、それを最初に使う関数・コンポーネントの直上に定義する。  
ファイル先頭にまとめて列挙しない。

## コンポーネントファイル内の定義順

1. **コンポーネント本体**（最初）
2. ヘルパー関数・ユーティリティ（後）

ヘルパーはホイスティングを利用するため `const` ではなく `function` 宣言を使う。

```tsx
// ✅ 正しい順序
export function MyComponent() {
  return <div>{formatValue(42)}</div>;
}

function formatValue(n: number) {  // ← function 宣言でホイスティング可能
  return `${n}件`;
}
```

## useState のジェネリクス

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

## コンポーネントの props 型名

コンポーネントの props 型名は **`Props`** に統一する。

同一ファイル内に複数コンポーネントが存在する場合：
- メインコンポーネントの props → `Props`
- サブコンポーネントの props → コンポーネント名プレフィックスを外した短い名前（`ContentProps`・`ItemProps` など）
- Union 型を構成するための内部型は意味のある名前を維持する

## amplify/functions 内の定義順

`amplify/functions/` 配下の `handler.ts` では **`export const handler` を最初に書く**。

```typescript
// ✅ 正しい順序
const s3 = new S3Client({});          // モジュール変数（import 直後）

export const handler = async () => {  // メインロジック（先頭）
  return helperFn();
};

async function helperFn() { ... }     // ヘルパー（後方、function 宣言）
```

## Amplify スキーマ編集ルール

`amplify/data/schema/` を編集する際は **`schema-editor` エージェントを使うこと**（`/edit-schema` コマンド経由）。

→ 詳細は [AI 活用ガイド](../.claude/README.md) を参照

- **1ファイル1スキーマ**が絶対ルール（複数の `a.model()` を1ファイルに混在させない）
- 関連するスキーマはディレクトリにまとめ、`index.ts` で集約する
- 編集後は `amplify/data/resource.ts` の import も更新し、`npx tsc --noEmit` で型チェックを行う

## フォームバリデーション

React Hook Form + Zod を使用する。

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { liquorSchema, type LiquorInput } from '@/schemas/liquor';

const { register, handleSubmit, formState: { errors } } = useForm<LiquorInput>({
  resolver: zodResolver(liquorSchema),
});
```

バリデーションスキーマは `schemas/` ディレクトリに配置する。

## ルートパス生成

URL（`href`）は **直書き禁止**。必ず `lib/routes.ts` の `routes` オブジェクトを使う。

```typescript
// ❌ 禁止
href: `/discovery/tag/${encodeURIComponent(tag)}`

// ✅ 正しい
import { routes } from '@/lib/routes';
href: routes.discovery.tag(tag)
```

新しいルートが必要な場合は `lib/routes.ts` に追加してから使う。

## サーバーサイド fetch 関数のシリアライズ

`lib/server/*/fetch.ts` の関数は **必ず `Serializable*` 型を返す**。

Amplify Gen2 のモデルには lazy loader 関数フィールドが含まれるため、Server Component から Client Component へ直接渡すとシリアライズエラーになる。

- fetch 関数の内部で `JSON.parse(JSON.stringify(data)) as Serializable*` を適用してから返す
- `Serializable*` 型は同じファイル内で `Omit<XxxRecord, 'lazyField1' | 'lazyField2'>` として定義する
- page コンポーネントで独自にシリアライズしてはならない

Client Component 内で Amplify クライアントを直接呼び出す場合も、状態に保存する前に `JSON.parse(JSON.stringify(data))` を適用して lazy loader を除去する。

## ログメッセージ

`console.warn` / `console.error` などのログメッセージは **日本語** で記述する。

## Next.js に関する注意

このプロジェクトで使用している Next.js は破壊的変更を含む可能性があります。  
コードを書く前に `node_modules/next/dist/docs/` 内の該当ガイドを確認し、非推奨の警告に従ってください。

## 仕様ファイル（`.spec.md`）

意図した挙動（特に非自明なもの）は `.spec.md` に記録する。

- **ページ固有の仕様**: `page.tsx` と同じディレクトリに `page.spec.md` を置く
- **複数ページにまたがるコンポーネントの仕様**: コンポーネントと同ディレクトリに `ComponentName.spec.md` を置く

バグ調査・issue作成・コードレビューを行う前に、対象ページの `page.spec.md` を必ず確認する（意図した挙動を誤ってissue化することを防ぐため）。

