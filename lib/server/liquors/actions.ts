'use server';

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { fetchAll } from '@/lib/amplify-list';
import { getServerAccessToken } from '@/lib/server/auth';
import { revalidateLiquorsCache } from './revalidate';
import { fetchLiquor } from './fetch';

/** お酒の categoryId をサーバーサイドで取得する Server Action。 */
export async function getLiquorCategoryId(liquorId: string): Promise<string | null> {
  const liquor = await fetchLiquor(liquorId);
  return liquor?.categoryId ?? null;
}

/**
 * お酒と関連レコードをすべて削除する Server Action。
 * 管理者権限が必要。成功時はキャッシュを無効化する。
 */
export async function deleteLiquorWithRelated(liquorId: string): Promise<{ error?: string }> {
  const accessToken = await getServerAccessToken();
  if (!accessToken) return { error: '認証が必要です' };

  const client = generateClient<Schema>({ authMode: 'userPool' });
  const authOptions = { authToken: accessToken };

  // 関連レコードを並列取得
  const [boardPosts, tags, flavorVotes, bookmarks, histories] = await Promise.all([
    fetchAll<Schema['BoardPost']['type']>((t, lim) =>
      client.models.BoardPost.listBoardPostByLiquorId({ liquorId }, { ...authOptions, limit: lim, nextToken: t ?? undefined }),
    ),
    fetchAll<Schema['Tag']['type']>((t, lim) =>
      client.models.Tag.listTagByLiquorId({ liquorId }, { ...authOptions, limit: lim, nextToken: t ?? undefined }),
    ),
    fetchAll<Schema['FlavorVote']['type']>((t, lim) =>
      client.models.FlavorVote.listFlavorVoteByLiquorId({ liquorId }, { ...authOptions, limit: lim, nextToken: t ?? undefined }),
    ),
    fetchAll<Schema['BookMark']['type']>((t, lim) =>
      client.models.BookMark.listBookMarkByLiquorId({ liquorId }, { ...authOptions, limit: lim, nextToken: t ?? undefined }),
    ),
    fetchAll<Schema['LiquorHistory']['type']>((t, lim) =>
      client.models.LiquorHistory.listLiquorHistoryByLiquorId({ liquorId }, { ...authOptions, limit: lim, nextToken: t ?? undefined }),
    ),
  ]);

  // 関連レコードを並列削除
  const deleteResults = await Promise.all([
    ...boardPosts.map((r) => client.models.BoardPost.delete({ id: r.id }, authOptions)),
    ...tags.map((r) => client.models.Tag.delete({ id: r.id }, authOptions)),
    ...flavorVotes.map((r) => client.models.FlavorVote.delete({ id: r.id }, authOptions)),
    ...bookmarks.map((r) => client.models.BookMark.delete({ id: r.id }, authOptions)),
    ...histories.map((r) => client.models.LiquorHistory.delete({ id: r.id }, authOptions)),
  ]);
  for (const { errors } of deleteResults) {
    if (errors?.length) return { error: `関連レコードの削除に失敗しました: ${errors[0].message}` };
  }

  // お酒本体を削除
  const { errors } = await client.models.Liquor.delete({ id: liquorId }, authOptions);
  if (errors?.length) return { error: errors[0].message };

  await revalidateLiquorsCache();
  return {};
}
