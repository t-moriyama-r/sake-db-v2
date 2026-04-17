'use client';

import { useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/amplify-client';
import type { BoardPostRecord } from '@/lib/server/boardPosts/fetch';
import { revalidateBoardPostsCache } from '@/lib/server/boardPosts/revalidate';
import type { LiquorRecord } from '@/lib/server/liquors/fetch';
import { revalidateLiquorsCache } from '@/lib/server/liquors/revalidate';
import type { BoardPostInput } from '@/schemas/board';

type Options = {
  liquor: LiquorRecord;
  initialBoardPosts: BoardPostRecord[];
  onLiquorUpdateAction: (updated: LiquorRecord) => void;
};

export function useBoardSection({ liquor, initialBoardPosts, onLiquorUpdateAction }: Options) {
  const { user } = useAuth();
  const [boardPosts, setBoardPosts] = useState(initialBoardPosts);
  const [postFormOpen, setPostFormOpen] = useState(false);
  const [existingPost, setExistingPost] = useState<BoardPostRecord | null>(null);
  const [postFetching, setPostFetching] = useState(false);

  async function openPostForm(): Promise<void> {
    setPostFormOpen(true);
    setExistingPost(null);

    if (!user) return;

    setPostFetching(true);
    try {
      const session = await fetchAuthSession();
      const sessionUserId = session.tokens?.accessToken?.payload?.sub as string | undefined;
      if (!sessionUserId) return;

      const { data } = await client.models.BoardPost.listBoardPostByUserId(
        { userId: sessionUserId },
        { filter: { liquorId: { eq: liquor.id } }, authMode: 'userPool' },
      );
      setExistingPost(data?.[0] ?? null);
    } catch {
      // セッション切れなどの場合は空フォームにフォールバック
    } finally {
      setPostFetching(false);
    }
  }

  function closePostForm(): void {
    setPostFormOpen(false);
    setExistingPost(null);
  }

  async function handlePost(data: BoardPostInput): Promise<void> {
    let sessionUserId: string | undefined;
    try {
      const session = await fetchAuthSession();
      sessionUserId = session.tokens?.accessToken?.payload?.sub as string | undefined;
    } catch {
      // 未ログインまたはセッション切れ
    }

    const authMode = sessionUserId ? 'userPool' : 'apiKey';

    if (existingPost) {
      const { data: updatedPost, errors } = await client.models.BoardPost.update(
        {
          id: existingPost.id,
          text: data.text,
          rate: data.rate ?? undefined,
          userName: user?.name ?? null,
          userImageBase64: user?.imageBase64,
        },
        { authMode },
      );
      if (errors?.length) throw new Error(errors[0].message);
      if (updatedPost) {
        const { liquor: _l, ...cleanPost } = updatedPost as BoardPostRecord & { liquor?: unknown };
        const updatedPosts = boardPosts.map((p) =>
          p.id === existingPost.id ? (cleanPost as BoardPostRecord) : p,
        );
        setBoardPosts(updatedPosts);
        await updateBoardAvgRate(updatedPosts, authMode);
      }
    } else {
      const { data: newPost, errors } = await client.models.BoardPost.create(
        {
          liquorId: liquor.id,
          categoryId: liquor.categoryId,
          categoryName: liquor.categoryName,
          liquorName: liquor.name,
          text: data.text,
          rate: data.rate ?? undefined,
          userId: sessionUserId,
          userName: user?.name ?? (data.guestName || null),
          userImageBase64: user?.imageBase64,
        },
        { authMode },
      );
      if (errors?.length) throw new Error(errors[0].message);
      if (newPost) {
        const { liquor: _l, ...cleanPost } = newPost as BoardPostRecord & { liquor?: unknown };
        const updatedPosts = [...boardPosts, cleanPost as BoardPostRecord];
        setBoardPosts(updatedPosts);
        await updateBoardAvgRate(updatedPosts, authMode);
      }
    }

    closePostForm();
  }

  async function updateBoardAvgRate(posts: BoardPostRecord[], authMode: 'apiKey' | 'userPool'): Promise<void> {
    const rated = posts.filter((p) => p.rate != null);
    const boardRateCount = rated.length > 0 ? rated.length : null;
    const boardAvgRate = rated.length > 0
      ? rated.reduce((acc, p) => acc + (p.rate ?? 0), 0) / rated.length
      : null;
    const { data: updated } = await client.models.Liquor.update(
      { id: liquor.id, boardAvgRate, boardRateCount },
      { authMode },
    );
    if (updated) {
      const { category: _cat, boardPosts: _bp, tags: _tags, flavorVotes: _fv, bookmarks: _bm, liquorHistories: _lh, ...rest } = updated as LiquorRecord & Record<string, unknown>;
      onLiquorUpdateAction(rest as LiquorRecord);
    }
    await revalidateBoardPostsCache();
    await revalidateLiquorsCache();
  }

  return { boardPosts, postFormOpen, existingPost, postFetching, openPostForm, closePostForm, handlePost };
}

