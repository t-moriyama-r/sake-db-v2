'use client';

import type { CategoryTreeNode } from '@/lib/server/categories/fetch';
import { CategoryTreeContent } from './CategoryTree';
import { useMobileSidebar } from './MobileSidebarContext';

type Props = {
  categoryTree: CategoryTreeNode[];
  activeCategoryId: string | null;
};

export function MobileSidebarDrawer({ categoryTree, activeCategoryId }: Props) {
  const { isOpen, close } = useMobileSidebar();

  return (
    <div className="lg:hidden">
      {/* 背景オーバーレイ */}
      {isOpen && (
        <button
          type="button"
          onClick={close}
          aria-label="閉じる"
          className="fixed inset-0 z-40 bg-black/40 cursor-default"
        />
      )}

      {/* ドロワー本体 */}
      <div
        className={`fixed left-0 top-0 z-50 h-screen w-64 overflow-y-auto bg-background shadow-lg transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* ドロワーヘッダー */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-foreground">カテゴリ</span>
          <button
            type="button"
            onClick={close}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            aria-label="カテゴリメニューを閉じる"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ツリーコンテンツ */}
        <div className="p-3">
          <CategoryTreeContent
            categoryTree={categoryTree}
            activeCategoryId={activeCategoryId}
          />
        </div>
      </div>
    </div>
  );
}
