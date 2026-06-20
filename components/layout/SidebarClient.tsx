'use client';

import Link from 'next/link';
import { useState } from 'react';
import { client } from '@/lib/amplify-client';
import type { Schema } from '@/amplify/data/resource';
import { routes } from '@/lib/routes';

/** Server Component から渡せるシリアライズ可能な最小型 */
type CategoryNode = { id: string; name: string };
/** Client 側で子カテゴリを取得したときに使うフル型 */
type Category = Schema['Category']['type'];

type CategoryTreeItemProps = {
  category: CategoryNode;
  depth?: number;
};

const CategoryTreeItem = ({ category, depth = 0 }: CategoryTreeItemProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [children, setChildren] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchChildren = async () => {
    if (expanded || loading) return;
    setLoading(true);
    try {
      const { data } = await client.models.Category.list({
        filter: { parentId: { eq: category.id } },
      });
      setChildren(data);
      setExpanded(true);
    } catch (e) {
      console.warn('子カテゴリの取得に失敗しました:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <li>
      <div className="flex items-center gap-1" style={{ paddingLeft: `${depth * 16}px` }}>
        <button
          className="text-gray-400 hover:text-gray-600 w-5 text-xs"
          onClick={fetchChildren}
          aria-label="展開"
        >
          {loading ? '…' : expanded ? '▾' : '▸'}
        </button>
        <Link
          href={routes.discovery.category(category.id)}
          className="flex-1 py-1 text-sm text-gray-700 hover:text-blue-600 hover:underline truncate"
        >
          {category.name}
        </Link>
      </div>
      {expanded && children.length > 0 && (
        <ul>
          {children.map((c) => (
            <CategoryTreeItem key={c.id} category={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

type SidebarClientProps = {
  rootCategories: CategoryNode[];
};

export const SidebarClient = ({ rootCategories }: SidebarClientProps) => (
  <aside className="hidden w-56 shrink-0 lg:block">
    <div className="rounded-lg border bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">カテゴリ</h2>
      <ul className="space-y-0.5">
        {rootCategories.map((c) => (
          <CategoryTreeItem key={c.id} category={c} />
        ))}
      </ul>
    </div>
  </aside>
);
