import type { SerializableBoardPostRecord } from '@/lib/server/boardPosts/fetch';
import { CommentItem } from './CommentItem';

type Props = {
  boardPosts: SerializableBoardPostRecord[];
};

export function Comments({ boardPosts }: Props) {
  const sorted = [...boardPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="flex flex-col gap-4">
      {sorted.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          まだ投稿がありません。最初の投稿をしてみましょう！
        </p>
      ) : (
        sorted.map((post) => <CommentItem key={post.id} post={post} />)
      )}
    </div>
  );
}
