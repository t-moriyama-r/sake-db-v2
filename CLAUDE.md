# プロジェクトルール

このファイルは Claude Code がプロジェクト全体で守るべきルールを定義します。
`.claude/agents/` 配下のサブエージェントもこのファイルを参照してください。

@.claude/agents/coding/coding-rules.md

## デバッグ原則

- 修正を試みる前に必ず**根本原因**を特定する。値のハードコード等の場当たり的な回避策は禁止。
- リグレッション調査では git 履歴・diff を確認し、原因のコミットを特定する。
- 自明でないバグ調査（複数の原因が考えられる症状、複数箇所に再発するバグ、リトライ機構、特定ブランチのみの再現）の前に `docs/debugging-methodology.md` を読むこと。
- Windows でのみ失敗する現象は `docs/windows-gotchas.md` を参照する。

## Git 衛生ルール

- `git add .` / `git add <ディレクトリ>` は禁止 — ファイルを個別に指定して add する。
- 追跡外（untracked）ファイルを削除しない。
- `git push --force` は禁止。直前に自分がプッシュした feature ブランチで `git commit --amend` 等のローカル書き換えをした場合のみ `--force-with-lease` を許可する。develop / main への force push はいかなる形でも禁止。
- `git rebase` より merge を優先する（コンフリクト解消はベースブランチを feature ブランチへ merge して行う）。

## ボットレビュー対応

PR にレビューボット（CodeRabbit 等）の指摘が付いたら `bot-review-loop` スキルで対応する。ボットの指摘を盲信せず、必ず実際のコードに照らして検証してから適用すること。マージは人間が行う — `gh pr merge` は実行しない。
