import { gzipSync } from 'node:zlib';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getDataClient } from '../_shared/data-client';

const s3 = new S3Client({});

/**
 * S3 に保存する検索インデックスの型。
 * - imageBase64 は除外（10万件規模で ~200MB になるため）
 * - rate*Users は件数のみ保持（LiquorCard での評価表示に使用）
 */
export type SearchRecord = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  categoryTrail: { id: string; name: string }[];
  imageUrl: string | null;
  rate5Count: number;
  rate4Count: number;
  rate3Count: number;
  rate2Count: number;
  rate1Count: number;
};

export const CACHE_S3_KEY = 'search-cache/liquors.json.gz';

/**
 * DynamoDB の Liquor テーブルを全件スキャンし、検索インデックスを
 * gzip 圧縮した JSON として S3 に保存する。
 * EventBridge により 1 時間ごとに自動実行される。
 */
export const handler = async (): Promise<void> => {
  const client = await getDataClient();
  const records: SearchRecord[] = [];
  let nextToken: string | undefined;

  do {
    const result = await client.models.Liquor.list({
      limit: 1000,
      nextToken,
    });

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

  const compressed = gzipSync(Buffer.from(JSON.stringify(records), 'utf-8'));

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET_NAME!,
      Key: CACHE_S3_KEY,
      Body: compressed,
      ContentType: 'application/gzip',
    }),
  );

  console.log(
    `Search cache built: ${records.length} records, ${(compressed.length / 1024).toFixed(1)} KB`,
  );
};
