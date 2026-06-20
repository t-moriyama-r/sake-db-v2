'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { routes } from '@/lib/routes';

export const HeaderSearchForm = () => {
  const [keyword, setKeyword] = useState<string>('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = keyword.trim();
    if (!q) return;
    router.push(`${routes.discovery.search()}?q=${encodeURIComponent(q)}`);
    inputRef.current?.blur();
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full items-center">
      <div className="flex w-full rounded border border-border-input bg-surface focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
        <input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="キーワードで検索..."
          className="flex-1 min-w-0 px-3 py-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
        />
        <button
          type="submit"
          className="shrink-0 px-3 py-1 text-muted-foreground hover:text-primary"
          aria-label="検索"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
};
