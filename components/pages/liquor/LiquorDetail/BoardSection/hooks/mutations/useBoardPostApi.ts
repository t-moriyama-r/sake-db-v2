'use client';

import { client } from '@/lib/amplify-client';
import type { SerializableBoardPostRecord } from '@/lib/server/boardPosts/fetch';
import { revalidateBoardPostsCache } from '@/lib/server/boardPosts/revalidate';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
import { revalidateLiquorsCache } from '@/lib/server/liquors/revalidate';

type AuthMode = 'apiKey' | 'userPool';

export type CreateBoardPostInput = {
  liquorId: string;
  categoryId: string;
  categoryName: string;
  liquorName: string;
  text: string;
  rate?: number;
  userId?: string;
  userName?: string | null;
  userImageBase64?: string;
};

export type UpdateBoardPostInput = {
  id: string;
  text: string;
  rate?: number;
  userName?: string | null;
  userImageBase64?: string;
};

export function useBoardPostApi() {
  async function createBoardPost(
    input: CreateBoardPostInput,
    authMode: AuthMode,
  ): Promise<SerializableBoardPostRecord> {
    const { data, errors } = await client.models.BoardPost.create(input, { authMode });
    if (errors?.length) throw new Error(errors[0].message);
    if (!data) throw new Error('投稿の作成に失敗しました');
    return JSON.parse(JSON.stringify(data)) as SerializableBoardPostRecord;
  }

  async function updateBoardPost(input: UpdateBoardPostInput): Promise<SerializableBoardPostRecord> {
    const { data, errors } = await client.models.BoardPost.update(input, { authMode: 'userPool' });
    if (errors?.length) throw new Error(errors[0].message);
    if (!data) throw new Error('投稿の更新に失敗しました');
    return JSON.parse(JSON.stringify(data)) as SerializableBoardPostRecord;
  }

  async function deleteBoardPost(id: string): Promise<void> {
    const { errors } = await client.models.BoardPost.delete({ id }, { authMode: 'userPool' });
    if (errors?.length) throw new Error(errors[0].message);
  }

  async function updateLiquorAvgRate(
    liquorId: string,
    posts: SerializableBoardPostRecord[],
    authMode: AuthMode,
  ): Promise<Omit<SerializableLiquorRecord, 'tags'> | null> {
    const rated = posts.filter((p) => p.rate != null);
    const boardRateCount = rated.length > 0 ? rated.length : null;
    const boardAvgRate =
      rated.length > 0
        ? rated.reduce((acc, p) => acc + (p.rate ?? 0), 0) / rated.length
        : null;
    const rate5Users = posts.filter((p) => p.userId && p.rate === 5).map((p) => p.userId!);
    const rate4Users = posts.filter((p) => p.userId && p.rate === 4).map((p) => p.userId!);
    const rate3Users = posts.filter((p) => p.userId && p.rate === 3).map((p) => p.userId!);
    const rate2Users = posts.filter((p) => p.userId && p.rate === 2).map((p) => p.userId!);
    const rate1Users = posts.filter((p) => p.userId && p.rate === 1).map((p) => p.userId!);
    const { data, errors } = await client.models.Liquor.update(
      { id: liquorId, boardAvgRate, boardRateCount, rate5Users, rate4Users, rate3Users, rate2Users, rate1Users },
      { authMode },
    );
    if (errors?.length) throw new Error(errors[0].message);
    await revalidateBoardPostsCache();
    await revalidateLiquorsCache();
    if (!data) return null;
    return JSON.parse(JSON.stringify(data)) as Omit<SerializableLiquorRecord, 'tags'>;
  }

  return { createBoardPost, updateBoardPost, deleteBoardPost, updateLiquorAvgRate };
}
