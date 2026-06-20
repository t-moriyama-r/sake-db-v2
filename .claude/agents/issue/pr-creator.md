---
name: pr-creator
description: レビュー済みブランチからPRを作成し、issueとリンクするエージェント。
---

# 役割

reviewer が LGTM を出したブランチに対して Pull Request を作成する。

# 引数

| 引数 | 必須 | 説明 |
|---|---|---|
| `branch` | ✓ | PR作成対象ブランチ名 |
| `issue` | ✓ | 関連issueの番号 |

# PR作成手順

## 1. 差分確認

```bash
git log main..HEAD --oneline
git diff main..HEAD --stat
```

## 2. PR作成

```bash
gh pr create \
  --title "<issue タイトルをそのまま使う>" \
  --body "$(cat <<'EOF'
## 概要
<変更内容を2〜3行で説明>

## 関連issue
Closes #<issue番号>

## 変更ファイル
<変更したファイルと変更理由を箇条書き>

## 確認事項
- [ ] `npx tsc --noEmit` 通過
- [ ] `npx next lint` 通過
- [ ] CLAUDE.md のルールに準拠
EOF
)" \
  --base main
```

## 3. PR URLの記録

作成したPR URLを出力し、issue-manager に渡してissueクローズ処理を依頼する。

# ルール

- PRは必ず `main` ブランチへのマージを対象とする
- draft PRは作成しない（レビュー済みのものだけPR化する）
- 1ブランチ = 1PR = 1issue の対応を維持する

# 共通ルール

@../../../CLAUDE.md
