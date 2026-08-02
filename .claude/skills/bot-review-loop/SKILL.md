---
description: PR に付いたレビューボット（CodeRabbit 等）のコメントを巡回対応するループ。最新コミットへのボット指摘を読み、1 件ずつ検証して本物だけ修正し、プッシュしてボットの再レビューを待ち、指摘が尽きるまで繰り返す。ユーザーが「comments」「ボットコメント対応」「レビュー対応して」「ループして OK になるまで」と言ったときに使う。マージは絶対にしない — マージは人間が行う。
---

# Bot Review Loop

GitHub 側のレビューボット（GitHub App / Actions 経由）が PR に投稿した指摘に対応し、ボットが再レビューで納得するまでループする。

レビューボットが 1 つも導入されていないリポジトリでは反応対象がないため、このスキルは使えない。

## 入力

PR の URL または番号。番号のみなら `gh repo view --json nameWithOwner` でリポジトリを補完する。引数なしなら現在のブランチの open PR を推測する: `gh pr list --head <branch> --state open --limit 1 --json number`。

## セットアップ（最初に 1 回）

1. `date -u +%Y-%m-%dT%H:%M:%SZ` — イテレーション開始時刻を記録する。
2. `gh pr view <N> --json state,headRefName,baseRefName,mergeable,isDraft,statusCheckRollup,headRefOid` — OPEN かつ draft でないことを確認。`headRefOid` を `LAST_PUSHED_SHA` として記録する。
3. `gh pr checkout <N>` — ローカルに作業コピーを作る。
4. `LAST_KNOWN_BASE = git rev-parse origin/develop` を記録する。
5. CLAUDE.md とコーディングルールを読む — すべての修正はプロジェクトルールに従う。

## ループ（最大 5 イテレーション）

### A — ボットのレビュー投稿を待つ

プッシュ直後にコメントを取得すると前のコミットへの古い指摘を拾ってしまう。CodeRabbit は GitHub App 経由で投稿するため「完了」の正確なシグナルがない — プッシュから 60〜120 秒の猶予を置いてから取得する。

### B — このイテレーションの指摘を取得する

投稿者と時刻（イテレーション開始以降）でフィルタする:

```bash
# トップレベルコメント
gh api "repos/$OWNER_REPO/issues/$N/comments" --paginate \
  --jq "[.[] | select(.user.login | test(\"coderabbit|sourcery|codex\"; \"i\")) \
       | select(.created_at > \"$ITER_START\") \
       | {user: .user.login, created: .created_at, body}]"

# インラインコメント
gh api "repos/$OWNER_REPO/pulls/$N/comments" --paginate \
  --jq "[.[] | select(.user.login | test(\"coderabbit|sourcery|codex\"; \"i\")) \
       | select(.created_at > \"$ITER_START\") \
       | {user: .user.login, created: .created_at, path, line, body}]"

# レビュー本体
gh api "repos/$OWNER_REPO/pulls/$N/reviews" --paginate \
  --jq "[.[] | select(.user.login | test(\"coderabbit|sourcery|codex\"; \"i\")) \
       | select(.submitted_at > \"$ITER_START\") \
       | {user: .user.login, state, submitted_at, body}]"
```

`gh pr view` はインラインスレッドを省略するため、必ず API で 3 種類とも取得すること。

### C — トリアージ

読み飛ばすもの: ボットの walkthrough・シーケンス図・要約セクション、レート制限通知（「このイテレーションはレビューなし」として扱う）、宣伝・CTA セクション。

本物の指摘 1 件ごとに分類する:

- **MUST-FIX** — バグ、セキュリティ、型の穴、データ喪失、リグレッション
- **VALID-NIT** — 小さな品質・可読性の改善で、デメリットがないもの
- **FALSE-POSITIVE** — ボットが diff やプロジェクトの規約を読み違えたもの
- **DEFER** — 本物だがこの PR のスコープ外 — フォローアップ issue として記録する

MUST-FIX と VALID-NIT は即修正する。FALSE-POSITIVE と DEFER には、次のイテレーションで再指摘されないよう、理由を書いた返信コメントを**日本語で** PR に投稿する。

**ボットを盲信しない。** すべての指摘は実際のコードに照らして自分でレビューしてから適用する。ボットは出発点であって上限ではない — ボットが見逃した問題に気づいたらそれも直し、コミットメッセージで正直に区別する（「レビュー中に発見、ボットの指摘外」）。

### D — ローカル検証

コードを変更したら必ず実行する: `npx tsc --noEmit && npm run lint && npm run build`。失敗したままプッシュしない — ボットのレビュースレッドが混乱する。

### E — ベースブランチ同期

```bash
git fetch origin develop
```

`origin/develop` が進んでいたら `git merge origin/develop --no-edit` で取り込む（rebase しない）。コンフリクトが意味的に不明瞭ならユーザーに確認する。マージ後はローカル検証をやり直す。

### F — コミットとプッシュ

- `git add` は意図して触ったファイルのみ個別に指定する。`git add -A` / `git add .` は禁止。
- コミットメッセージ: `fix: ボットレビュー指摘対応 (iter-<k>)` — 本文に採用した指摘をレビュアー別に列挙する。
- `git push`（force は使わない）。新しい HEAD SHA を `LAST_PUSHED_SHA` に更新する。

### G — ループ継続の判定

| シグナル | アクション |
|---|---|
| 実行可能な指摘なし + 自分でも問題を発見していない | ループ終了 → 最終報告 |
| 指摘はないが自分で本物の問題を発見した | 修正してプッシュし、次のイテレーションへ |
| MUST-FIX の指摘が残っている | 次のイテレーションへ |
| ボットが一度も反応しない（設定不備の可能性） | ユーザーに報告する — 沈黙を承認と見なさない |
| イテレーション 5 に到達 | ユーザーに引き継ぐ — 収束しないレビューは人間の領域 |

## 終了（収束後）

**`gh pr merge` は絶対に実行しない。マージは人間が行う（プロジェクトルール）。**

最終報告として以下を伝える: 総イテレーション数、採用した指摘 / 却下した指摘（理由付き）、CI・ローカル検証の状態、マージ可能と判断する根拠。ボットの指摘に反対した箇所があれば明記する。

## 安全ルール（常時）

- ローカル検証をスキップしない。`--no-verify` / `--force` は使わない。
- ボットへの返信・PR コメントはすべて日本語で書く。
- シークレットをコミットしない。`.env` や認証情報ファイルを含めない。
- プロジェクトの CLAUDE.md・コーディングルールが本スキルと矛盾する場合はプロジェクトルールを優先する。
