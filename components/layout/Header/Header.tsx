'use client';

import { useMobileSidebar } from '@/components/layout/Sidebar/MobileSidebarContext';
import { useCurrentCategoryId } from '@/hooks/useCurrentCategoryId';
import { HeaderSearchForm } from './HeaderSearchForm';
import { HeaderTitle } from './HeaderTitle';
import { HeaderUserMenu } from './HeaderUserMenu';
import { MobileSidebarButton } from './MobileSidebarButton';
import { PostButton } from './PostButton';

export const Header = () => {
  const { open: openSidebar } = useMobileSidebar();
  const currentCategoryId = useCurrentCategoryId();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-sm shadow-sm" style={{ paddingRight: 'var(--scrollbar-width, 0px)' }}>
      <div className="mx-auto flex h-10 max-w-7xl items-center gap-2 px-4">
        <div className="lg:hidden shrink-0"><MobileSidebarButton onClick={openSidebar} /></div>
        <HeaderTitle />
        <div className="flex-1 min-w-0 max-w-xl px-2 sm:px-4"><HeaderSearchForm /></div>
        <div className="shrink-0"><PostButton categoryId={currentCategoryId} /></div>
        <div className="ml-auto shrink-0"><HeaderUserMenu /></div>
      </div>
    </header>
  );
};
