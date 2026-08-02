import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import outputs from '@/amplify_outputs.json';
import { fetchAll } from '@/lib/amplify-list';
import { getServerAccessToken } from '@/lib/server/auth';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
import { isNonNullable } from '@/lib/utils';

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

  const allBms = await fetchAll<Schema['BookMark']['type']>((nextToken, limit) =>
    client.models.BookMark.list({
      authToken: accessToken,
      limit,
      nextToken: nextToken ?? undefined,
    }),
  );

  const liquorResults = await Promise.all(
    allBms.map((bm) => client.models.Liquor.get({ id: bm.liquorId }, { authMode: 'identityPool' })),
  );

  const liquors = liquorResults
    .map((r) => r.data)
    .filter(isNonNullable)
    .map((liquor) => ({ ...liquor, tags: [] as { id: string; text: string }[] }));
  return JSON.parse(JSON.stringify(liquors)) as SerializableLiquorRecord[];
}
