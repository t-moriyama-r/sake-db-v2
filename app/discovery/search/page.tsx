'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { client } from '@/lib/amplify-client';
import type { Schema } from '@/amplify/data/resource';
import { LiquorCard } from '@/components/cards/LiquorCard';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Sidebar } from '@/components/layout/Sidebar';

type Liquor = Schema['Liquor']['type'];

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto flex max-w-7xl gap-6 px-4 py-8"><Sidebar /><div className="flex-1 min-w-0 flex justify-center py-16"><Spinner size="lg" /></div></div>}>
      <SearchContent />
    </Suspense>
  );
}

const SearchContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Liquor[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    router.replace(`/discovery/search?q=${encodeURIComponent(query)}`);
    setLoading(true);
    setSearched(false);

    try {
      // DynamoDB での全文検索（contains フィルタ）
      // Lambda の searchLiquors 実装後は client.queries.searchLiquors を使用
      const { data } = await client.models.Liquor.list({
        filter: {
          or: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        },
        limit: 50,
      });
      setResults(data);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // 初回ロード時に q パラメータがあれば検索
  useState(() => {
    if (initialQuery) handleSearch();
  });

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">お酒を検索</h1>

        <form onSubmit={handleSearch} className="mb-8 flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="お酒の名前・説明で検索..."
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Button type="submit" loading={loading}>検索</Button>
        </form>

        {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

        {searched && !loading && (
          <>
            <p className="mb-4 text-sm text-gray-500">{results.length} 件見つかりました</p>
            {results.length === 0 ? (
              <p className="py-16 text-center text-gray-500">「{query}」に一致するお酒が見つかりませんでした</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {results.map((liquor) => (
                  <LiquorCard key={liquor.id} liquor={liquor} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
