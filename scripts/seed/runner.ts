/**
 * シーダー共通実行エンジン
 *
 * 各スキーマのシーダーファイルは `buildSeeder` にデータとフィールドマッピングを渡し、
 * 返却された `Seeder` インスタンスをエントリーポイント（seed.ts）の配列に追加する。
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

// ================================================================
// 公開型
// ================================================================

export type DataClient = ReturnType<typeof generateClient<Schema>>;

export interface RunOptions {
  /** true のとき実際には書き込まず、投入予定データをログ表示のみ */
  dryRun: boolean;
  /** true のとき既存レコードを全削除してから再投入する */
  refresh: boolean;
}

export interface SeedResult {
  created: number;
  skipped: number;
  failed: number;
}

/** 各スキーマのシーダーが実装するインターフェース */
export interface Seeder {
  modelName: string;
  run(client: DataClient, options: RunOptions): Promise<SeedResult>;
}

// ================================================================
// buildSeeder 設定型
// ================================================================

/**
 * `buildSeeder` に渡す設定。
 * `T`       = 投入データの型
 * `TRecord` = DynamoDB に保存されるレコードの型（id: string を持つ）
 *
 * data は親→子の順に並んでいること。
 * parent はオブジェクト参照で親を示す（同一性で parentId を解決する）。
 */
export interface SeederConfig<T, TRecord extends { id: string }> {
  modelName: string;
  data: Array<{ item: T; parent: T | null }>;

  create: (
    client: DataClient,
    item: T,
    parentId: string | null,
  ) => Promise<{ data: TRecord | null; errors?: { message: string }[] | null }>;

  list: (
    client: DataClient,
    nextToken?: string | null,
  ) => Promise<{
    data: TRecord[];
    nextToken?: string | null | undefined;
    errors?: { message: string }[] | null;
  }>;

  /** 投入予定アイテムの重複チェックキー */
  toKey: (item: T, resolvedParentId: string | null) => string;

  /** 既存レコードの重複チェックキー */
  toExistingKey: (record: TRecord) => string;

  getLabel?: (item: T) => string;

  /** refresh 時に既存レコード 1 件を削除する関数（省略時は refresh 不可） */
  delete?: (
    client: DataClient,
    id: string,
  ) => Promise<{ errors?: { message: string }[] | null }>;
}

// ================================================================
// buildSeeder（ファクトリ）
// ================================================================

export function buildSeeder<T, TRecord extends { id: string }>(
  config: SeederConfig<T, TRecord>,
): Seeder {
  return {
    modelName: config.modelName,

    async run(client: DataClient, options: RunOptions): Promise<SeedResult> {
      const result: SeedResult = { created: 0, skipped: 0, failed: 0 };

      const existing = await fetchAllPages((token) => config.list(client, token));
      const existingMap = new Map<string, string>();
      for (const record of existing) {
        existingMap.set(config.toExistingKey(record), record.id);
      }

      // ── refresh: 既存レコードを全削除 ──────────────────────────
      if (options.refresh && existing.length > 0) {
        if (!config.delete) {
          console.warn(`  ⚠ ${config.modelName} は delete 未定義のため refresh をスキップします`);
        } else if (options.dryRun) {
          console.log(`  (dry) ${existing.length} 件を削除予定`);
        } else {
          console.log(`  🗑 既存 ${existing.length} 件を削除中...`);
          // 子→親の依存を避けるため逆順で削除
          for (const record of [...existing].reverse()) {
            const { errors } = await config.delete!(client, record.id);
            if (errors?.length) {
              console.error(`  ✗ 削除失敗 ${record.id}:`, errors[0].message);
            }
          }
          existingMap.clear();
        }
      }
      // ─────────────────────────────────────────────────────────────

      // オブジェクト参照 → DynamoDB UUID
      const idMap = new Map<T, string>();

      // 既存レコードを idMap に事前登録（子が親の UUID を解決できるよう）
      for (const { item, parent } of config.data) {
        const parentId = parent ? (idMap.get(parent) ?? null) : null;
        const key = config.toKey(item, parentId);
        const existingId = existingMap.get(key);
        if (existingId != null) idMap.set(item, existingId);
      }

      for (const { item, parent } of config.data) {
        const parentId = parent ? (idMap.get(parent) ?? null) : null;
        const key = config.toKey(item, parentId);
        const label = config.getLabel?.(item) ?? key;

        if (existingMap.has(key)) {
          console.log(`  - スキップ  ${label}`);
          result.skipped++;
          continue;
        }

        if (options.dryRun) {
          console.log(`  (dry) 作成予定  ${label}`);
          result.created++;
          continue;
        }

        const { data, errors } = await config.create(client, item, parentId);

        if (errors?.length || !data) {
          console.error(`  ✗ 失敗  ${label}`);
          for (const e of errors ?? []) console.error(`    →`, e.message);
          result.failed++;
          continue;
        }

        idMap.set(item, data.id);
        existingMap.set(config.toExistingKey(data), data.id);
        console.log(`  ✓ 作成  ${label}  → ${data.id}`);
        result.created++;
      }

      return result;
    },
  };
}

// ================================================================
// runAll
// ================================================================

export async function runAll(seeders: Seeder[], options: RunOptions): Promise<void> {
  const client = getClient();

  if (options.dryRun) {
    console.log('[DRY RUN モード: 実際には書き込みません]\n');
  }
  if (options.refresh) {
    console.log('[REFRESH モード: 既存データを全削除して再投入します]\n');
  }

  const totals: SeedResult = { created: 0, skipped: 0, failed: 0 };

  for (const seeder of seeders) {
    console.log(`=== ${seeder.modelName} シード開始 ===`);
    const result = await seeder.run(client, options);
    console.log(
      `${seeder.modelName}: 作成 ${result.created} / スキップ ${result.skipped} / 失敗 ${result.failed}\n`,
    );
    totals.created += result.created;
    totals.skipped += result.skipped;
    totals.failed += result.failed;
  }

  console.log('=== 全シード完了 ===');
  console.log(
    `合計: 作成 ${totals.created} / スキップ ${totals.skipped} / 失敗 ${totals.failed}`,
  );
}

// ================================================================
// 内部ユーティリティ
// ================================================================

let _client: DataClient | undefined;

function getClient(): DataClient {
  if (_client) return _client;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const outputs = require('../../amplify_outputs.json');
  Amplify.configure(outputs);
  _client = generateClient<Schema>({ authMode: 'apiKey' });
  return _client;
}

async function fetchAllPages<T>(
  listFn: (nextToken?: string | null) => Promise<{
    data: T[];
    nextToken?: string | null | undefined;
    errors?: { message: string }[] | null;
  }>,
): Promise<T[]> {
  const all: T[] = [];
  let nextToken: string | null | undefined = undefined;

  do {
    const { data, nextToken: token, errors } = await listFn(nextToken);
    if (errors?.length) {
      console.warn('レコード取得中にエラーが発生しました:', errors);
      break;
    }
    all.push(...data);
    nextToken = token;
  } while (nextToken);

  return all;
}
