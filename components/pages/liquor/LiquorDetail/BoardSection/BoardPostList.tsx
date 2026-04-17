import { Button } from '@/components/ui/Button/Button';
import type { BoardPostRecord } from '@/lib/server/boardPosts/fetch';
import { BoardPostItem } from './BoardPostItem';

type Props = {
  boardPosts: BoardPostRecord[];
  onOpenPostFormAction: () => void;
};

export function BoardPostList({ boardPosts, onOpenPostFormAction }: Props) {
  const sorted = [...boardPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">みんなの投稿 ({boardPosts.length})</h2>
        <Button size="sm" onClick={onOpenPostFormAction}>投稿する</Button>
      </div>

      <div className="flex flex-col gap-4">
        {sorted.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            まだ投稿がありません。最初の投稿をしてみましょう！
          </p>
        ) : (
          sorted.map((post) => <BoardPostItem key={post.id} post={post} />)
        )}
      </div>
    </section>
  );
}
