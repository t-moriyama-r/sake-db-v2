'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/amplify-client';
import { useAuth } from '@/hooks/useAuth';
import { StarRating } from '@/components/ui/StarRating/StarRating';
import { Tag } from '@/components/ui/Tag/Tag';
import { Button } from '@/components/ui/Button/Button';
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog/Dialog';
import { BoardPostForm } from './BoardPostForm';
import { LiquorRating } from '@/components/liquor/LiquorRating/LiquorRating';
import { calcMemberAvgRate, calcMemberRateCount } from '@/lib/liquor/rating';
import type { LiquorRecord } from '@/lib/server/liquors/fetch';
import type { BoardPostRecord } from '@/lib/server/boardPosts/fetch';
import type { TagRecord } from '@/lib/server/tags/fetch';
import type { CategoryBreadcrumbItem } from '@/lib/server/categories/fetch';
import type { ServerUser } from '@/lib/server/auth';
import type { BoardPostInput } from '@/schemas/board';
import { revalidateLiquorsCache } from '@/lib/server/liquors/revalidate';
import { revalidateBoardPostsCache } from '@/lib/server/boardPosts/revalidate';

type Props = {
  initialLiquor: LiquorRecord;
  initialBoardPosts: BoardPostRecord[];
  initialTags: TagRecord[];
  serverUser: ServerUser | null;
  categoryPath: CategoryBreadcrumbItem[];
};

export function LiquorDetailClient({ initialLiquor, initialBoardPosts, initialTags, serverUser, categoryPath }: Props) {
  const router = useRouter();
  const { user, isLogin, isAdmin } = useAuth();

  const [liquor, setLiquor] = useState(initialLiquor);
  const [boardPosts, setBoardPosts] = useState(initialBoardPosts);
  const [tags, setTags] = useState(initialTags);
  const [postFormOpen, setPostFormOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [ratingValue, setRatingValue] = useState(() => {
    if (!serverUser) return 0;
    return [5, 4, 3, 2, 1].find((r) =>
      (initialLiquor[`rate${r}Users` as keyof LiquorRecord] as string[] | null)?.includes(serverUser.id)
    ) ?? 0;
  });
  const [ratingLoading, setRatingLoading] = useState(false);

  const id = liquor.id;

  const handleRate = async (rate: number) => {
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
      const { data } = await client.models.Liquor.update({ id, ...updated });
      if (data) setLiquor(stripLiquorRelations(data));
      await revalidateLiquorsCache();
    } finally {
      setRatingLoading(false);
    }
  };

  const handlePost = async (data: BoardPostInput) => {
    const authMode = user ? 'userPool' : 'apiKey';
    const postData = {
      liquorId: id,
      categoryId: liquor.categoryId,
      categoryName: liquor.categoryName,
      liquorName: liquor.name,
      text: data.text,
      rate: data.rate ?? undefined,
      userId: user?.id,
      userName: user ? user.name : (data.guestName || null),
      userImageBase64: user?.imageBase64,
    };
    const { data: newPost, errors } = await client.models.BoardPost.create(postData, { authMode });
    if (errors?.length) {
      throw new Error(errors[0].message);
    }
    if (newPost) {
      // Amplify の belongsTo リレーションは遅延ロード関数を含むため、シリアライズ可能な形に除外する
      const { liquor: _liquorFn, ...cleanPost } = newPost as BoardPostRecord & { liquor?: unknown };
      const updatedPosts = [...boardPosts, cleanPost as BoardPostRecord];
      setBoardPosts(updatedPosts);
      await updateBoardAvgRate(updatedPosts, authMode);
      await revalidateBoardPostsCache();
    }
    setPostFormOpen(false);
  };

  /** 投稿リストから boardAvgRate・boardRateCount を再計算して Liquor を更新する */
  const updateBoardAvgRate = async (posts: BoardPostRecord[], authMode: 'apiKey' | 'userPool' = 'userPool') => {
    const rated = posts.filter((p) => p.rate != null);
    const boardRateCount = rated.length > 0 ? rated.length : null;
    const boardAvgRate = rated.length > 0
      ? rated.reduce((acc, p) => acc + (p.rate ?? 0), 0) / rated.length
      : null;
    const { data: updated } = await client.models.Liquor.update({ id, boardAvgRate, boardRateCount }, { authMode });
    if (updated) setLiquor(stripLiquorRelations(updated));
    await revalidateLiquorsCache();
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !isLogin) return;
    await client.models.Tag.create({ liquorId: id, text: newTag.trim() });
    const { data: tagList } = await client.models.Tag.list({ filter: { liquorId: { eq: id } } });
    setTags(tagList.map(({ liquor: _liquorFn, ...tag }) => tag as TagRecord));
    setNewTag('');
  };

  const handleDeleteTag = async (tagId: string) => {
    await client.models.Tag.delete({ id: tagId });
    setTags((prev) => prev.filter((t) => t.id !== tagId));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await client.models.Liquor.delete({ id });
      router.push(`/category/${liquor.categoryId}`);
    } finally {
      setDeleting(false);
      setDeleteDialog(false);
    }
  };


  const youtubeEmbedId = liquor.youtube?.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];

  const canEdit = isAdmin || user?.id === liquor.createUserId;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* パンくずリスト */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm">
        <Link href="/" className="text-link hover:underline">ホーム</Link>
        {categoryPath.map((cat) => (
          <span key={cat.id} className="flex items-center gap-1">
            <span className="text-muted-foreground">›</span>
            <Link href={`/discovery/category/${cat.id}`} className="text-link hover:underline">
              {cat.name}
            </Link>
          </span>
        ))}
        <span className="text-muted-foreground">›</span>
        <span className="font-medium text-foreground-secondary">{liquor.name}</span>
      </nav>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* 画像 */}
          <div className="shrink-0">
            {liquor.imageBase64 || liquor.imageUrl ? (
              <img
                src={liquor.imageBase64 ?? liquor.imageUrl ?? ''}
                alt={liquor.name}
                className="h-48 w-48 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-muted text-6xl">🍶</div>
            )}
          </div>

          {/* 詳細 */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{liquor.categoryName}</p>
            <h1 className="mt-1 text-2xl font-bold text-foreground">{liquor.name}</h1>

            <div className="mt-2">
              <LiquorRating
                memberAvgRate={calcMemberAvgRate(liquor)}
                memberRateCount={calcMemberRateCount(liquor)}
                allAvgRate={liquor.boardAvgRate}
                allRateCount={liquor.boardRateCount}
              />
            </div>

            {liquor.description && (
              <p className="mt-4 whitespace-pre-wrap text-foreground-secondary">{liquor.description}</p>
            )}

            {/* タグ */}
            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Link key={t.id} href={`/discovery/tag/${encodeURIComponent(t.text)}`}>
                    <Tag
                      label={t.text}
                      onDelete={isLogin ? () => handleDeleteTag(t.id) : undefined}
                    />
                  </Link>
                ))}
              </div>
            )}

            {/* タグ追加 */}
            {isLogin && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="タグを追加..."
                  className="rounded-md border border-border-input bg-surface px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                />
                <Button size="sm" variant="secondary" onClick={handleAddTag}>追加</Button>
              </div>
            )}

            {/* 評価 */}
            {isLogin && (
              <div className="mt-4">
                <p className="mb-1 text-sm font-medium text-foreground-secondary">あなたの評価</p>
                <StarRating
                  value={ratingValue}
                  onChange={ratingLoading ? undefined : handleRate}
                />
              </div>
            )}

            {/* アクション */}
            {(canEdit || isAdmin) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {canEdit && (
                  <Button variant="secondary" size="sm" onClick={() => router.push(`/liquor/edit/${id}`)}>
                    編集
                  </Button>
                )}
                {isAdmin && (
                  <Button variant="danger" size="sm" onClick={() => setDeleteDialog(true)}>
                    削除
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* YouTube */}
        {youtubeEmbedId && (
          <div className="mt-6">
            <iframe
              className="aspect-video w-full rounded-lg"
              src={`https://www.youtube.com/embed/${youtubeEmbedId}`}
              allowFullScreen
              title={liquor.name}
            />
          </div>
        )}
      </div>

      {/* 投稿モーダル */}
      <Dialog open={postFormOpen} onClose={() => setPostFormOpen(false)} title="投稿する">
        <BoardPostForm onSubmit={handlePost} isLoggedIn={isLogin} />
      </Dialog>

      {/* ボード（レビュー） */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">みんなの投稿 ({boardPosts.length})</h2>
          <Button size="sm" onClick={() => setPostFormOpen(true)}>投稿する</Button>
        </div>

        <div className="flex flex-col gap-4">
          {boardPosts.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">まだ投稿がありません。最初の投稿をしてみましょう！</p>
          ) : (
            [...boardPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((post) => (
              <div key={post.id} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  {post.userImageBase64 ? (
                    <img src={post.userImageBase64} alt={post.userName ?? '匿名'} className="h-9 w-9 rounded-full object-cover" />
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
            ))
          )}
        </div>
      </section>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="お酒を削除"
        message={`「${liquor.name}」を削除してもよろしいですか？この操作は取り消せません。`}
        confirmLabel="削除する"
        loading={deleting}
      />
    </div>
  );
}

/** Amplify client の update/get 結果に含まれる遅延ロード関数（リレーション）を除去する */
function stripLiquorRelations(data: LiquorRecord & Record<string, unknown>): LiquorRecord {
  const { category: _cat, boardPosts: _bp, tags: _tags, flavorVotes: _fv, bookmarks: _bm, liquorHistories: _lh, ...rest } = data;
  return rest as LiquorRecord;
}
