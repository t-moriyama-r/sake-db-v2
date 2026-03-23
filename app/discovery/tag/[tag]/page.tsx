'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { client } from '@/lib/amplify-client';
import type { Schema } from '@/amplify/data/resource';
import { LiquorCard } from '@/components/cards/LiquorCard';
import { Spinner } from '@/components/ui/Spinner';
import { Sidebar } from '@/components/layout/Sidebar';

type Liquor = Schema['Liquor']['type'];
type Tag = Schema['Tag']['type'];

export default function TagSearchPage() {
  const { tag } = useParams<{ tag: string }>();
  const decodedTag = decodeURIComponent(tag);

  const [liquors, setLiquors] = useState<Liquor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // タグを持つ Liquor ID を取得してから詳細を取得
        const { data: tags } = await client.models.Tag.list({
          filter: { text: { eq: decodedTag } },
        });

        const uniqueLiquorIds = [...new Set(tags.map((t: Tag) => t.liquorId))];

        const liquorResults = await Promise.all(
          uniqueLiquorIds.map((id) => client.models.Liquor.get({ id }))
        );
        setLiquors(liquorResults.map((r) => r.data).filter(Boolean) as Liquor[]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [decodedTag]);

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <p className="text-sm text-gray-500">タグ検索</p>
          <h1 className="text-2xl font-bold text-gray-900">#{decodedTag}</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : liquors.length === 0 ? (
          <p className="py-16 text-center text-gray-500">#{decodedTag} のタグを持つお酒が見つかりませんでした</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">{liquors.length} 件</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {liquors.map((liquor) => (
                <LiquorCard key={liquor.id} liquor={liquor} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
