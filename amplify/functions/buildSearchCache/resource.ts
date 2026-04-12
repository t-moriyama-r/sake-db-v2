import { defineFunction } from '@aws-amplify/backend';

export const buildSearchCache = defineFunction({
  name: 'buildSearchCache',
  entry: './handler.ts',
  runtime: 22,
  /** 全件スキャン + gzip + S3 アップロードに十分な時間を確保 */
  timeoutSeconds: 300,
  memoryMB: 512,
});
