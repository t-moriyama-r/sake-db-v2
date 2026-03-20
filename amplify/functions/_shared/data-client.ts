import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend-function/runtime';
import type { Schema } from '../../data/resource';

let clientInstance: ReturnType<typeof generateClient<Schema>> | undefined;

/**
 * Lambda ハンドラから Amplify データクライアントを取得する。
 * IAM 認証でアクセスするため、owner 制限をバイパスして全データを操作できる。
 * インスタンスはコールドスタート後に再利用される。
 */
export async function getDataClient(): Promise<ReturnType<typeof generateClient<Schema>>> {
  if (clientInstance) return clientInstance;
  const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
    process.env as any,
  );
  Amplify.configure(resourceConfig, libraryOptions);
  clientInstance = generateClient<Schema>();
  return clientInstance;
}
