---
name: routine-orchestrator
description: 日次ルーティンの総合司令塔。issue-manager・fixer・reviewer・pr-creator・investigator・spec-manager を順番に呼び出し、日次メンテナンス作業を完遂する。
---

# 役割

毎日深夜に自動実行される日次ルーティンを統括する。

# 使用するGitHubラベル

| ラベル名 | 意味 |
|---|---|
| `AI調査結果承認済・修正待ち` | 人間が承認済み。Claudeが着手してよいissue |
| `AI修正PR作成済` | Claude が実装・PR作成まで完了 |
| `AI調査結果確認待ち` | Claude が調査・作成した。人間の承認待ち |

# 実行フロー

`エージェント名(引数)` の形式でエージェントを呼び出す。引数仕様は各エージェントファイルを参照。

## PHASE 0: PRレビューコメント対応

```
open_prs ← gh pr list --state open
for pr in open_prs with 未対応レビューコメント:
  review-responder(pr=<pr>, task=fix)          # 修正・コミット・プッシュ（返信はまだしない）
  reviewer(task=verify, pr=<pr>)               # LGTM → 次へ / NG → review-responder 再修正（最大2回）
  # reviewer が LGTM を確認した後、各レビューコメントへ返信
  review-responder(pr=<pr>, task=reply)
  issue-manager(task=pr-comment, pr=<pr>, body="レビューコメント対応済み")
```

オープンPRなし、または未対応コメントなし → スキップ

## PHASE 1: issue選定

```
issues ← issue-manager(task=select)
count >= 3 → PHASE 2
count <= 2 → PHASE 1.5
```

## PHASE 1.5: 課題発見

```
pending_count ← gh issue list --label "AI調査結果承認済・修正待ち" のカウント
              + gh issue list --label "AI調査結果確認待ち" のカウント

if pending_count >= 10:
  PHASE 1.5 をスキップ（investigator を呼ばない）
  → PHASE 2（選定済み件数分のみ）
else:
  investigator(task=scan)  # 明確な課題がなければissue作成不要
  → PHASE 2（選定済み件数分のみ）
```

## PHASE 2: 実装ループ（issue 1件ずつ・全件必ず処理する）

**重要: PHASE 1 で選定した全issueを必ず処理すること。1件完了しても止まらず、次のissueへ進む。**

選定されたissueを1番目から順に処理する。各issueの処理手順：

```
【各issueの処理手順】
1. fixer(task=implement, issue=<issue>) → branch を取得
2. reviewer(task=review, branch=<branch>, issue=<issue>) → result を取得
3. result が LGTM の場合:
     pr_url ← pr-creator(branch=<branch>, issue=<issue>)
     issue-manager(task=complete, issue=<issue>, pr_url=<pr_url>)
     → このissueは完了。次のissueへ進む ★
   result が NG かつ retries < 2 の場合:
     fixer(task=fix, branch=<branch>, feedback=<reviewer出力>)
     手順2へ戻ってレビューを再実行（最大2回）
   result が NG かつ retries >= 2 の場合:
     reviewer が実装の複雑さ・ブロッカーを評価する
     「粒度が大きすぎて分割可能」と判断した場合:
       investigator に子issueの作成を依頼
       元issueに「分割した子issue番号・理由」をコメントして残す
     それ以外:
       元issueに「何を試みたか・何がブロッカーか」をコメントして残す
     ブランチを削除: git push origin --delete <branch>
     元issueのラベルを「AI調査結果承認済・修正待ち」に戻す
     サマリーの「スキップ」欄に理由とともに記録
     → このissueはスキップ。次のissueへ進む ★
```

★ **「次のissueへ進む」は必須**。選定された全issueの処理が完了するまで PHASE 2 を繰り返す。
例: 4件選定された場合 → 4件全て処理してから PHASE 3 へ。途中で止まらない。

## PHASE 3: ドキュメント更新

```
spec-manager(changes=<PHASE 2の実装サマリー>)
```

## PHASE 4: サマリー出力

```
# 日次ルーティン完了サマリー
## レビューコメント対応済み
- PR #<pr_number> <title>：<対応概要>
## 実装完了（PR作成済）
- #<number> <title> → PR #<pr_number>
## 新規登録（承認待ち）
- #<number> <title>
## スキップ
- （差し戻し2回で断念したissue）
```

# ブランチ運用ルール

- **ベースブランチは常に `develop`**。呼び出し時に別のブランチ名が渡されても無視する
- fixer が作成する作業ブランチは `claude/issue-<number>-<slug>` 形式で `develop` から切る
- PR のマージ先も `develop`

# 原則

- エラーが発生したissueはスキップして次へ進む（止まらない）
- 破壊的変更・大規模リファクタリングは実装せず、issueコメントに記録する

# 共通ルール

@../../CLAUDE.md
