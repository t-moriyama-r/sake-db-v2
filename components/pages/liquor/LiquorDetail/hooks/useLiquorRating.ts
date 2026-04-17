'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/amplify-client';
import { revalidateLiquorsCache } from '@/lib/server/liquors/revalidate';
import type { LiquorRecord } from '@/lib/server/liquors/fetch';
import type { ServerUser } from '@/lib/server/auth';

type Options = {
  liquor: LiquorRecord;
  serverUser: ServerUser | null;
  onLiquorUpdate: (updated: LiquorRecord) => void;
};

export function useLiquorRating({ liquor, serverUser, onLiquorUpdate }: Options) {
  const { user } = useAuth();

  const [ratingValue, setRatingValue] = useState(() => {
    if (!serverUser) return 0;
    return [5, 4, 3, 2, 1].find((r) =>
      (liquor[`rate${r}Users` as keyof LiquorRecord] as string[] | null)?.includes(serverUser.id),
    ) ?? 0;
  });
  const [ratingLoading, setRatingLoading] = useState(false);

  async function handleRate(rate: number): Promise<void> {
    if (!user) return;
    setRatingLoading(true);
    try {
      const updated: Record<string, string[]> = {};
      for (const r of [5, 4, 3, 2, 1]) {
        const key = `rate${r}Users`;
        const arr = (liquor[key as keyof LiquorRecord] as string[] | null | undefined) ?? [];
        updated[key] = arr.filter((uid) => uid !== user.id);
      }
      if (rate !== ratingValue) {
        const key = `rate${rate}Users`;
        updated[key] = [...(updated[key] ?? []), user.id];
        setRatingValue(rate);
      } else {
        setRatingValue(0);
      }
      const { data } = await client.models.Liquor.update({ id: liquor.id, ...updated });
      if (data) onLiquorUpdate(stripLiquorRelations(data));
      await revalidateLiquorsCache();
    } finally {
      setRatingLoading(false);
    }
  }

  return { ratingValue, ratingLoading, handleRate };
}

function stripLiquorRelations(data: LiquorRecord & Record<string, unknown>): LiquorRecord {
  const { category: _cat, boardPosts: _bp, tags: _tags, flavorVotes: _fv, bookmarks: _bm, liquorHistories: _lh, ...rest } = data;
  return rest as LiquorRecord;
}

