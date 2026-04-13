import Link from 'next/link';
import { redirect } from 'next/navigation';
import { fetchCategory, fetchAllCategories } from '@/lib/server/categories/fetch';
import { fetchLiquorsByCategories } from '@/lib/server/liquors/fetch';
import { getServerUser } from '@/lib/server/auth';
import { LiquorCard } from '@/components/cards/LiquorCard/LiquorCard';

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [category, allCategories, liquors, user] = await Promise.all([
    fetchCategory(id),
    fetchAllCategories(),
    fetchLiquorsByCategories([id]),
    getServerUser(),
  ]);

  if (!category) redirect('/');

  const subCategories = allCategories.filter((c) => c.parentId === id);
  const isAdmin = user?.isAdmin ?? false;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm">
        <Link href="/" className="text-link hover:underline">ホーム</Link>
        <span className="text-muted-foreground">›</span>
        <span className="font-medium text-foreground-secondary">{category.name}</span>
      </nav>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
          {category.description && <p className="mt-2 text-foreground-secondary">{category.description}</p>}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link
              href={`/category/edit/${id}`}
              className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors bg-muted text-foreground-secondary hover:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              編集
            </Link>
            <Link
              href={`/liquor/create/${id}`}
              className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              お酒を追加
            </Link>
            <Link
              href={`/category/create/${id}`}
              className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors bg-muted text-foreground-secondary hover:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              サブカテゴリを追加
            </Link>
          </div>
        )}
      </div>

      {subCategories.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">サブカテゴリ</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {subCategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/category/${sub.id}`}
                className="rounded-xl border border-border bg-surface p-4 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-sm font-medium text-foreground">{sub.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {liquors.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">お酒一覧 ({liquors.length}件)</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {liquors.map((liquor) => (
              <LiquorCard key={liquor.id} liquor={liquor} />
            ))}
          </div>
        </section>
      )}

      {liquors.length === 0 && subCategories.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">まだ登録がありません</p>
      )}
    </div>
  );
}
