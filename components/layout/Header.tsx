'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

export default function Header() {
  const { user, isLogin, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-blue-700 hover:text-blue-800">
          🍶 sake-db
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          <Link href="/discovery/category" className="text-sm text-gray-600 hover:text-blue-600">
            カテゴリから探す
          </Link>
          <Link href="/discovery/search" className="text-sm text-gray-600 hover:text-blue-600">
            検索
          </Link>
          {isLogin && (
            <Link href="/mypage" className="text-sm text-gray-600 hover:text-blue-600">
              マイページ
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="text-sm text-gray-600 hover:text-blue-600">
              管理
            </Link>
          )}
        </nav>

        <div className="relative">
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
