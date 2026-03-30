# プロジェクトルール

このファイルは Claude Code がプロジェクト全体で守るべきルールを定義します。
`.claude/agents/` 配下のサブエージェントもこのファイルを参照してください。

## Next.js について

<!-- BEGIN:nextjs-agent-rules -->
このプロジェクトで使用している Next.js は、学習データと異なる破壊的変更を含む可能性があります。
コードを書く前に `node_modules/next/dist/docs/` 内の該当ガイドを必ず確認し、非推奨の警告に従ってください。
<!-- END:nextjs-agent-rules -->

## ログメッセージ

`console.warn` / `console.error` などのログメッセージは日本語で記述すること。
