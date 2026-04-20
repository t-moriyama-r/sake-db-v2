'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { SerializableBoardPostRecord } from '@/lib/server/boardPosts/fetch';
import type { CategoryBreadcrumbItem } from '@/lib/server/categories/fetch';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
import type { TagItem } from './hooks/useLiquorTags';
import { BoardSection } from './BoardSection/BoardSection';
import { LiquorBreadcrumb } from './LiquorBreadcrumb';
import { LiquorProfile } from './LiquorProfile/LiquorProfile';

type Props = {
  initialLiquor: SerializableLiquorRecord;
  initialBoardPosts: SerializableBoardPostRecord[];
  initialTags: TagItem[];
  categoryPath: CategoryBreadcrumbItem[];
};

export function LiquorDetail({ initialLiquor, initialBoardPosts, initialTags, categoryPath }: Props) {
  const { isLogin } = useAuth();
  const [liquor, setLiquor] = useState<SerializableLiquorRecord>(initialLiquor);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <LiquorBreadcrumb categoryPath={categoryPath} liquorName={liquor.name} />

      <div className="mt-4 flex flex-col gap-8">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <LiquorProfile
            liquor={liquor}
            initialTags={initialTags}
            isLogin={isLogin}
          />
        </div>

        <BoardSection
          liquor={liquor}
          boardPosts={initialBoardPosts}
          onLiquorUpdateAction={setLiquor}
        />
      </div>
    </div>
  );
}
