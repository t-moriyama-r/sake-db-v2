'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMobileSidebar } from '@/components/layout/Sidebar/MobileSidebarContext';
import { client } from '@/lib/amplify-client';
import { MobileSidebarButton } from './MobileSidebarButton';
import { HeaderSearchForm } from './HeaderSearchForm';
import { PostButton } from './PostButton';
import { UserMenu } from './UserMenu';

export const Header = () => {
  const { user, isLogin, isAdmin, logout } = useAuth();
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const pathname = usePathname();
  const { open: openSidebar } = useMobileSidebar();

  useEffect(() => {
    const categoryMatch = pathname.match(/\/(?:discovery\/)?category\/([^/]+)/);
    if (categoryMatch) {
      setCurrentCategoryId(categoryMatch[1]);
      return;
    }

    const liquorMatch = pathname.match(/^\/liquor\/([^/]+)$/);
    if (liquorMatch) {
      client.models.Liquor.get({ id: liquorMatch[1] }, { authMode: 'identityPool' })
        .then(({ data }) => setCurrentCategoryId(data?.categoryId ?? null));
      return;
    }

    setCurrentCategoryId(null);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex h-10 max-w-7xl items-center gap-2 px-4">
        <MobileSidebarButton onClick={openSidebar} />
        <Link href="/" className="shrink-0 text-lg font-bold text-primary hover:text-primary-hover">
          🍶 sake-db
        </Link>
        <HeaderSearchForm />
        <PostButton categoryId={currentCategoryId} />
        <UserMenu user={user} isLogin={isLogin} isAdmin={isAdmin} logout={logout} />
      </div>
    </header>
  );
};
