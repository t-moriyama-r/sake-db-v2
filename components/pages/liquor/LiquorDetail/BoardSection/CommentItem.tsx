import Image from 'next/image';
import Link from 'next/link';
import { StarRating } from '@/components/ui/StarRating/StarRating';
import { routes } from '@/lib/routes';
import type { SerializableBoardPostRecord } from '@/lib/server/boardPosts/fetch';

type Props = {
  post: SerializableBoardPostRecord;
};

export function CommentItem({ post }: Props) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {post.userImageBase64 ? (
          <Image
            src={post.userImageBase64}
            alt={post.userName ?? '匿名'}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-avatar-bg text-sm font-medium text-avatar-fg">
            {post.userName?.[0] ?? '?'}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {post.userId ? (
              <Link
                href={routes.user(post.userId)}
                className="text-sm font-medium text-foreground hover:text-primary"
              >
                {post.userName}
              </Link>
            ) : (
              <span className="text-sm font-medium text-muted-foreground">
                {post.userName ?? '匿名'}
              </span>
            )}
            {post.rate && <StarRating value={post.rate} readonly size="sm" />}
            {post.updatedAt && (
              <time dateTime={post.updatedAt} className="text-xs text-muted-foreground">
                {new Date(post.updatedAt).toLocaleDateString('ja-JP')}
              </time>
            )}
          </div>
          <p className="mt-1 text-sm text-foreground-secondary whitespace-pre-wrap">{post.text}</p>
        </div>
      </div>
    </div>
  );
}
