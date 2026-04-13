'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Schema } from '@/amplify/data/resource';
import { LiquorCard } from '@/components/cards/LiquorCard/LiquorCard';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { Button } from '@/components/ui/Button/Button';

type Liquor = Schema['Liquor']['type'];

export const SearchContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Liquor[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    router.replace(`/discovery/search?q=${encodeURIComponent(query)}`);
    setLoading(true);
    setSearched(false);
    setSearchError(null);

    try {
      const res = await fetch(`/api/search?keyword=${encodeURIComponent(query)}&limit=50`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = (data as { error?: string }).error ?? '検索リクエストが失敗しました';
        setSearchError(message);
        setResults([]);
        return;
      }
      const liquors = await res.json() as Liquor[];
      setResults(liquors);
    } catch (err) {
      console.error('[search] exception:', err);
      setSearchError('検索中にエラーが発生しました');
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // 初回ロード時に q パラメータがあれば検索
  useEffect(() => {
    if (initialQuery) handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <h1 className="mb-6 text-2xl font-bold text-foreground">お酒を検索</h1>

      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="お酒の名前・説明で検索..."
          className="flex-1 rounded-md border border-border-input bg-surface px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <Button type="submit" loading={loading}>検索</Button>
      </form>

      {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

      {searchError && !loading && (
        <p className="py-4 text-sm text-red-500">{searchError}</p>
      )}

      {searched && !loading && !searchError && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">{results.length} 件見つかりました</p>
          {results.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">「{query}」に一致するお酒が見つかりませんでした</p>
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
  );
};
