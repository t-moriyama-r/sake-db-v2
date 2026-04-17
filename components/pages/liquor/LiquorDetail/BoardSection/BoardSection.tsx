'use client';

import { Dialog } from '@/components/ui/Dialog/Dialog';
import type { BoardPostRecord } from '@/lib/server/boardPosts/fetch';
import type { BoardPostInput } from '@/schemas/board';
import { BoardPostForm } from './BoardPostForm';
import { BoardPostList } from './BoardPostList';

type Props = {
  boardPosts: BoardPostRecord[];
  postFormOpen: boolean;
  existingPost: BoardPostRecord | null;
  postFetching: boolean;
  isLogin: boolean;
  onOpenPostFormAction: () => void;
  onClosePostFormAction: () => void;
  onSubmitPostAction: (data: BoardPostInput) => Promise<void>;
};

export function BoardSection({
  boardPosts,
  postFormOpen,
  existingPost,
  postFetching,
  isLogin,
  onClosePostFormAction,
  onOpenPostFormAction,
  onSubmitPostAction,
}: Props) {
  return (
    <>
      <BoardPostList boardPosts={boardPosts} onOpenPostFormAction={onOpenPostFormAction} />

      <Dialog open={postFormOpen} onClose={onClosePostFormAction} title="投稿する">
        <BoardPostForm
          onSubmit={onSubmitPostAction}
          isLoggedIn={isLogin}
          defaultValues={{ text: existingPost?.text ?? '', rate: existingPost?.rate ?? null }}
          submitLabel={existingPost ? '更新する' : '投稿する'}
          loading={postFetching}
        />
      </Dialog>
    </>
  );
}

