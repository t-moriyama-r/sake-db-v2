'use client';

import Link from 'next/link';
import { useCurrentCategoryId } from '@/hooks/useCurrentCategoryId';
import { routes } from '@/lib/routes';
import type { CategoryTreeNode } from '@/lib/server/categories/fetch';

type Props = {
  categoryTree: CategoryTreeNode[];
  /** サーバー側で解決したアクティブカテゴリID（直アクセス時の初期値として使用）。 */
  activeCategoryId?: string | null;
};

export const CategoryTree = ({ categoryTree, activeCategoryId }: Props) => {
  return (
    <aside className="hidden w-56 shrink-0 lg:block sticky top-10 self-start pt-8 max-h-[calc(100vh-2.5rem)] overflow-y-auto">
      <CategoryTreeContent categoryTree={categoryTree} activeCategoryId={activeCategoryId} />
    </aside>
  );
};

type CategoryTreeContentProps = {
  categoryTree: CategoryTreeNode[];
  activeCategoryId?: string | null;
};

export function CategoryTreeContent({ categoryTree, activeCategoryId: propActiveCategoryId }: CategoryTreeContentProps) {
  const activeCategoryId = useCurrentCategoryId(propActiveCategoryId);

  const pathIds = activeCategoryId ? (findPath(activeCategoryId, categoryTree) ?? []) : [];
  // 祖先 ID セット（アクティブ自身を除く）
  const ancestorIds = new Set(pathIds.slice(0, -1));
  // アクティブカテゴリの直接の親
  const directParentId = pathIds.length >= 2 ? pathIds[pathIds.length - 2] : null;
  // パス全体のセット（子フィルタリング用）
  const pathIdSet = new Set(pathIds);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <Link href={routes.home()} className="mb-3 block text-sm font-semibold text-foreground hover:text-primary hover:underline">
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
  );
}

type CategoryTreeItemProps = {
  node: CategoryTreeNode;
  depth?: number;
  activeCategoryId: string | null;
  ancestorIds: Set<string>;
  directParentId: string | null;
  pathIdSet: Set<string>;
};

function CategoryTreeItem({
  node,
  depth = 0,
  activeCategoryId,
  ancestorIds,
  directParentId,
  pathIdSet,
}: CategoryTreeItemProps) {
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
          href={routes.discovery.category(node.id)}
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
}

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
