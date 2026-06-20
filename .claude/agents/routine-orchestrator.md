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
  review-responder(pr=<pr>)
  reviewer(task=verify, pr=<pr>)   # 再指摘 → review-responder 再修正（最大2回）
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

## PHASE 2: 実装ループ（issue 1件ずつ）

```
for issue in issues:
  branch ← fixer(task=implement, issue=<issue>)
  result ← reviewer(task=review, branch=<branch>, issue=<issue>)
  if LGTM:
    pr_url ← pr-creator(branch=<branch>, issue=<issue>)
    issue-manager(task=complete, issue=<issue>, pr_url=<pr_url>)
  else if retries < 2:
    fixer(task=fix, branch=<branch>, feedback=<reviewer出力>)
    → retry reviewer
  else:  # 2回リトライしても LGTM 未達
    reviewer が実装の複雑さ・ブロッカーを評価する
    if 「粒度が大きすぎて分割可能」と判断:
      investigator に子issueの作成を依頼
      元issueに「分割した子issue番号・理由」をコメントして残す
    else:
      元issueに「何を試みたか・何がブロッカーか」をコメントして残す
    ブランチを削除: git push origin --delete <branch>
    元issueのラベルを「AI調査結果承認済・修正待ち」に戻す
    サマリーの「スキップ」欄に理由とともに記録
```

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

# 原則

- エラーが発生したissueはスキップして次へ進む（止まらない）
- 破壊的変更・大規模リファクタリングは実装せず、issueコメントに記録する
- **サブエージェントは必ずフォアグラウンド（逐次）で呼び出す。`run_in_background: true` は絶対に使わない。**  
  バックグラウンド実行するとリモートセッションがアイドルタイムアウトで停止し、完了通知が届かなくなる。

# 共通ルール

@../../CLAUDE.md
