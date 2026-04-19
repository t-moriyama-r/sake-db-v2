'use client';

import { Dialog } from '@/components/ui/Dialog/Dialog';
import type { SerializableBoardPostRecord } from '@/lib/server/boardPosts/fetch';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
import { useBoardSection } from '../hooks/useBoardSection';
import { BoardPostForm } from './BoardPostForm';
import { BoardPostList } from './BoardPostList';

type Props = {
  liquor: SerializableLiquorRecord;
  initialBoardPosts: SerializableBoardPostRecord[];
  isLogin: boolean;
  onLiquorUpdateAction: (updated: SerializableLiquorRecord) => void;
};

export function BoardSection({ liquor, initialBoardPosts, isLogin, onLiquorUpdateAction }: Props) {
  const {
    boardPosts,
    postFormOpen,
    existingPost,
    userId,
    openPostForm,
    closePostForm,
    handlePost,
    handleDelete,
  } = useBoardSection({ liquor, initialBoardPosts, onLiquorUpdateAction });

  return (
    <>
      <BoardPostList
        boardPosts={boardPosts}
        ownerId={userId}
        onOpenPostFormAction={openPostForm}
        onEditAction={openPostForm}
        onDeleteAction={handleDelete}
      />

      <Dialog
        open={postFormOpen}
        onClose={closePostForm}
        title={existingPost ? '投稿を編集する' : '投稿する'}
      >
        <BoardPostForm
          onSubmit={handlePost}
          onDelete={existingPost ? handleDelete : undefined}
          isLoggedIn={isLogin}
          defaultValues={{ text: existingPost?.text ?? '', rate: existingPost?.rate ?? null }}
          submitLabel={existingPost ? '更新する' : '投稿する'}
        />
      </Dialog>
    </>
  );
}
