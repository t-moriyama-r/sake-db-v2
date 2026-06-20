'use client';

import { useTransition } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useActionError } from '@/hooks/useActionError';
import type { SerializableBoardPostRecord } from '@/lib/server/boardPosts/fetch';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
import type { BoardPostInput } from '@/schemas/board';
import { useBoardPostApi } from './useBoardPostApi';

type LiquorInfo = Pick<SerializableLiquorRecord, 'id' | 'categoryId' | 'categoryName' | 'name' | 'tags'>;

type Options = {
  liquor: LiquorInfo;
  existingPost: SerializableBoardPostRecord | null;
  boardPosts: SerializableBoardPostRecord[];
  onBoardPostsChangeAction: (posts: SerializableBoardPostRecord[]) => void;
  onLiquorUpdateAction: (updated: SerializableLiquorRecord) => void;
  onCloseAction: () => void;
};

export function useBoardPostMutations({
  liquor,
  existingPost,
  boardPosts,
  onBoardPostsChangeAction,
  onLiquorUpdateAction,
  onCloseAction,
}: Options) {
  const { user } = useAuth();
  const { actionError, withActionError } = useActionError();
  const [deleting, startDeleteTransition] = useTransition();
  const { createBoardPost, updateBoardPost, deleteBoardPost, updateLiquorAvgRate } = useBoardPostApi();

  async function handleFormSubmit(data: BoardPostInput): Promise<void> {
    await withActionError(() => postBoardPost(data), '投稿に失敗しました');
  }

  function handleDelete(): void {
    startDeleteTransition(async () => {
      await withActionError(removeBoardPost, '削除に失敗しました');
    });
  }

  async function postBoardPost(data: BoardPostInput): Promise<void> {
    const authMode = user ? 'userPool' : 'apiKey';
    let updatedPosts: SerializableBoardPostRecord[];

    if (existingPost) {
      const updated = await updateBoardPost({
        id: existingPost.id,
        text: data.text,
        rate: data.rate ?? undefined,
        userName: user?.name ?? null,
        userImageBase64: user?.imageBase64,
      });
      updatedPosts = boardPosts.map((p) => (p.id === existingPost.id ? updated : p));
    } else {
      const created = await createBoardPost(
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
        authMode,
      );
      updatedPosts = [...boardPosts, created];
    }

    onBoardPostsChangeAction(updatedPosts);
    const updatedLiquorBase = await updateLiquorAvgRate(liquor.id, updatedPosts, authMode);
    if (updatedLiquorBase) {
      onLiquorUpdateAction({ ...updatedLiquorBase, tags: liquor.tags });
    }
    onCloseAction();
  }

  async function removeBoardPost(): Promise<void> {
    if (!existingPost) return;
    await deleteBoardPost(existingPost.id);
    const updatedPosts = boardPosts.filter((p) => p.id !== existingPost.id);
    onBoardPostsChangeAction(updatedPosts);
    const updatedLiquorBase = await updateLiquorAvgRate(liquor.id, updatedPosts, 'userPool');
    if (updatedLiquorBase) {
      onLiquorUpdateAction({ ...updatedLiquorBase, tags: liquor.tags });
    }
    onCloseAction();
  }

  return { handleFormSubmit, handleDelete, actionError, deleting };
}
