'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCategoryDelete } from '@/app/admin/useCategoryDelete';
import { Button } from '@/components/ui/Button/Button';
import { ConfirmDialog } from '@/components/ui/Dialog/Dialog';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/amplify-client';
import { fetchAll } from '@/lib/client/amplify-list';
import { routes } from '@/lib/routes';
import type { SerializableCategoryRecord } from '@/lib/server/categories/fetch';

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();

  const [categories, setCategories] = useState<SerializableCategoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { deleteId, deleting, deleteError, startDelete, cancelDelete, handleDelete } =
    useCategoryDelete({ setCategories });

  useEffect(() => {
    if (!isLoading && !isAdmin) { router.replace(routes.home()); return; }
    if (isAdmin) {
      loadCategories().finally(() => setLoading(false));
    }
  }, [isAdmin, isLoading, router]);

  async function loadCategories() {
    const data = await fetchAll((nextToken, limit) =>
      client.models.Category.list({ limit, nextToken: nextToken ?? undefined }),
    );
    setCategories(JSON.parse(JSON.stringify(data)) as SerializableCategoryRecord[]);
  }

  if (isLoading || loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">管理画面</h1>
        <Button onClick={() => router.push(routes.category.create('root'))}>
          カテゴリを作成
        </Button>
      </div>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-foreground">カテゴリ管理</h2>
        </div>
        <div className="divide-y divide-border">
          {rootCategories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-6 py-3">
              <div>
                <Link href={routes.category.detail(cat.id)} className="font-medium text-foreground hover:text-primary">
                  {cat.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  子カテゴリ: {categories.filter((c) => c.parentId === cat.id).length}件
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => router.push(routes.category.edit(cat.id))}>
                  編集
                </Button>
                <Button variant="secondary" size="sm" onClick={() => router.push(routes.category.create(cat.id))}>
                  子を追加
                </Button>
                <Button variant="secondary" size="sm" onClick={() => router.push(routes.liquor.create(cat.id))}>
                  お酒を追加
                </Button>
                {!cat.readonly && (
                  <Button variant="danger" size="sm" onClick={() => startDelete(cat.id)}>
                    削除
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ConfirmDialog
        open={!!deleteId}
        onClose={cancelDelete}
        onConfirm={handleDelete}
        title="カテゴリを削除"
        message="このカテゴリを削除してもよろしいですか？サブカテゴリとお酒への影響を確認してください。"
        confirmLabel="削除する"
        loading={deleting}
        errorMessage={deleteError}
      />
    </div>
  );
}
