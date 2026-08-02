# Windows 固有の罠（Node.js）

Windows でのみ発生する失敗モード集。本プロジェクトの開発環境は Windows のため、Node.js まわりのツール・スクリプトを書く際やWindows でのみ失敗する現象を調査する際に参照すること。

一般的なクロスプラットフォームの原則（文字列連結ではなく `node:path` を使う、npm scripts にシェル固有構文を書かない）は前提とし、ここではその原則でカバーできない罠を扱う。

---

## `fs.watch` を 8.3 短縮パスで開くとプロセスごと落ちる

**症状**: 例外ではなくプロセス全体が死ぬ。

```
Assertion failed: !_wcsnicmp(filename, dir, dirlen), file src\win\fs-event.c, line 72
```

テストランナーはファイル単位で `'test failed'` としか報告せず、アサーションもスタックも出ないため、診断コストが非常に高い。

**原因**: `ReadDirectoryChangesW` はファイル名を**長い**パスで報告するが、8.3 短縮パス（`C:\Users\RUNNER~1\...` のような形式）で開いた watcher は短縮形を保持する。libuv は報告されたファイル名が監視ディレクトリを接頭辞に持つことをアサートしており、両者の綴りが食い違うと `abort()` を呼ぶ。

GitHub Actions の Windows ランナーでは `os.tmpdir()` が短縮パスを返すため、tmpdir 配下に watcher を張ると 1 回のファイルシステムイベントで実行全体が落ちる。

**catch できない理由**: libuv 内部のネイティブアサートなので、`watcher.on("error")`、`try/catch`、`process.on("uncaughtException")` のすべてを素通りする。防御的コーディングでは防げず、`watch()` を呼ぶ前にパスを直すしかない。

**対策**: 先に実パスへ解決する。

```js
function watchablePath(dir) {
  if (process.platform !== 'win32') return dir;
  try {
    return realpathSync.native(dir); // C:\Users\RUNNER~1\… → C:\Users\runneradmin\…
  } catch {
    return dir;
  }
}
```

win32 に限定してガードすること。POSIX では `realpath` がシンボリックリンクも解決してしまい（macOS の `/var` → `/private/var` 等）、意図しない挙動変化を招く。

---

## POSIX 絶対パスは黙ってドライブ相対パスになる

Windows でも `path.isAbsolute("/etc")` は **true** であり、`path.resolve("/etc")` は `<カレントドライブ>:\etc` を返す。この 2 つの事実により、POSIX パスをハードコードしたリストは「絶対パスか？」の検査をすべて通過したうえで、何にもマッチしなくなる。

```js
// Windows ではこのリストは死んでいる — "/etc" に等しくなるものは存在しない
const BLOCKED = ['/etc', '/root', '/var'];
BLOCKED.some((p) => path.resolve(input) === p); // 常に false
```

このように書かれたブロックリストは、保護しているように見えて保護していない。1 つのリストで両プラットフォームをカバーしようとせず、プラットフォームごとに専用の語彙を持たせること。

---

## パス比較は大文字小文字を畳んでから

Windows のファイルシステムは大文字小文字を区別しない: `c:\windows` と `C:\Windows` は同じディレクトリである。素の `===` や `.startsWith()` では、別の綴りが許可リスト／拒否リストを素通りする。

```js
const key = (p) => (process.platform === 'win32' ? p.toLowerCase() : p);
```

「配下にあるか」の判定では `+ path.sep` のガードも維持すること — `key.startsWith(blocked)` だけでは `C:\Windows-backup` まで飲み込んでしまう。

---

## ドライブレターをハードコードしない

システムドライブは常に `C:` とは限らない。`C:\Windows` をハードコードした検査は、別ドライブから起動したマシンでは何も保護しない — レビューでは正しく見えるぶん、明白な失敗より質が悪い。

環境変数から読み、未設定は「存在しない」として扱うこと:

| 環境変数                | 典型的な値               |
| ----------------------- | ------------------------ |
| `SystemRoot` / `windir` | `C:\Windows`             |
| `ProgramFiles`          | `C:\Program Files`       |
| `ProgramFiles(x86)`     | `C:\Program Files (x86)` |
| `ProgramData`           | `C:\ProgramData`         |

---

## Windows の CI ジョブが PR で本当に走っているか確認する

リポジトリによっては、実行時間節約のため Windows を PR ごとのマトリクスから外し、スケジュール実行やデフォルトブランチへの push のみで走らせていることがある。その場合、**PR が緑でも Windows について何も証明していない** — ジョブが走っていないだけである。

緑を信用する前にワークフローの `on:` ブロックを確認し、Windows 固有の変更なら手動でトリガーすること:

```bash
gh workflow run <workflow>.yaml --ref <branch>
```
