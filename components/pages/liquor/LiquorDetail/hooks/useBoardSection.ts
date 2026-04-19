'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/amplify-client';
import type { BoardPostRecord, SerializableBoardPostRecord } from '@/lib/server/boardPosts/fetch';
import { revalidateBoardPostsCache } from '@/lib/server/boardPosts/revalidate';
import type { LiquorRecord, SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
import { revalidateLiquorsCache } from '@/lib/server/liquors/revalidate';
import type { BoardPostInput } from '@/schemas/board';

type Options = {
  liquor: SerializableLiquorRecord;
  initialBoardPosts: SerializableBoardPostRecord[];
  onLiquorUpdateAction: (updated: SerializableLiquorRecord) => void;
};

export function useBoardSection({ liquor, initialBoardPosts, onLiquorUpdateAction }: Options) {
  const { user } = useAuth();
  const [boardPosts, setBoardPosts] = useState<SerializableBoardPostRecord[]>(initialBoardPosts);
  const [postFormOpen, setPostFormOpen] = useState<boolean>(false);

  const existingPost = useMemo(
    () => (user ? (boardPosts.find((p) => p.userId === user.id) ?? null) : null),
    [user, boardPosts],
  );

  function openPostForm(): void {
    setPostFormOpen(true);
  }

  function closePostForm(): void {
    setPostFormOpen(false);
  }

  async function handlePost(data: BoardPostInput): Promise<void> {
    const authMode = user ? 'userPool' : 'apiKey';

    if (existingPost) {
      const { data: updatedPost, errors } = await client.models.BoardPost.update(
        {
          id: existingPost.id,
          text: data.text,
          rate: data.rate ?? undefined,
          userName: user?.name ?? null,
          userImageBase64: user?.imageBase64,
        },
        { authMode: 'userPool' },
      );
      if (errors?.length) throw new Error(errors[0].message);
      if (updatedPost) {
        const { liquor: _l, ...cleanPost } = updatedPost as BoardPostRecord & { liquor?: unknown };
        const updatedPosts = boardPosts.map((p) =>
          p.id === existingPost.id ? (cleanPost as SerializableBoardPostRecord) : p,
        );
        setBoardPosts(updatedPosts);
        await updateBoardAvgRate(updatedPosts, 'userPool');
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
          userId: user?.id,
          userName: user?.name ?? (data.guestName || null),
          userImageBase64: user?.imageBase64,
        },
        { authMode },
      );
      if (errors?.length) throw new Error(errors[0].message);
      if (newPost) {
        const { liquor: _l, ...cleanPost } = newPost as BoardPostRecord & { liquor?: unknown };
        const updatedPosts = [...boardPosts, cleanPost as SerializableBoardPostRecord];
        setBoardPosts(updatedPosts);
        await updateBoardAvgRate(updatedPosts, authMode);
      }
    }

    closePostForm();
  }

  async function handleDelete(): Promise<void> {
    if (!existingPost) return;

    const { errors } = await client.models.BoardPost.delete(
      { id: existingPost.id },
      { authMode: 'userPool' },
    );
    if (errors?.length) throw new Error(errors[0].message);

    const updatedPosts = boardPosts.filter((p) => p.id !== existingPost.id);
    setBoardPosts(updatedPosts);
    closePostForm();
    await updateBoardAvgRate(updatedPosts, 'userPool');
  }

  async function updateBoardAvgRate(
    posts: SerializableBoardPostRecord[],
    authMode: 'apiKey' | 'userPool',
  ): Promise<void> {
    const rated = posts.filter((p) => p.rate != null);
    const boardRateCount = rated.length > 0 ? rated.length : null;
    const boardAvgRate =
      rated.length > 0 ? rated.reduce((acc, p) => acc + (p.rate ?? 0), 0) / rated.length : null;
    const { data: updated } = await client.models.Liquor.update(
      { id: liquor.id, boardAvgRate, boardRateCount },
      { authMode },
    );
    if (updated) {
      const {
        category: _cat,
        boardPosts: _bp,
        tags: _tags,
        flavorVotes: _fv,
        bookmarks: _bm,
        liquorHistories: _lh,
        ...rest
      } = updated as LiquorRecord & Record<string, unknown>;
      onLiquorUpdateAction(rest as SerializableLiquorRecord);
    }
    await revalidateBoardPostsCache();
    await revalidateLiquorsCache();
  }

  return {
    boardPosts,
    postFormOpen,
    existingPost,
    userId: user?.id ?? null,
    openPostForm,
    closePostForm,
    handlePost,
    handleDelete,
  };
}
