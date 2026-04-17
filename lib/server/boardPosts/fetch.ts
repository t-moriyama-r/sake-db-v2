import type { Schema } from '@/amplify/data/resource';
import { fetchAll } from '../amplify-list';
import { withCache, CACHE_TAGS } from '../cache';
import { getGuestClient } from '../client';

export type BoardPostRecord = Schema['BoardPost']['type'];

/** 指定お酒の掲示板投稿を取得する。 */
export const fetchBoardPosts = withCache(
  async (liquorId: string): Promise<BoardPostRecord[]> => {
    const client = getGuestClient();
    return fetchAll((t, lim) =>
      client.models.BoardPost.list({ filter: { liquorId: { eq: liquorId } }, limit: lim, nextToken: t }),
    );
  },
  ['board-posts'],
  { tags: [CACHE_TAGS.boardPosts], revalidate: 300 },
);

/**
 * ユーザーの投稿一覧を取得する。
 * BoardPost.userId の GSI（secondaryIndex）を使って効率的に検索する。
 */
export const fetchUserBoardPosts = withCache(
  async (userId: string): Promise<BoardPostRecord[]> => {
    const client = getGuestClient();
    const { data } = await client.models.BoardPost.listBoardPostByUserId({ userId }, { limit: 200 });
    return [...(data ?? [])].sort(
      (a, b) =>
        new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime(),
    );
  },
  ['user-board-posts'],
  { tags: [CACHE_TAGS.boardPosts], revalidate: 300 },
);
