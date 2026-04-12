'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { client } from '@/lib/amplify-client';
import type { CategoryTreeNode } from '@/lib/server/categories';

type CategoryTreeProps = {
  categoryTree: CategoryTreeNode[];
  /** サーバー側で解決したアクティブカテゴリID（直アクセス時の初期値として使用）。 */
  activeCategoryId?: string | null;
};

/** ルートから targetId までの ID パス（自身含む）を返す。見つからなければ null。 */
function findPath(
  targetId: string,
  nodes: CategoryTreeNode[],
  ancestors: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) return [...ancestors, node.id];
    const found = findPath(targetId, node.children, [...ancestors, node.id]);
    if (found !== null) return found;
  }
  return null;
}

export const CategoryTree = ({ categoryTree, activeCategoryId: propActiveCategoryId }: CategoryTreeProps) => {
  const pathname = usePathname();

  const categoryMatch = pathname.match(/\/discovery\/category\/([^/]+)/);
  const urlCategoryId = categoryMatch?.[1] ?? null;

  const liquorMatch = pathname.match(/^\/liquor\/([^/]+)$/);
  const liquorId = liquorMatch?.[1] ?? null;

  // フェッチ完了まで前の値を保持し続けることで、ページ遷移中のフラッシュを防ぐ。
  // 直アクセス時はサーバーから渡された propActiveCategoryId を初期値として使用する。
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    propActiveCategoryId ?? null,
  );

  useEffect(() => {
    let cancelled = false;

    if (urlCategoryId !== null) {
      // カテゴリページ: URL から即時反映
      setActiveCategoryId(urlCategoryId);
    } else if (liquorId) {
      // お酒ページ: フェッチ完了まで現在の値（前のページのカテゴリ）を保持し、完了後に更新
      client.models.Liquor.get({ id: liquorId }, { authMode: 'identityPool' }).then(({ data }) => {
        if (!cancelled) setActiveCategoryId(data?.categoryId ?? null);
      });
    } else {
      // その他のページ: アクティブなし
      setActiveCategoryId(null);
    }

    return () => {
      cancelled = true;
    };
  }, [urlCategoryId, liquorId]);

  const pathIds = activeCategoryId ? (findPath(activeCategoryId, categoryTree) ?? []) : [];
  // 祖先 ID セット（アクティブ自身を除く）
  const ancestorIds = new Set(pathIds.slice(0, -1));
  // アクティブカテゴリの直接の親
  const directParentId = pathIds.length >= 2 ? pathIds[pathIds.length - 2] : null;
  // パス全体のセット（子フィルタリング用）
  const pathIdSet = new Set(pathIds);

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="rounded-lg border border-border bg-surface p-4">
        <Link href="/" className="mb-3 block text-sm font-semibold text-foreground hover:text-primary hover:underline">
          カテゴリ
        </Link>
        <ul className="space-y-0.5">
          {categoryTree.map((node) => (
            <CategoryTreeItem
              key={node.id}
              node={node}
              activeCategoryId={activeCategoryId}
              ancestorIds={ancestorIds}
              directParentId={directParentId}
              pathIdSet={pathIdSet}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
};

type CategoryTreeItemProps = {
  node: CategoryTreeNode;
  depth?: number;
  activeCategoryId: string | null;
  ancestorIds: Set<string>;
  directParentId: string | null;
  pathIdSet: Set<string>;
};

const CategoryTreeItem = ({
  node,
  depth = 0,
  activeCategoryId,
  ancestorIds,
  directParentId,
  pathIdSet,
}: CategoryTreeItemProps) => {
  const isAncestor = ancestorIds.has(node.id);
  const isActive = node.id === activeCategoryId;
  // URLから計算した展開状態（stateなし）
  // アクティブカテゴリ自身も展開して子を表示する
  const expanded = isAncestor || isActive;
  const hasChildren = node.children.length > 0;

  // 上位祖先（直接の親でない祖先）の展開時は、パス上の子のみ表示してパス外の兄弟を隠す。
  // 直接の親の展開時は全子を表示（アクティブカテゴリとその兄弟を見せる）。
  const isUpperAncestor = isAncestor && node.id !== directParentId;
  const visibleChildren = isUpperAncestor
    ? node.children.filter((child) => pathIdSet.has(child.id))
    : node.children;

  return (
    <li>
      <div className="flex items-center gap-1" style={{ paddingLeft: `${depth * 16}px` }}>
        <span className="w-5 text-xs shrink-0 text-muted-foreground">
          {hasChildren ? (expanded ? '▾' : '▸') : ''}
        </span>
        <Link
          href={`/discovery/category/${node.id}`}
          className={`flex-1 py-1 text-sm break-words ${
            isActive
              ? 'font-medium text-primary'
              : 'text-foreground-secondary hover:text-primary hover:underline'
          }`}
        >
          {node.name}
        </Link>
      </div>
      {expanded && hasChildren && (
        <ul>
          {visibleChildren.map((child) => (
            <CategoryTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              activeCategoryId={activeCategoryId}
              ancestorIds={ancestorIds}
              directParentId={directParentId}
              pathIdSet={pathIdSet}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
