'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { CategoryTreeNode } from '@/lib/server/categories';

type CategoryTreeItemProps = {
  node: CategoryTreeNode;
  depth?: number;
};

const CategoryTreeItem = ({ node, depth = 0 }: CategoryTreeItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div className="flex items-center gap-1" style={{ paddingLeft: `${depth * 16}px` }}>
        <button
          className="text-gray-400 hover:text-gray-600 w-5 text-xs shrink-0"
          onClick={() => setExpanded((v) => !v)}
          aria-label="展開"
          disabled={!hasChildren}
        >
          {hasChildren ? (expanded ? '▾' : '▸') : ''}
        </button>
        <Link
          href={`/discovery/category/${node.id}`}
          className="flex-1 py-1 text-sm text-gray-700 hover:text-blue-600 hover:underline truncate"
          onClick={() => { if (hasChildren) setExpanded((v) => !v); }}
        >
          {node.name}
        </Link>
      </div>
      {expanded && hasChildren && (
        <ul>
          {node.children.map((child) => (
            <CategoryTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

type SidebarClientProps = {
  categoryTree: CategoryTreeNode[];
};

export const SidebarClient = ({ categoryTree }: SidebarClientProps) => (
  <aside className="hidden w-56 shrink-0 lg:block">
    <div className="rounded-lg border bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">カテゴリ</h2>
      <ul className="space-y-0.5">
        {categoryTree.map((node) => (
          <CategoryTreeItem key={node.id} node={node} />
        ))}
      </ul>
    </div>
  </aside>
);
