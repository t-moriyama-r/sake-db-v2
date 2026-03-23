'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { client } from '@/lib/amplify-client';
import type { Schema } from '@/amplify/data/resource';
import { StarRating } from '@/components/ui/StarRating';
import { Spinner } from '@/components/ui/Spinner';

type BoardPost = Schema['BoardPost']['type'];

type UserActivity = {
  post: BoardPost;
  liquorName: string;
  liquorId: string;
};

export const UserProfilePage = () => {
  const { id } = useParams<{ id: string }>();

  const [posts, setPosts] = useState<UserActivity[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // このユーザーの投稿一覧を取得
        const { data: userPosts } = await client.models.BoardPost.list({
          filter: { userId: { eq: id } },
        });

        if (userPosts.length > 0) {
          setUserName(userPosts[0].userName ?? '');
        }

        const activities: UserActivity[] = userPosts.map((p) => ({
          post: p,
          liquorName: p.liquorName,
          liquorId: p.liquorId,
        }));

        // 最新順にソート
        activities.sort((a, b) =>
          new Date(b.post.updatedAt ?? 0).getTime() - new Date(a.post.updatedAt ?? 0).getTime()
        );

        setPosts(activities);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  // 評価別に分類
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
      <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
            {userName[0] ?? '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{userName || 'ユーザー'}</h1>
            <p className="text-sm text-gray-500">{posts.length} 件の投稿</p>
          </div>
        </div>
      </div>

      {/* 最近の投稿 */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">最近の投稿</h2>
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">投稿がありません</p>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.slice(0, 10).map(({ post, liquorName, liquorId }) => (
              <div key={post.id} className="rounded-xl border bg-white p-4 shadow-sm">
                <Link href={`/liquor/${liquorId}`} className="font-medium text-blue-600 hover:underline">
                  {liquorName}
                </Link>
                <div className="mt-1 flex items-center gap-2">
                  {post.rate && <StarRating value={post.rate} readonly size="sm" />}
                  <span className="text-xs text-gray-500">
                    {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString('ja-JP') : ''}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-700 line-clamp-2">{post.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 評価別リスト */}
      {([5, 4, 3, 2, 1] as const).map((r) => {
        const rated = ratedPosts[r];
        if (rated.length === 0) return null;
        return (
          <section key={r} className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <StarRating value={r} readonly size="sm" />
              <span className="text-sm font-medium text-gray-700">({rated.length}件)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {rated.map(({ post, liquorName, liquorId }) => (
                <Link
                  key={post.id}
                  href={`/liquor/${liquorId}`}
                  className="rounded-full border bg-white px-3 py-1 text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 shadow-sm"
                >
                  {liquorName}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
