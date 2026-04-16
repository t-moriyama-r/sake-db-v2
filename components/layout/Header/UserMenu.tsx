'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import type { AppUser } from '@/hooks/useAuth';

type UserMenuProps = {
  user: AppUser | null;
  isLogin: boolean;
  isAdmin: boolean;
  logout: () => void;
};

export const UserMenu = ({ user, isLogin, isAdmin, logout }: UserMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
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
  );
};
