import { gunzipSync } from 'node:zlib';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import type { Schema } from '../../data/resource';
import { getDataClient } from '../_shared/data-client';
import { CACHE_S3_KEY, type SearchRecord } from '../buildSearchCache/handler';

const s3 = new S3Client({});

/** インメモリキャッシュの有効期限（1時間）*/
const CACHE_TTL = 60 * 60 * 1000;

/** Lambda インスタンスが生きている間メモリに保持する */
let memoryCache: { records: SearchRecord[]; loadedAt: number } | null = null;

/** S3 の gzip 圧縮 JSON を読み込んでデシリアライズする */
async function loadFromS3(): Promise<SearchRecord[]> {
  const res = await s3.send(
    new GetObjectCommand({
      Bucket: process.env.STORAGE_BUCKET_NAME!,
      Key: CACHE_S3_KEY,
    }),
  );

  const chunks: Uint8Array[] = [];
  for await (const chunk of res.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  return JSON.parse(
    gunzipSync(Buffer.concat(chunks)).toString('utf-8'),
  ) as SearchRecord[];
}

/** DynamoDB を直接スキャンする（開発環境用フォールバック） */
async function scanDynamoDB(): Promise<SearchRecord[]> {
  const client = await getDataClient();
  const records: SearchRecord[] = [];
  let nextToken: string | undefined;

  do {
    const result = await client.models.Liquor.list({ limit: 1000, nextToken });

    for (const r of result.data) {
      records.push({
        id: r.id,
        name: r.name,
        description: r.description ?? '',
        categoryId: r.categoryId,
        categoryName: r.categoryName,
        categoryTrail: (r.categoryTrail ?? []).filter((t): t is { id: string; name: string } => t !== null).map(({ id, name }) => ({ id, name })),
        imageUrl: r.imageUrl ?? null,
        rate5Count: r.rate5Users?.length ?? 0,
        rate4Count: r.rate4Users?.length ?? 0,
        rate3Count: r.rate3Users?.length ?? 0,
        rate2Count: r.rate2Users?.length ?? 0,
        rate1Count: r.rate1Users?.length ?? 0,
      });
    }

    nextToken = result.nextToken ?? undefined;
  } while (nextToken);

  return records;
}

/**
 * 検索インデックスを取得する。
 *
 * - ENABLE_SEARCH_CACHE 未設定（開発環境）: 毎回 DynamoDB から直接スキャン → データ即時反映
 * - ENABLE_SEARCH_CACHE=true（本番）: Lambda メモリ → S3 の順でキャッシュを参照
 */
async function getSearchIndex(): Promise<SearchRecord[]> {
  if (!process.env.ENABLE_SEARCH_CACHE) {
    return scanDynamoDB();
  }

  if (memoryCache && Date.now() - memoryCache.loadedAt < CACHE_TTL) {
    return memoryCache.records;
  }

  try {
    const records = await loadFromS3();
    memoryCache = { records, loadedAt: Date.now() };
    return records;
  } catch {
    // キャッシュファイル未存在（初回ビルド前など）は直接スキャンへフォールバック
    console.warn('Search cache not found in S3, falling back to direct DynamoDB scan');
    return scanDynamoDB();
  }
}

export const handler: Schema['searchLiquors']['functionHandler'] = async (event) => {
  const { keyword, limit = 20 } = event.arguments;

  const records = await getSearchIndex();
  const lower = keyword.toLowerCase();

  const matched = records
    .filter(
      (r) =>
        r.name.toLowerCase().includes(lower) ||
        r.description.toLowerCase().includes(lower),
    )
    .slice(0, limit ?? 20)
    .map((r) => ({
      ...r,
      // LiquorCard は rate*Users.length で評価を計算するため、正しい長さの配列に変換する
      // 実際のユーザー ID は検索結果表示には不要なため空文字で埋める
      rate5Users: Array<string>(r.rate5Count).fill(''),
      rate4Users: Array<string>(r.rate4Count).fill(''),
      rate3Users: Array<string>(r.rate3Count).fill(''),
      rate2Users: Array<string>(r.rate2Count).fill(''),
      rate1Users: Array<string>(r.rate1Count).fill(''),
      // imageBase64 はキャッシュ対象外（サイズが大きすぎるため）、imageUrl で代替
      imageBase64: null,
      youtube: null,
    }));

  return JSON.stringify(matched);
};
