import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

/**
 * Amplify Gen2 型付きデータクライアント（クライアントサイド用）
 *
 * 使用例:
 *   const { data } = await client.models.Liquor.get({ id });
 *   const { data } = await client.models.Category.list();
 */
export const client = generateClient<Schema>();
