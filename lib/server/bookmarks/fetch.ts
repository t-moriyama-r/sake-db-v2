/* eslint-disable import/order */
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { getServerAccessToken } from '@/lib/server/auth';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
/* eslint-enable import/order */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const outputs = require('@/amplify_outputs.json');
Amplify.configure(outputs, { ssr: true });

/**
 * サーバーサイドでログインユーザーのブックマーク一覧を取得する。
 * CookieのアクセストークンをAuthorizationヘッダーとして使用する。
 * トークンがない場合は空配列を返す。
 */
export async function fetchBookmarksSSR(): Promise<SerializableLiquorRecord[]> {
  const accessToken = await getServerAccessToken();
  if (!accessToken) return [];

  const client = generateClient<Schema>({ authMode: 'userPool' });

  const { data: bms, errors } = await client.models.BookMark.list({
    authToken: accessToken,
  });

  if (errors?.length || !bms) return [];

  const liquorResults = await Promise.all(
    bms.map((bm) => client.models.Liquor.get({ id: bm.liquorId }, { authMode: 'identityPool' })),
  );

  const liquors = liquorResults.map((r) => r.data).filter(Boolean);
  return JSON.parse(JSON.stringify(liquors)) as SerializableLiquorRecord[];
}
