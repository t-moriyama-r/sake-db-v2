'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import { StarRating } from '@/components/ui/StarRating/StarRating';
import type { SerializableBoardPostRecord } from '@/lib/server/boardPosts/fetch';

type Props = {
  post: SerializableBoardPostRecord;
  isOwner?: boolean;
  onEditAction?: () => void;
  onDeleteAction?: () => Promise<void>;
};

export function BoardPostItem({ post, isOwner, onEditAction, onDeleteAction }: Props) {
  const [deleting, setDeleting] = useState<boolean>(false);

  async function handleDelete() {
    if (!onDeleteAction) return;
    setDeleting(true);
    try {
      await onDeleteAction();
    } finally {
      setDeleting(false);
    }
  }

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
              <Link
                href={`/user/${post.userId}`}
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
          </div>
          <p className="mt-1 text-sm text-foreground-secondary whitespace-pre-wrap">{post.text}</p>
          {isOwner && (
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="ghost" onClick={onEditAction}>
                編集
              </Button>
              <Button size="sm" variant="ghost" loading={deleting} onClick={handleDelete}>
                削除
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
