import type { Schema } from '@/amplify/data/resource';
import { fetchAll } from '../amplify-list';
import { withCache, CACHE_TAGS } from '../cache';
import { getGuestClient } from '../client';

export type BoardPostRecord = Schema['BoardPost']['type'];
export type SerializableBoardPostRecord = Omit<BoardPostRecord, 'liquor'>;

/** 指定お酒の掲示板投稿を取得する。 */
export const fetchBoardPosts = withCache(
  async (liquorId: string): Promise<SerializableBoardPostRecord[]> => {
    const client = getGuestClient();
    const result = await fetchAll((t, lim) =>
      client.models.BoardPost.list({ filter: { liquorId: { eq: liquorId } }, limit: lim, nextToken: t }),
    );
    return JSON.parse(JSON.stringify(result)) as SerializableBoardPostRecord[];
  },
  ['board-posts'],
  { tags: [CACHE_TAGS.boardPosts], revalidate: 300 },
);

/**
 * ユーザーの投稿一覧を取得する。
 * BoardPost.userId の GSI（secondaryIndex）を使って効率的に検索する。
 */
export const fetchUserBoardPosts = withCache(
  async (userId: string): Promise<SerializableBoardPostRecord[]> => {
    const client = getGuestClient();
    const result = await fetchAll((nextToken, limit) =>
      client.models.BoardPost.listBoardPostByUserId({ userId }, { limit, nextToken: nextToken ?? undefined }),
    );
    const sorted = [...result].sort(
      (a, b) =>
        new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime(),
    );
    return JSON.parse(JSON.stringify(sorted)) as SerializableBoardPostRecord[];
  },
  ['user-board-posts'],
  { tags: [CACHE_TAGS.boardPosts], revalidate: 300 },
);
