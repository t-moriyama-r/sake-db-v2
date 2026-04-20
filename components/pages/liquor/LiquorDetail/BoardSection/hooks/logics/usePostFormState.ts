'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { SerializableBoardPostRecord } from '@/lib/server/boardPosts/fetch';

export function usePostFormState(boardPosts: SerializableBoardPostRecord[]) {
  const { user } = useAuth();

  const existingPost = useMemo(
    () => (user ? (boardPosts.find((p) => p.userId === user.id) ?? null) : null),
    [user, boardPosts],
  );

  return { existingPost };
}
