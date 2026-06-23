'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Schema } from '@/amplify/data/resource';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { StarRating } from '@/components/ui/StarRating/StarRating';
import { ToastContainer } from '@/components/ui/Toast/Toast';
import { useToast } from '@/hooks/useToast';
import { client } from '@/lib/amplify-client';
import { fetchAll } from '@/lib/client/amplify-list';
import { routes } from '@/lib/routes';
import type { SerializableBoardPostRecord } from '@/lib/server/boardPosts/fetch';

type UserActivity = {
  post: SerializableBoardPostRecord;
  liquorName: string;
  liquorId: string;
};

export function UserProfileView() {
  const { id } = useParams<{ id: string }>();

  const { toasts, addToast, removeToast } = useToast();

  const [posts, setPosts] = useState<UserActivity[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const userPosts = await fetchAll<Schema['BoardPost']['type']>((nextToken, limit) =>
          client.models.BoardPost.list({
            filter: { userId: { eq: id } },
            limit,
            nextToken: nextToken ?? undefined,
          }),
        );

        if (userPosts.length > 0) {
          setUserName(userPosts[0].userName ?? '');
        }

        const activities: UserActivity[] = (JSON.parse(JSON.stringify(userPosts)) as SerializableBoardPostRecord[]).map((p) => ({
          post: p,
          liquorName: p.liquorName,
          liquorId: p.liquorId,
        }));

        activities.sort((a, b) =>
          new Date(b.post.updatedAt ?? 0).getTime() - new Date(a.post.updatedAt ?? 0).getTime()
        );

        setPosts(activities);
      } catch (e: unknown) {
        console.error('ユーザー投稿の取得に失敗しました:', e instanceof Error ? e.message : String(e));
        addToast('データの読み込みに失敗しました', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, addToast]);

  if (loading) {
    return (
      <>
        <div className="flex justify-center py-32"><Spinner size="lg" /></div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  const ratedPosts = {
    5: posts.filter((p) => p.post.rate === 5),
    4: posts.filter((p) => p.post.rate === 4),
    3: posts.filter((p) => p.post.rate === 3),
    2: posts.filter((p) => p.post.rate === 2),
    1: posts.filter((p) => p.post.rate === 1),
    noRate: posts.filter((p) => !p.post.rate),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-avatar-bg text-xl font-bold text-avatar-fg">
            {userName[0] ?? '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{userName || 'ユーザー'}</h1>
            <p className="text-sm text-muted-foreground">{posts.length} 件の投稿</p>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">最近の投稿</h2>
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">投稿がありません</p>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.slice(0, 10).map(({ post, liquorName, liquorId }) => (
              <div key={post.id} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                <Link href={routes.liquor.detail(liquorId)} className="font-medium text-link hover:underline">
                  {liquorName}
                </Link>
                <div className="mt-1 flex items-center gap-2">
                  {post.rate && <StarRating value={post.rate} readonly size="sm" />}
                  <span className="text-xs text-muted-foreground">
                    {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString('ja-JP') : ''}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground-secondary line-clamp-2">{post.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {([5, 4, 3, 2, 1] as const).map((r) => {
        const rated = ratedPosts[r];
        if (rated.length === 0) return null;
        return (
          <section key={r} className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <StarRating value={r} readonly size="sm" />
              <span className="text-sm font-medium text-foreground-secondary">({rated.length}件)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {rated.map(({ post, liquorName, liquorId }) => (
                <Link
                  key={post.id}
                  href={routes.liquor.detail(liquorId)}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-foreground-secondary hover:border-primary hover:text-primary shadow-sm"
                >
                  {liquorName}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

