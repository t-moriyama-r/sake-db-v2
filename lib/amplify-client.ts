import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const outputs = require('@/amplify_outputs.json');
  Amplify.configure(outputs, { ssr: true });
} catch {
  console.warn('amplify_outputs.json が見つかりません。`npx ampx sandbox` を実行して生成してください。');
}

/**
 * Amplify Gen2 型付きデータクライアント（クライアントサイド用）
 *
 * 使用例:
 *   const { data } = await client.models.Liquor.get({ id });
 *   const { data } = await client.models.Category.list();
 */
export const client = generateClient<Schema>();
