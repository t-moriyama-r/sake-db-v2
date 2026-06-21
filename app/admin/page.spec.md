# Admin Page 仕様

## 概要

管理画面（`/admin`）はカテゴリの管理を行うページ。
**admin グループに所属するユーザーのみ**アクセス・操作が許可される。

---

## アクセス制御

| ユーザー種別 | UI | API（Amplify スキーマ） |
|---|---|---|
| 未ログイン | ホームへ redirect | 読み取りのみ可（ゲスト権限） |
| ログイン済み一般ユーザー | ホームへ redirect | 読み取り・作成・更新のみ可。**削除は不可** |
| admin ユーザー | 管理画面を表示 | 全操作（CRUD）可 |

- UI の redirect は `useAuth().isAdmin`（Cognito グループ `admin` への所属チェック）で判定する
- API レベルの削除制限は `amplify/data/schema/category.ts` の `allow.authenticated().to(['read', 'create', 'update'])` により担保される

---

## 機能一覧

### カテゴリ一覧表示

- ルートカテゴリ（`parentId: null`）のみ一覧表示する
- 各カテゴリに子カテゴリ件数を表示する

### カテゴリ削除

- `readonly: true` のカテゴリは削除ボタンを非表示にする
- 削除ボタン押下 → 確認ダイアログを表示する
- 確認後に削除を実行し、一覧から除外する
- 削除に失敗した場合はダイアログ内にエラーメッセージを表示する

### その他の操作（画面遷移）

- 「カテゴリを作成」ボタン → `/category/create/root` へ遷移
- 「編集」ボタン → `/category/edit/[id]` へ遷移
- 「子を追加」ボタン → `/category/create/[id]` へ遷移
- 「お酒を追加」ボタン → `/liquor/create/[id]` へ遷移
