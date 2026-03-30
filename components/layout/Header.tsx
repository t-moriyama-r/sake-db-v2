'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export const Header = () => {
  const { user, isLogin, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = keyword.trim();
    if (!q) return;
    router.push(`/discovery/search?q=${encodeURIComponent(q)}`);
    inputRef.current?.blur();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex h-10 max-w-7xl items-center gap-2 px-4">
        <Link href="/" className="shrink-0 text-lg font-bold text-blue-700 hover:text-blue-800">
          🍶 sake-db
        </Link>

        <form onSubmit={handleSearch} className="flex flex-1 min-w-0 items-center px-2 sm:px-4 max-w-xl">
          <div className="flex w-full rounded border border-gray-300 bg-white focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="キーワードで検索..."
              className="flex-1 min-w-0 px-3 py-1 text-sm bg-transparent outline-none"
            />
            <button
              type="submit"
              className="shrink-0 px-3 py-1 text-gray-500 hover:text-blue-600"
              aria-label="検索"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>
          </div>
        </form>

        <div className="shrink-0 relative">
          {isLogin ? (
            <button
              className="flex items-center gap-2 rounded-full"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {user?.imageBase64 ? (
                <img src={user.imageBase64} className="h-8 w-8 rounded-full object-cover" alt={user.name} />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                  {user?.name?.[0] ?? '?'}
                </span>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth/login'}>
                ログイン
              </Button>
              <Button size="sm" onClick={() => window.location.href = '/auth/register'}>
                新規登録
              </Button>
            </div>
          )}

          {menuOpen && isLogin && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-white py-1 shadow-lg">
              <div className="border-b px-4 py-2 text-sm font-medium text-gray-900">{user?.name}</div>
              <Link href="/mypage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                マイページ
              </Link>
              <Link href="/mypage/edit" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                プロフィール編集
              </Link>
              {isAdmin && (
                <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                  管理画面
                </Link>
              )}
              <button
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                onClick={() => { logout(); setMenuOpen(false); }}
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
