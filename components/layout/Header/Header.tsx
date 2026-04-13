'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button/Button';
import { useMobileSidebar } from '@/components/layout/Sidebar/MobileSidebarContext';

export const Header = () => {
  const { user, isLogin, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { open: openSidebar } = useMobileSidebar();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = keyword.trim();
    if (!q) return;
    router.push(`/discovery/search?q=${encodeURIComponent(q)}`);
    inputRef.current?.blur();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex h-10 max-w-7xl items-center gap-2 px-4">
        <button
          type="button"
          onClick={openSidebar}
          className="lg:hidden shrink-0 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="カテゴリメニューを開く"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Link href="/" className="shrink-0 text-lg font-bold text-primary hover:text-primary-hover">
          🍶 sake-db
        </Link>

        <form onSubmit={handleSearch} className="flex flex-1 min-w-0 items-center px-2 sm:px-4 max-w-xl">
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
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-avatar-bg text-sm font-medium text-avatar-fg">
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
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-surface py-1 shadow-lg">
              <div className="border-b border-border px-4 py-2 text-sm font-medium text-foreground">{user?.name}</div>
              <Link href="/mypage" className="block px-4 py-2 text-sm text-foreground-secondary hover:bg-muted" onClick={() => setMenuOpen(false)}>
                マイページ
              </Link>
              <Link href="/mypage/edit" className="block px-4 py-2 text-sm text-foreground-secondary hover:bg-muted" onClick={() => setMenuOpen(false)}>
                プロフィール編集
              </Link>
              {isAdmin && (
                <Link href="/admin" className="block px-4 py-2 text-sm text-foreground-secondary hover:bg-muted" onClick={() => setMenuOpen(false)}>
                  管理画面
                </Link>
              )}
              <button
                className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted"
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
