'use client';

import { Dialog } from '@/components/ui/Dialog/Dialog';
import type { SerializableBoardPostRecord } from '@/lib/server/boardPosts/fetch';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
import { CommentForm } from './CommentForm';
import { usePostFormState } from './hooks/logics/usePostFormState';

type LiquorInfo = Pick<
  SerializableLiquorRecord,
  'id' | 'categoryId' | 'categoryName' | 'name' | 'tags'
>;

type Props = {
  open: boolean;
  onCloseAction: () => void;
  liquor: LiquorInfo;
  boardPosts: SerializableBoardPostRecord[];
  onBoardPostsChangeAction: (posts: SerializableBoardPostRecord[]) => void;
  onLiquorUpdateAction: (updated: SerializableLiquorRecord) => void;
};

export function CommentFormDialog({
  open,
  onCloseAction,
  liquor,
  boardPosts,
  onBoardPostsChangeAction,
  onLiquorUpdateAction,
}: Props) {
  const { existingPost } = usePostFormState(boardPosts);

  return (
    <Dialog
      open={open}
      onClose={onCloseAction}
      title={existingPost ? '投稿を編集する' : '投稿する'}
    >
      <CommentForm
        liquor={liquor}
        existingPost={existingPost}
        boardPosts={boardPosts}
        onBoardPostsChangeAction={onBoardPostsChangeAction}
        onLiquorUpdateAction={onLiquorUpdateAction}
        onCloseAction={onCloseAction}
      />
    </Dialog>
  );
}
