'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/amplify-client';
import { useAuth } from '@/hooks/useAuth';
import { revalidateLiquorsCache } from '@/lib/server/liquors/revalidate';
import { revalidateBoardPostsCache } from '@/lib/server/boardPosts/revalidate';
import type { LiquorRecord } from '@/lib/server/liquors/fetch';
import type { BoardPostRecord } from '@/lib/server/boardPosts/fetch';
import type { TagRecord } from '@/lib/server/tags/fetch';
import type { ServerUser } from '@/lib/server/auth';
import type { BoardPostInput } from '@/schemas/board';

type UseLiquorDetailOptions = {
  initialLiquor: LiquorRecord;
  initialBoardPosts: BoardPostRecord[];
  initialTags: TagRecord[];
  serverUser: ServerUser | null;
};

export function useLiquorDetail({ initialLiquor, initialBoardPosts, initialTags, serverUser }: UseLiquorDetailOptions) {
  const router = useRouter();
  const { user } = useAuth();

  const [liquor, setLiquor] = useState(initialLiquor);
  const [boardPosts, setBoardPosts] = useState(initialBoardPosts);
  const [tags, setTags] = useState(initialTags);
  const [postFormOpen, setPostFormOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [ratingValue, setRatingValue] = useState(() => {
    if (!serverUser) return 0;
    return [5, 4, 3, 2, 1].find((r) =>
      (initialLiquor[`rate${r}Users` as keyof LiquorRecord] as string[] | null)?.includes(serverUser.id)
    ) ?? 0;
  });
  const [ratingLoading, setRatingLoading] = useState(false);

  const id = liquor.id;

  async function handleRate(rate: number): Promise<void> {
    if (!user) return;
    setRatingLoading(true);
    try {
      const updated: Record<string, string[]> = {};
      for (const r of [5, 4, 3, 2, 1]) {
        const key = `rate${r}Users`;
        const arr = (liquor[key as keyof LiquorRecord] as string[] | null | undefined) ?? [];
        updated[key] = arr.filter((uid) => uid !== user.id);
      }
      if (rate !== ratingValue) {
        const key = `rate${rate}Users`;
        updated[key] = [...(updated[key] ?? []), user.id];
        setRatingValue(rate);
      } else {
        setRatingValue(0);
      }
      const { data } = await client.models.Liquor.update({ id, ...updated });
      if (data) setLiquor(stripLiquorRelations(data));
      await revalidateLiquorsCache();
    } finally {
      setRatingLoading(false);
    }
  }

  async function handlePost(data: BoardPostInput): Promise<void> {
    const authMode = user ? 'userPool' : 'apiKey';
    const postData = {
      liquorId: id,
      categoryId: liquor.categoryId,
      categoryName: liquor.categoryName,
      liquorName: liquor.name,
      text: data.text,
      rate: data.rate ?? undefined,
      userId: user?.id,
      userName: user ? user.name : (data.guestName || null),
      userImageBase64: user?.imageBase64,
    };
    const { data: newPost, errors } = await client.models.BoardPost.create(postData, { authMode });
    if (errors?.length) {
      throw new Error(errors[0].message);
    }
    if (newPost) {
      const { liquor: _liquorFn, ...cleanPost } = newPost as BoardPostRecord & { liquor?: unknown };
      const updatedPosts = [...boardPosts, cleanPost as BoardPostRecord];
      setBoardPosts(updatedPosts);
      await updateBoardAvgRate(updatedPosts, authMode);
      await revalidateBoardPostsCache();
    }
    setPostFormOpen(false);
  }

  async function handleAddTag(): Promise<void> {
    if (!newTag.trim()) return;
    await client.models.Tag.create({ liquorId: id, text: newTag.trim() });
    const { data: tagList } = await client.models.Tag.list({ filter: { liquorId: { eq: id } } });
    setTags(tagList.map(({ liquor: _liquorFn, ...tag }) => tag as TagRecord));
    setNewTag('');
  }

  async function handleDeleteTag(tagId: string): Promise<void> {
    await client.models.Tag.delete({ id: tagId });
    setTags((prev) => prev.filter((t) => t.id !== tagId));
  }

  async function handleDelete(): Promise<void> {
    setDeleting(true);
    try {
      await client.models.Liquor.delete({ id });
      router.push(`/category/${liquor.categoryId}`);
    } finally {
      setDeleting(false);
      setDeleteDialog(false);
    }
  }

  async function updateBoardAvgRate(posts: BoardPostRecord[], authMode: 'apiKey' | 'userPool' = 'userPool'): Promise<void> {
    const rated = posts.filter((p) => p.rate != null);
    const boardRateCount = rated.length > 0 ? rated.length : null;
    const boardAvgRate = rated.length > 0
      ? rated.reduce((acc, p) => acc + (p.rate ?? 0), 0) / rated.length
      : null;
    const { data: updated } = await client.models.Liquor.update({ id, boardAvgRate, boardRateCount }, { authMode });
    if (updated) setLiquor(stripLiquorRelations(updated));
    await revalidateLiquorsCache();
  }

  return {
    liquor,
    boardPosts,
    tags,
    newTag,
    setNewTag,
    postFormOpen,
    setPostFormOpen,
    deleteDialog,
    setDeleteDialog,
    deleting,
    ratingValue,
    ratingLoading,
    handleRate,
    handlePost,
    handleAddTag,
    handleDeleteTag,
    handleDelete,
  };
}

function stripLiquorRelations(data: LiquorRecord & Record<string, unknown>): LiquorRecord {
  const { category: _cat, boardPosts: _bp, tags: _tags, flavorVotes: _fv, bookmarks: _bm, liquorHistories: _lh, ...rest } = data;
  return rest as LiquorRecord;
}
