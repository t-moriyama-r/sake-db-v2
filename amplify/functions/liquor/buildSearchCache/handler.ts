import { gzipSync } from 'node:zlib';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getDataClient } from '../../_logic/data-client';
import { listAll } from '../../_logic/pagination';

const s3 = new S3Client({});

/**
 * S3 に保存する検索インデックスの型。
 * name の LIKE 検索に必要な最小フィールドのみ保持。
 * ヒットした ID で別途 batchGet を行いフル情報を取得する。
 */
export type SearchRecord = {
  id: string;
  name: string;
};

export const CACHE_S3_KEY = 'search-cache/liquors.json.gz';

/**
 * DynamoDB の Liquor テーブルを全件スキャンし、id + name のみの
 * 軽量検索インデックスを gzip 圧縮した JSON として S3 に保存する。
 * EventBridge により 1 時間ごとに自動実行される。
 */
export const handler = async (): Promise<void> => {
  const bucket = process.env.STORAGE_BUCKET_NAME;
  if (!bucket) throw new Error('STORAGE_BUCKET_NAME 環境変数が設定されていません');

  const client = getDataClient();

  const records: SearchRecord[] = await listAll((nextToken) =>
    client.models.Liquor.list({
      limit: 1000,
      nextToken,
      selectionSet: ['id', 'name'] as const,
    }),
  );

  const compressed = gzipSync(Buffer.from(JSON.stringify(records), 'utf-8'));

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: CACHE_S3_KEY,
      Body: compressed,
      ContentType: 'application/gzip',
    }),
  );

  console.log(
    `Search index built: ${records.length} records, ${(compressed.length / 1024).toFixed(1)} KB`,
  );
};
