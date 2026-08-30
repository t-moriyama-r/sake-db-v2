'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import type { SerializableBoardPostRecord } from '@/lib/server/boardPosts/fetch';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
import { CommentFormDialog } from './CommentFormDialog';
import { Comments } from './Comments';

type Props = {
  liquor: SerializableLiquorRecord;
  boardPosts: SerializableBoardPostRecord[];
  onLiquorUpdateAction: (updated: SerializableLiquorRecord) => void;
};

export function BoardSection({
  liquor,
  boardPosts: initialBoardPosts,
  onLiquorUpdateAction,
}: Props) {
  const [boardPosts, setBoardPosts] = useState<SerializableBoardPostRecord[]>(initialBoardPosts);
  const [commentFormOpen, setCommentFormOpen] = useState<boolean>(false);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">みんなの投稿 ({boardPosts.length})</h2>
        <Button size="sm" onClick={() => setCommentFormOpen(true)}>
          投稿する
        </Button>
      </div>
      <Comments boardPosts={boardPosts} />
      <CommentFormDialog
        open={commentFormOpen}
        onCloseAction={() => setCommentFormOpen(false)}
        liquor={liquor}
        boardPosts={boardPosts}
        onBoardPostsChangeAction={(posts) => setBoardPosts(posts)}
        onLiquorUpdateAction={onLiquorUpdateAction}
      />
    </section>
  );
}
