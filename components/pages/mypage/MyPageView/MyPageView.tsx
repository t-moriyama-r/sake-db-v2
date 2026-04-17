'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Schema } from '@/amplify/data/resource';
import { LiquorCard } from '@/components/pages/liquor/LiquorCard/LiquorCard';
import { Button } from '@/components/ui/Button/Button';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/amplify-client';
import { routes } from '@/lib/routes';

type BookMark = Schema['BookMark']['type'];
type Liquor = Schema['Liquor']['type'];

export function MyPageView() {
  const router = useRouter();
  const { user, isLogin, isLoading } = useAuth();

  const [bookmarks, setBookmarks] = useState<Liquor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLogin) { router.replace('/auth/login'); return; }
    if (!isLogin) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data: bms } = await client.models.BookMark.list();
        const liquorResults = await Promise.all(
          bms.map((bm: BookMark) => client.models.Liquor.get({ id: bm.liquorId }))
        );
        setBookmarks(liquorResults.map((r) => r.data).filter(Boolean) as Liquor[]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLogin, isLoading, router]);

  if (isLoading || loading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-start gap-4">
        {user?.imageBase64 ? (
          <img src={user.imageBase64} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-avatar-bg text-2xl font-bold text-avatar-fg">
            {user?.name?.[0] ?? '?'}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          {user?.profile && <p className="mt-2 text-foreground-secondary">{user.profile}</p>}
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => router.push(routes.mypage.edit())}>
            プロフィールを編集
          </Button>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">ブックマーク ({bookmarks.length}件)</h2>
        {bookmarks.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">ブックマークはまだありません</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {bookmarks.map((liquor) => (
              <LiquorCard key={liquor.id} liquor={liquor} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

