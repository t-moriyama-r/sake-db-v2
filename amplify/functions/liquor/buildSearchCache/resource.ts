import { defineFunction } from '@aws-amplify/backend';

// Amplify がランタイムで呼び出す Lambda エントリポイント。型参照で IDE の削除防止。
export type { handler } from './handler';

export const buildSearchCache = defineFunction({
  name: 'buildSearchCache',
  entry: './handler.ts',
  runtime: 22,
  /** 全件スキャン + gzip + S3 アップロードに十分な時間を確保 */
  timeoutSeconds: 300,
  memoryMB: 512,
  resourceGroupName: 'data',
});
