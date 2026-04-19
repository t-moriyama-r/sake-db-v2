import { Button } from '@/components/ui/Button/Button';
import type { SerializableBoardPostRecord } from '@/lib/server/boardPosts/fetch';
import { BoardPostItem } from './BoardPostItem';

type Props = {
  boardPosts: SerializableBoardPostRecord[];
  ownerId: string | null;
  onOpenPostFormAction: () => void;
  onEditAction: () => void;
  onDeleteAction: () => Promise<void>;
};

export function BoardPostList({
  boardPosts,
  ownerId,
  onOpenPostFormAction,
  onEditAction,
  onDeleteAction,
}: Props) {
  const sorted = [...boardPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">みんなの投稿 ({boardPosts.length})</h2>
        <Button size="sm" onClick={onOpenPostFormAction}>
          投稿する
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {sorted.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            まだ投稿がありません。最初の投稿をしてみましょう！
          </p>
        ) : (
          sorted.map((post) => (
            <BoardPostItem
              key={post.id}
              post={post}
              isOwner={ownerId !== null && post.userId === ownerId}
              onEditAction={onEditAction}
              onDeleteAction={onDeleteAction}
            />
          ))
        )}
      </div>
    </section>
  );
}
