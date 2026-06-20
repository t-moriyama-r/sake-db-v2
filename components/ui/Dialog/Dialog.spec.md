# Dialog コンポーネント仕様

## 概要

汎用モーダルダイアログ。`ConfirmDialog` はこのコンポーネントをラップした確認用バリアント。

## ARIA 属性

- ダイアログ本体 `div` に `role="dialog"` および `aria-modal="true"` を付与する
- `title` prop が渡された場合、`useId()` で生成した ID を `<h2>` に付与し、ダイアログ本体の `aria-labelledby` に紐づける
- `title` prop が省略された場合、`aria-labelledby` は付与しない
- 閉じるボタンには `aria-label="ダイアログを閉じる"` を付与する

## フォーカス管理

- ダイアログが開いたとき、開く直前のフォーカス要素を記憶し、ダイアログ内の最初のフォーカス可能要素にフォーカスを移す
- ダイアログが閉じたとき、記憶した要素にフォーカスを戻す
- フォーカス可能要素の対象: `a[href]`, `button:not([disabled])`, `textarea:not([disabled])`, `input:not([disabled])`, `select:not([disabled])`, `[tabindex]:not([tabindex="-1"])`

## フォーカストラップ

- ダイアログが開いている間、Tab / Shift+Tab のフォーカス移動をダイアログ内部に閉じ込める
- 最後の要素で Tab を押すと最初の要素に戻る
- 最初の要素で Shift+Tab を押すと最後の要素に移る

## Escape キー

- ダイアログが開いている間、Escape キーで `onClose` を呼び出す

## オーバーレイクリック

- オーバーレイ（背景の半透明レイヤー）をクリックすると `onClose` を呼び出す
- ダイアログ本体のクリックは `onClose` を呼び出さない

## スクロールロック

- ダイアログが開いている間、`document.body` の `overflow` を `hidden` にしてページスクロールを禁止する
- スクロールバーが消えることによるレイアウトシフトを防ぐため `paddingRight` にスクロールバー幅を補填する

## レンダリング

- `createPortal` で `document.body` 直下にマウントする
- `open === false` または SSR 環境（`typeof document === 'undefined'`）では何もレンダリングしない

## ConfirmDialog バリアント

`Dialog` をラップした確認ダイアログ。

| prop | デフォルト |
|---|---|
| `title` | `'確認'` |
| `confirmLabel` | `'実行'` |

- キャンセルボタン: `variant="secondary"` / `loading` 中は disabled
- 実行ボタン: `variant="danger"` / `loading` prop を渡す
- `errorMessage` が渡された場合、赤字で本文下に表示する
