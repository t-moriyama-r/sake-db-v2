import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import amplifyOutputs from '../../../amplify_outputs.json';
import type { Schema } from '../../data/resource';

let clientInstance: ReturnType<typeof generateClient<Schema>> | undefined;

/**
 * Lambda ハンドラから Amplify データクライアントを取得する。
 * IAM 認証でアクセスするため、owner 制限をバイパスして全データを操作できる。
 * インスタンスはコールドスタート後に再利用される。
 *
 * amplify_outputs.json をバンドルに含めることで model_introspection を解決する。
 * backend.ts で appsync:GraphQL IAM 権限を付与済みであること。
 */
export function getDataClient(): ReturnType<typeof generateClient<Schema>> {
  if (clientInstance) return clientInstance;

  Amplify.configure(amplifyOutputs);
  clientInstance = generateClient<Schema>({ authMode: 'iam' });
  return clientInstance;
}
