import { gunzipSync } from 'node:zlib';
import { unstable_cache } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import type { Schema } from '@/amplify/data/resource';
import { CACHE_S3_KEY, type SearchRecord } from '@/amplify/functions/liquor/buildSearchCache/handler';
import { getGuestClient } from '@/lib/server/client';

type LiquorRecord = Schema['Liquor']['type'];

const s3 = new S3Client({});

const CACHE_TTL = process.env.CACHE_ENABLED === 'true' ? 3600 : 60;

const getSearchIndex = unstable_cache(
  loadSearchIndex,
  ['search-index'],
  { revalidate: CACHE_TTL },
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword') ?? '';
  const limit = parseInt(searchParams.get('limit') ?? '20', 10);

  if (!keyword.trim()) {
    return NextResponse.json([]);
  }

  try {
    const index = await getSearchIndex();
    const keywords = normalize(keyword).trim().split(/\s+/).filter(Boolean);

    const matchedIds = index
      .filter((r: SearchRecord) => {
        const name = normalize(r.name);
        return keywords.every((kw) => name.includes(kw));
      })
      .slice(0, limit)
      .map((r: SearchRecord) => r.id);

    if (matchedIds.length === 0) {
      return NextResponse.json([]);
    }

    const client = getGuestClient();
    const results = await Promise.all(matchedIds.map((id: string) => client.models.Liquor.get({ id })));
    const liquors = results
      .map((r: { data: LiquorRecord | null }) => r.data)
      .filter((d: LiquorRecord | null): d is LiquorRecord => d !== null)
      .map((r: LiquorRecord) => ({
        ...(JSON.parse(JSON.stringify(r)) as typeof r),
        imageBase64: null,
        youtube: null,
        tags: [],
      }));

    return NextResponse.json(liquors);
  } catch (err: unknown) {
    console.error('[search] エラー:', err);
    return NextResponse.json({ error: '検索中にエラーが発生しました' }, { status: 500 });
  }
}

/**
 * 検索インデックス（id + name のみ）を取得する。
 *
 * - CACHE_ENABLED 未設定（開発環境）: DynamoDB スキャン
 * - CACHE_ENABLED=true（本番）: S3 キャッシュ → DynamoDB スキャンの順で参照
 *
 * 注意: 本番で S3 を使用する場合は STORAGE_BUCKET_NAME 環境変数と
 * Next.js サーバーの IAM ロールへの S3 読み取り権限が必要。
 */
async function loadSearchIndex(): Promise<SearchRecord[]> {
  if (process.env.CACHE_ENABLED === 'true') {
    try {
      return await loadFromS3();
    } catch {
      console.warn('S3 の検索キャッシュが見つかりません。DynamoDB スキャンにフォールバックします');
    }
  }
  return await scanDynamoDB();
}

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

async function scanDynamoDB(): Promise<SearchRecord[]> {
  const client = getGuestClient();
  const records: SearchRecord[] = [];
  let nextToken: string | undefined;

  do {
    const result = await client.models.Liquor.list({
      limit: 1000,
      nextToken,
      selectionSet: ['id', 'name'] as const,
    });

    for (const r of result.data) {
      records.push({ id: r.id, name: r.name });
    }

    nextToken = result.nextToken ?? undefined;
  } while (nextToken);

  return records;
}

function normalize(str: string): string {
  return toHiragana(normalizeFullWidth(str.toLowerCase()));
}

function toHiragana(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  );
}

function normalizeFullWidth(str: string): string {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
  );
}
