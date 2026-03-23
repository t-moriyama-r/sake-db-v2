'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { client } from '@/lib/amplify-client';
import type { Schema } from '@/amplify/data/resource';
import { LiquorCard } from '@/components/cards/LiquorCard';
import { Spinner } from '@/components/ui/Spinner';
import { Sidebar } from '@/components/layout/Sidebar';

type Category = Schema['Category']['type'];
type Liquor = Schema['Liquor']['type'];

export default function CategoryDiscoveryPage() {
  const params = useParams();
  const categoryId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [liquors, setLiquors] = useState<Liquor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (categoryId) {
          const [{ data: cat }, { data: subs }, { data: liq }] = await Promise.all([
            client.models.Category.get({ id: categoryId }),
            client.models.Category.list({ filter: { parentId: { eq: categoryId } } }),
            client.models.Liquor.list({ filter: { categoryId: { eq: categoryId } } }),
          ]);
          setCategory(cat);
          setSubCategories(subs);
          setLiquors(liq);
        } else {
          const { data } = await client.models.Category.list({
            filter: { parentId: { attributeExists: false } },
          });
          setSubCategories(data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categoryId]);

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          {category ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
              {category.description && (
                <p className="mt-2 text-gray-600">{category.description}</p>
              )}
            </>
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">カテゴリから探す</h1>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <>
            {subCategories.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">
                  {category ? 'サブカテゴリ' : 'カテゴリ一覧'}
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {subCategories.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/discovery/category/${sub.id}`}
                      className="flex flex-col items-center rounded-xl border bg-white p-4 text-center shadow-sm hover:shadow-md transition-shadow"
                    >
                      {sub.imageBase64 || sub.imageUrl ? (
                        <img
                          src={sub.imageBase64 ?? sub.imageUrl ?? ''}
                          alt={sub.name}
                          className="mb-2 h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl">🍶</div>
                      )}
                      <span className="text-sm font-medium text-gray-800">{sub.name}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {liquors.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-semibold text-gray-800">このカテゴリのお酒</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {liquors.map((liquor) => (
                    <LiquorCard key={liquor.id} liquor={liquor} />
                  ))}
                </div>
              </section>
            )}

            {!loading && subCategories.length === 0 && liquors.length === 0 && (
              <p className="py-16 text-center text-gray-500">まだ登録がありません</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
