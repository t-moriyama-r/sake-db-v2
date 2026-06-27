# Button コンポーネント仕様

## type のデフォルト値

`Button` コンポーネントは `type` prop のデフォルト値として `"button"` を持つ。

HTML の `<button>` 要素はブラウザ仕様上、`type` 未指定の場合 `"submit"` として動作する。
これにより、フォーム内に配置した `Button` がフォームを意図せず送信するバグが生じる。
このデフォルト値はその問題を防ぐための意図的な設計である。

フォーム送信ボタンとして使う場合は `type="submit"` を明示する。

```tsx
// フォーム送信以外の用途（デフォルト動作で type="button" になる）
<Button onClick={handleClick}>キャンセル</Button>

// フォーム送信ボタン（type を明示する）
<Button type="submit">送信</Button>
```

## Props

| Prop | 型 | デフォルト | 説明 |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | 外観バリアント |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | サイズ |
| `loading` | `boolean` | - | ローディングスピナーを表示し、ボタンを無効化する |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button の type 属性 |

`Props` は `ButtonHTMLAttributes<HTMLButtonElement>` を継承するため、HTML `<button>` の全属性を受け取れる。

## loading 状態

`loading={true}` のとき、ボタン左にスピナーが表示され、`disabled` と同等の状態になる。
