'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { client } from '@/lib/amplify-client';
import type { Schema } from '@/amplify/data/resource';
import { useAuth } from '@/hooks/useAuth';
import { LiquorCard } from '@/components/cards/LiquorCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

type Category = Schema['Category']['type'];
type Liquor = Schema['Liquor']['type'];

export const CategoryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [liquors, setLiquors] = useState<Liquor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ data: cat }, { data: subs }, { data: liq }] = await Promise.all([
          client.models.Category.get({ id }),
          client.models.Category.list({ filter: { parentId: { eq: id } } }),
          client.models.Liquor.list({ filter: { categoryId: { eq: id } } }),
        ]);
        if (!cat) { router.replace('/'); return; }
        setCategory(cat);
        setSubCategories(subs);
        setLiquors(liq);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router]);

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!category) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">ホーム</Link>
        <span>›</span>
        <span className="text-gray-900">{category.name}</span>
      </nav>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
          {category.description && <p className="mt-2 text-gray-600">{category.description}</p>}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => router.push(`/category/edit/${id}`)}>
              編集
            </Button>
            <Button size="sm" onClick={() => router.push(`/liquor/create/${id}`)}>
              お酒を追加
            </Button>
            <Button variant="secondary" size="sm" onClick={() => router.push(`/category/create/${id}`)}>
              サブカテゴリを追加
            </Button>
          </div>
        )}
      </div>

      {subCategories.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">サブカテゴリ</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {subCategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/category/${sub.id}`}
                className="rounded-xl border bg-white p-4 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-sm font-medium text-gray-800">{sub.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {liquors.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">お酒一覧 ({liquors.length}件)</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {liquors.map((liquor) => (
              <LiquorCard key={liquor.id} liquor={liquor} />
            ))}
          </div>
        </section>
      )}

      {liquors.length === 0 && subCategories.length === 0 && (
        <p className="py-16 text-center text-gray-500">まだ登録がありません</p>
      )}
    </div>
  );
}
