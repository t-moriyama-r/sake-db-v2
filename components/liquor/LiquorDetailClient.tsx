'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/amplify-client';
import { useAuth } from '@/hooks/useAuth';
import { StarRating } from '@/components/ui/StarRating';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { BoardPostForm } from '@/components/liquor/BoardPostForm';
import type { LiquorRecord, BoardPostRecord, TagRecord } from '@/lib/server/liquors';
import type { ServerUser } from '@/lib/server/auth';
import type { BoardPostInput } from '@/schemas/board';

const calcAvgRate = (liquor: LiquorRecord): number => {
  const total =
    (liquor.rate5Users?.length ?? 0) * 5 +
    (liquor.rate4Users?.length ?? 0) * 4 +
    (liquor.rate3Users?.length ?? 0) * 3 +
    (liquor.rate2Users?.length ?? 0) * 2 +
    (liquor.rate1Users?.length ?? 0) * 1;
  const count =
    (liquor.rate5Users?.length ?? 0) +
    (liquor.rate4Users?.length ?? 0) +
    (liquor.rate3Users?.length ?? 0) +
    (liquor.rate2Users?.length ?? 0) +
    (liquor.rate1Users?.length ?? 0);
  return count === 0 ? 0 : Math.round(total / count);
};

type Props = {
  initialLiquor: LiquorRecord;
  initialBoardPosts: BoardPostRecord[];
  initialTags: TagRecord[];
  serverUser: ServerUser | null;
};

export function LiquorDetailClient({ initialLiquor, initialBoardPosts, initialTags, serverUser }: Props) {
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
      if (data) setLiquor(data as LiquorRecord);
    } finally {
      setRatingLoading(false);
    }
  };

  const handlePost = async (data: BoardPostInput) => {
    await client.models.BoardPost.create({
      liquorId: id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categoryId: parseInt(liquor.categoryId) as any,
      categoryName: liquor.categoryName,
      liquorName: liquor.name,
      text: data.text,
      rate: data.rate ?? undefined,
      youtube: data.youtube ?? undefined,
      userId: user?.id,
      userName: user?.name,
      userImageBase64: user?.imageBase64,
    });
    const { data: posts } = await client.models.BoardPost.list({ filter: { liquorId: { eq: id } } });
    setBoardPosts(posts as BoardPostRecord[]);
    setPostFormOpen(false);
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !isLogin) return;
    await client.models.Tag.create({ liquorId: id, text: newTag.trim() });
    const { data: tagList } = await client.models.Tag.list({ filter: { liquorId: { eq: id } } });
    setTags(tagList as TagRecord[]);
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

  const avg = calcAvgRate(liquor);
  const ratingCount =
    (liquor.rate5Users?.length ?? 0) +
    (liquor.rate4Users?.length ?? 0) +
    (liquor.rate3Users?.length ?? 0) +
    (liquor.rate2Users?.length ?? 0) +
    (liquor.rate1Users?.length ?? 0);

  const youtubeEmbedId = liquor.youtube?.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];

  const canEdit = isAdmin || user?.id === liquor.createUserId;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* パンくずリスト */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">ホーム</Link>
        <span>›</span>
        <Link href={`/discovery/category/${liquor.categoryId}`} className="hover:text-blue-600">
          {liquor.categoryName}
        </Link>
        <span>›</span>
        <span className="text-gray-900">{liquor.name}</span>
      </nav>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
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
              <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-gray-100 text-6xl">🍶</div>
            )}
          </div>

          {/* 詳細 */}
          <div className="flex-1">
            <p className="text-sm text-gray-500">{liquor.categoryName}</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">{liquor.name}</h1>

            {avg > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <StarRating value={avg} readonly />
                <span className="text-sm text-gray-500">({ratingCount}件)</span>
              </div>
            )}

            {liquor.description && (
              <p className="mt-4 whitespace-pre-wrap text-gray-600">{liquor.description}</p>
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
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                />
                <Button size="sm" variant="secondary" onClick={handleAddTag}>追加</Button>
              </div>
            )}

            {/* 評価 */}
            {isLogin && (
              <div className="mt-4">
                <p className="mb-1 text-sm font-medium text-gray-700">あなたの評価</p>
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

      {/* ボード（レビュー） */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">みんなの投稿 ({boardPosts.length})</h2>
          {isLogin && (
            <Button size="sm" onClick={() => setPostFormOpen((v) => !v)}>
              {postFormOpen ? '閉じる' : '投稿する'}
            </Button>
          )}
        </div>

        {postFormOpen && (
          <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
            <BoardPostForm onSubmit={handlePost} />
          </div>
        )}

        <div className="flex flex-col gap-4">
          {boardPosts.length === 0 ? (
            <p className="py-8 text-center text-gray-500">まだ投稿がありません。最初の投稿をしてみましょう！</p>
          ) : (
            boardPosts.map((post) => {
              const embedId = post.youtube?.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];
              return (
                <div key={post.id} className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    {post.userImageBase64 ? (
                      <img src={post.userImageBase64} alt={post.userName ?? '匿名'} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-500">
                        {post.userName?.[0] ?? '?'}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {post.userId ? (
                          <Link href={`/user/${post.userId}`} className="text-sm font-medium text-gray-800 hover:text-blue-600">
                            {post.userName}
                          </Link>
                        ) : (
                          <span className="text-sm font-medium text-gray-500">匿名</span>
                        )}
                        {post.rate && <StarRating value={post.rate} readonly size="sm" />}
                      </div>
                      <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{post.text}</p>
                      {embedId && (
                        <iframe
                          className="mt-2 aspect-video w-full max-w-sm rounded"
                          src={`https://www.youtube.com/embed/${embedId}`}
                          allowFullScreen
                          title="投稿動画"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
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
