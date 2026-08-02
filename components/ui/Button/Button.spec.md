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

## ref の受け取り方

React 19 の ref-as-prop パターンを採用しており、`forwardRef` は使用しない。
`ref` は通常の prop として `RefAttributes<HTMLButtonElement>` 経由で受け取る。

```tsx
// ref を渡す呼び出し側
const buttonRef = useRef<HTMLButtonElement>(null);
<Button ref={buttonRef}>ボタン</Button>;
```

## Props

| Prop      | 型                                                | デフォルト  | 説明                                             |
| --------- | ------------------------------------------------- | ----------- | ------------------------------------------------ |
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | 外観バリアント                                   |
| `size`    | `'sm' \| 'md' \| 'lg'`                            | `'md'`      | サイズ                                           |
| `loading` | `boolean`                                         | -           | ローディングスピナーを表示し、ボタンを無効化する |
| `type`    | `'button' \| 'submit' \| 'reset'`                 | `'button'`  | HTML button の type 属性                         |
| `ref`     | `React.Ref<HTMLButtonElement>`                    | -           | DOM 参照（React 19 ref-as-prop）                 |

`Props` は `ButtonHTMLAttributes<HTMLButtonElement>` を継承するため、HTML `<button>` の全属性を受け取れる。

## loading 状態

`loading={true}` のとき、ボタン左にスピナーが表示され、`disabled` と同等の状態になる。
