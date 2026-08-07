'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LiquorCard } from '@/components/pages/liquor/LiquorCard/LiquorCard';
import { Button } from '@/components/ui/Button/Button';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { routes } from '@/lib/routes';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';

export const SearchContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState<string>(initialQuery);
  const [results, setResults] = useState<SerializableLiquorRecord[]>([]);
  const [searched, setSearched] = useState<boolean>(false);
  const [loading, startTransition] = useTransition();
  const [searchError, setSearchError] = useState<string | null>(null);

  const runSearch = useCallback(
    (keyword: string) => {
      setSearched(false);
      setSearchError(null);

      startTransition(async () => {
        try {
          const res = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}&limit=50`);
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            const message = (data as { error?: string }).error ?? '検索リクエストが失敗しました';
            setSearchError(message);
            setResults([]);
            return;
          }
          const liquors = (await res.json()) as SerializableLiquorRecord[];
          setResults(liquors);
        } catch (err: unknown) {
          console.error('[search] 例外:', err);
          setSearchError('検索中にエラーが発生しました');
          setResults([]);
        } finally {
          setSearched(true);
        }
      });
    },
    [startTransition],
  );

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    router.replace(routes.discovery.searchWithQuery(query));
    runSearch(query);
  };

  // 初回ロード時に q パラメータがあれば 1 回だけ検索する
  // （手動検索後の router.replace で q が変わっても再検索しないよう ref でガード）
  const initialSearchDone = useRef(false);
  useEffect(() => {
    if (initialSearchDone.current) return;
    initialSearchDone.current = true;
    if (initialQuery) runSearch(initialQuery);
  }, [initialQuery, runSearch]);

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <h1 className="mb-6 text-2xl font-bold text-foreground">お酒を検索</h1>

      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="お酒の名前で検索..."
          className="flex-1 rounded-md border border-border-input bg-surface px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <Button type="submit" loading={loading}>
          検索
        </Button>
      </form>

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {searchError && !loading && <p className="py-4 text-sm text-red-500">{searchError}</p>}

      {searched && !loading && !searchError && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">{results.length} 件見つかりました</p>
          {results.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">
              「{query}」に一致するお酒が見つかりませんでした
            </p>
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
