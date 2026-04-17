import Link from 'next/link';
import { StarRating } from '@/components/ui/StarRating/StarRating';
import type { BoardPostRecord } from '@/lib/server/boardPosts/fetch';

type Props = {
  post: BoardPostRecord;
};

export function BoardPostItem({ post }: Props) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {post.userImageBase64 ? (
          <img
            src={post.userImageBase64}
            alt={post.userName ?? '匿名'}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-avatar-bg text-sm font-medium text-avatar-fg">
            {post.userName?.[0] ?? '?'}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {post.userId ? (
              <Link href={`/user/${post.userId}`} className="text-sm font-medium text-foreground hover:text-primary">
                {post.userName}
              </Link>
            ) : (
              <span className="text-sm font-medium text-muted-foreground">{post.userName ?? '匿名'}</span>
            )}
            {post.rate && <StarRating value={post.rate} readonly size="sm" />}
          </div>
          <p className="mt-1 text-sm text-foreground-secondary whitespace-pre-wrap">{post.text}</p>
        </div>
      </div>
    </div>
  );
}

