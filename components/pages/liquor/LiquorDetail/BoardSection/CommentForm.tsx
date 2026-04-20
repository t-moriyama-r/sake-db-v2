'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '@/components/forms/FormField/FormField';
import { Button } from '@/components/ui/Button/Button';
import { StarRating } from '@/components/ui/StarRating/StarRating';
import { ActionErrorMessage } from '@/components/ui/ActionErrorMessage/ActionErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import type { SerializableBoardPostRecord } from '@/lib/server/boardPosts/fetch';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';
import { boardPostSchema, type BoardPostInput } from '@/schemas/board';
import { useBoardPostMutations } from './hooks/mutations/useBoardPostMutations';

type LiquorInfo = Pick<SerializableLiquorRecord, 'id' | 'categoryId' | 'categoryName' | 'name' | 'tags'>;

type Props = {
  liquor: LiquorInfo;
  existingPost: SerializableBoardPostRecord | null;
  boardPosts: SerializableBoardPostRecord[];
  onBoardPostsChangeAction: (posts: SerializableBoardPostRecord[]) => void;
  onLiquorUpdateAction: (updated: SerializableLiquorRecord) => void;
  onCloseAction: () => void;
};

export function CommentForm({
  liquor,
  existingPost,
  boardPosts,
  onBoardPostsChangeAction,
  onLiquorUpdateAction,
  onCloseAction,
}: Props) {
  const { user } = useAuth();
  const submitLabel = existingPost ? '更新する' : '投稿する';

  const { handleFormSubmit, handleDelete, actionError, deleting } = useBoardPostMutations({
    liquor,
    existingPost,
    boardPosts,
    onBoardPostsChangeAction,
    onLiquorUpdateAction,
    onCloseAction,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BoardPostInput>({
    resolver: zodResolver(boardPostSchema),
    defaultValues: {
      text: existingPost?.text ?? '',
      rate: existingPost?.rate ?? null,
      guestName: '',
    },
  });

  const submitDisabled = existingPost !== null && !isDirty;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      <ActionErrorMessage message={actionError} />

      {!user && (
        <FormField
          label="ニックネーム（任意）"
          placeholder="名無し"
          error={errors.guestName?.message}
          {...register('guestName')}
        />
      )}

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground-secondary">評価</span>
        <Controller
          name="rate"
          control={control}
          render={({ field }) => (
            <StarRating
              value={field.value ?? 0}
              onChange={(v) => field.onChange(field.value === v ? null : v)}
            />
          )}
        />
        <p className="text-xs text-muted-foreground">クリックで選択・再クリックで解除</p>
      </div>

      <FormField
        as="textarea"
        label="コメント"
        required
        rows={3}
        autoFocus
        placeholder="感想を書いてください"
        error={errors.text?.message}
        {...register('text')}
      />

      <div className="flex items-center gap-2">
        <Button type="submit" loading={isSubmitting} disabled={submitDisabled} className="flex-1">
          {submitLabel}
        </Button>
        {existingPost && (
          <Button type="button" variant="danger" loading={deleting} onClick={handleDelete}>
            削除する
          </Button>
        )}
      </div>
    </form>
  );
}
