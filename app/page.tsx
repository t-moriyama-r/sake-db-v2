'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/amplify-client';
import type { Schema } from '@/amplify/data/resource';
import { LiquorCard } from '@/components/cards/LiquorCard';
import { Spinner } from '@/components/ui/Spinner';
import { Sidebar } from '@/components/layout/Sidebar';

type Liquor = Schema['Liquor']['type'];

export default function HomePage() {
  const [liquors, setLiquors] = useState<Liquor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ランダムおすすめリスト（Lambda 実装前は全件取得してシャッフル）
    client.models.Liquor.list({ limit: 20 })
      .then(({ data }) => {
        const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 12);
        setLiquors(shuffled);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <section>
          <h1 className="mb-6 text-2xl font-bold text-gray-900">おすすめのお酒</h1>
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : liquors.length === 0 ? (
            <p className="py-16 text-center text-gray-500">まだお酒が登録されていません</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {liquors.map((liquor) => (
                <LiquorCard key={liquor.id} liquor={liquor} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
