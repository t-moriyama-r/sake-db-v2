'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { ServerUser } from '@/lib/server/auth';
import type { BoardPostRecord } from '@/lib/server/boardPosts/fetch';
import type { CategoryBreadcrumbItem } from '@/lib/server/categories/fetch';
import type { LiquorRecord } from '@/lib/server/liquors/fetch';
import type { TagRecord } from '@/lib/server/tags/fetch';
import { useBoardSection } from './hooks/useBoardSection';
import { useLiquorRating } from './hooks/useLiquorRating';
import { useLiquorTags } from './hooks/useLiquorTags';
import { BoardSection } from './BoardSection/BoardSection';
import { LiquorBreadcrumb } from './LiquorBreadcrumb';
import { LiquorCard } from './LiquorCard/LiquorCard';

type Props = {
  initialLiquor: LiquorRecord;
  initialBoardPosts: BoardPostRecord[];
  initialTags: TagRecord[];
  serverUser: ServerUser | null;
  categoryPath: CategoryBreadcrumbItem[];
};

export function LiquorDetail({ initialLiquor, initialBoardPosts, initialTags, serverUser, categoryPath }: Props) {
  const { isLogin } = useAuth();
  const [liquor, setLiquor] = useState(initialLiquor);

  const { ratingValue, ratingLoading, handleRate } = useLiquorRating({ liquor, serverUser, onLiquorUpdate: setLiquor });
  const { tags, newTag, setNewTag, handleAddTag, handleDeleteTag } = useLiquorTags({ liquorId: liquor.id, initialTags });
  const { boardPosts, postFormOpen, existingPost, postFetching, openPostForm, closePostForm, handlePost } = useBoardSection({ liquor, initialBoardPosts, onLiquorUpdate: setLiquor });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <LiquorBreadcrumb categoryPath={categoryPath} liquorName={liquor.name} />

      <LiquorCard
        liquor={liquor}
        tags={tags}
        isLogin={isLogin}
        newTag={newTag}
        onNewTagChangeAction={setNewTag}
        onAddTagAction={handleAddTag}
        onDeleteTagAction={handleDeleteTag}
        ratingValue={ratingValue}
        ratingLoading={ratingLoading}
        onRateAction={handleRate}
      />

      <BoardSection
        boardPosts={boardPosts}
        postFormOpen={postFormOpen}
        existingPost={existingPost}
        postFetching={postFetching}
        isLogin={isLogin}
        onOpenPostFormAction={openPostForm}
        onClosePostFormAction={closePostForm}
        onSubmitPostAction={handlePost}
      />
    </div>
  );
}
