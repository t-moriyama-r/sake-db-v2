'use client';

import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/Dialog/Dialog';
import { useAuth } from '@/hooks/useAuth';
import type { LiquorRecord } from '@/lib/server/liquors/fetch';
import type { TagRecord } from '@/lib/server/tags/fetch';
import { routes } from '@/lib/routes';
import { useLiquorDelete } from '../hooks/useLiquorDelete';
import { LiquorActions } from './LiquorActions';
import { LiquorImage } from './LiquorImage';
import { LiquorInfo } from './LiquorInfo';
import { LiquorTagSection } from './LiquorTagSection';
import { LiquorUserRating } from './LiquorUserRating';
import { LiquorYoutube } from './LiquorYoutube';

type Props = {
  liquor: LiquorRecord;
  tags: TagRecord[];
  isLogin: boolean;
  newTag: string;
  onNewTagChangeAction: (value: string) => void;
  onAddTagAction: () => void;
  onDeleteTagAction: (id: string) => void;
  ratingValue: number | null;
  ratingLoading: boolean;
  onRateAction: (value: number) => void;
};

export function LiquorCard({
  liquor,
  tags,
  isLogin,
  newTag,
  onNewTagChangeAction,
  onAddTagAction,
  onDeleteTagAction,
  ratingValue,
  ratingLoading,
  onRateAction,
}: Props) {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { deleteDialog, setDeleteDialog, deleting, handleDelete } = useLiquorDelete({
    liquorId: liquor.id,
    categoryId: liquor.categoryId,
  });

  const youtubeEmbedId = liquor.youtube?.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];

  return (
    <>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="shrink-0">
            <LiquorImage
              imageBase64={liquor.imageBase64}
              imageUrl={liquor.imageUrl}
              name={liquor.name}
            />
          </div>

          <div className="flex-1">
            <LiquorInfo liquor={liquor} />

            <LiquorTagSection
              tags={tags}
              isLogin={isLogin}
              newTag={newTag}
              onNewTagChangeAction={onNewTagChangeAction}
              onAddTagAction={onAddTagAction}
              onDeleteTagAction={onDeleteTagAction}
            />

            {isLogin && (
              <LiquorUserRating
                ratingValue={ratingValue}
                ratingLoading={ratingLoading}
                onRateAction={onRateAction}
              />
            )}

            <LiquorActions
              isAdmin={isAdmin}
              onEditAction={() => router.push(routes.liquor.edit(liquor.id))}
              onDeleteAction={() => setDeleteDialog(true)}
            />
          </div>
        </div>

        {youtubeEmbedId && (
          <LiquorYoutube youtubeEmbedId={youtubeEmbedId} title={liquor.name} />
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="お酒を削除"
        message={`「${liquor.name}」を削除してもよろしいですか？この操作は取り消せません。`}
        confirmLabel="削除する"
        loading={deleting}
      />
    </>
  );
}
