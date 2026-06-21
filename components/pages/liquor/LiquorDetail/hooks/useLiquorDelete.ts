'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/amplify-client';
import { routes } from '@/lib/routes';
import { fetchAll } from '@/lib/server/amplify-list';

type Options = {
  liquorId: string;
  categoryId: string;
};

export function useLiquorDelete({ liquorId, categoryId }: Options) {
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [deleting, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleDelete(): void {
    setDeleteError(null);
    startTransition(async () => {
      try {
        // 関連レコードを並列取得
        const [boardPosts, tags, flavorVotes, bookmarks, histories] = await Promise.all([
          fetchAll((t, lim) =>
            client.models.BoardPost.list({ filter: { liquorId: { eq: liquorId } }, limit: lim, nextToken: t ?? undefined }),
          ),
          fetchAll((t, lim) =>
            client.models.Tag.list({ filter: { liquorId: { eq: liquorId } }, limit: lim, nextToken: t ?? undefined }),
          ),
          fetchAll((t, lim) =>
            client.models.FlavorVote.list({ filter: { liquorId: { eq: liquorId } }, limit: lim, nextToken: t ?? undefined }),
          ),
          fetchAll((t, lim) =>
            client.models.BookMark.list({ filter: { liquorId: { eq: liquorId } }, limit: lim, nextToken: t ?? undefined }),
          ),
          fetchAll((t, lim) =>
            client.models.LiquorHistory.list({ filter: { liquorId: { eq: liquorId } }, limit: lim, nextToken: t ?? undefined }),
          ),
        ]);

        // 関連レコードを並列削除
        await Promise.all([
          ...boardPosts.map((r) => client.models.BoardPost.delete({ id: r.id })),
          ...tags.map((r) => client.models.Tag.delete({ id: r.id })),
          ...flavorVotes.map((r) => client.models.FlavorVote.delete({ id: r.id })),
          ...bookmarks.map((r) => client.models.BookMark.delete({ id: r.id })),
          ...histories.map((r) => client.models.LiquorHistory.delete({ id: r.id })),
        ]);

        // お酒本体を削除
        const { errors } = await client.models.Liquor.delete({ id: liquorId });
        if (errors?.length) throw new Error(errors[0].message);
        setDeleteDialog(false);
        router.push(routes.category.detail(categoryId));
      } catch (e: unknown) {
        setDeleteError(e instanceof Error ? e.message : '削除に失敗しました');
      }
    });
  }

  return { deleteDialog, setDeleteDialog, deleting, handleDelete, deleteError };
}

