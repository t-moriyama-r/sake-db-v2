/**
 * DynamoDB 初期データ投入スクリプト エントリーポイント
 *
 * 実行方法:
 *   AWS_PROFILE=sake-db npx tsx scripts/seed.ts
 *
 * オプション:
 *   --dry-run  実際には書き込まず、投入予定データをログ表示のみ
 *   --refresh  既存データを全削除してから再投入する（完全初期化）
 *
 * 前提条件:
 *   - npx ampx sandbox が起動済みで amplify_outputs.json が存在すること
 *   - AWS_PROFILE に DynamoDB/AppSync 書き込み権限のある IAM 認証情報が設定されていること
 *
 * シーダーの追加方法:
 *   1. scripts/seed/<モデル名>.ts を作成し、Seeder インターフェースを実装する
 *   2. 下記の `seeders` 配列に追加する
 */

import { categoriesSeeder } from './seed/categories';
import { liquorsSeeder } from './seed/liquors';
import { runAll } from './seed/runner';

const seeders = [
  categoriesSeeder,
  liquorsSeeder,
  // 新しいシーダーはここに追加する
];

runAll(seeders, {
  dryRun: process.argv.includes('--dry-run'),
  refresh: process.argv.includes('--refresh'),
}).catch((err: unknown) => {
  console.error('シードスクリプトでエラーが発生しました:', err);
  process.exit(1);
});
