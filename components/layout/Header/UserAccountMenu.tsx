'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { AppUser } from '@/hooks/useAuth';
import { routes } from '@/lib/routes';

type Props = {
  user: AppUser | null;
  isAdmin: boolean;
  logoutAction: () => void;
};

export const UserAccountMenu = ({ user, isAdmin, logoutAction }: Props) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-1.5 rounded px-2 py-1 hover:bg-muted transition-colors cursor-pointer"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="アカウントメニューを開く"
        aria-expanded={menuOpen}
      >
        {user?.imageBase64 ? (
          <Image src={user.imageBase64} width={32} height={32} className="h-8 w-8 rounded-full object-cover" alt={user.name ?? ''} />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-avatar-bg text-sm font-medium text-avatar-fg">
            {user?.name?.[0] ?? '?'}
          </span>
        )}
        <span className="hidden sm:inline max-w-[8rem] truncate text-sm font-medium text-foreground">
          {user?.name}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-3 w-3 text-muted-foreground transition-transform ${menuOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-surface py-1 shadow-lg">
          <div className="border-b border-border px-4 py-2 text-sm font-medium text-foreground">{user?.name}</div>
          <Link href={routes.mypage.index()} className="block px-4 py-2 text-sm text-foreground-secondary hover:bg-muted" onClick={() => setMenuOpen(false)}>
            マイページ
          </Link>
          <Link href={routes.mypage.edit()} className="block px-4 py-2 text-sm text-foreground-secondary hover:bg-muted" onClick={() => setMenuOpen(false)}>
            プロフィール編集
          </Link>
          {isAdmin && (
            <Link href={routes.admin()} className="block px-4 py-2 text-sm text-foreground-secondary hover:bg-muted" onClick={() => setMenuOpen(false)}>
              管理画面
            </Link>
          )}
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted"
            onClick={() => { logoutAction(); setMenuOpen(false); }}
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
};


