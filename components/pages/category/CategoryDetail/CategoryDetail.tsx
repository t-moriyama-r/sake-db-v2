import Link from 'next/link';
import { LiquorCard } from '@/components/pages/liquor/LiquorCard/LiquorCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb/Breadcrumb';
import type { CategoryBreadcrumbItem } from '@/lib/server/categories/fetch';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';

type SubCategory = {
  id: string;
  name: string;
};

type Props = {
  categoryId: string;
  categoryName: string;
  categoryDescription?: string | null;
  breadcrumbs: CategoryBreadcrumbItem[];
  subCategories: SubCategory[];
  liquors: SerializableLiquorRecord[];
  isAdmin: boolean;
};

export function CategoryDetail({
  categoryId,
  categoryName,
  categoryDescription,
  breadcrumbs,
  subCategories,
  liquors,
  isAdmin,
}: Props) {
  const breadcrumbItems = [
    { label: 'ホーム', href: '/' },
    ...breadcrumbs.map((bc, i) =>
      i < breadcrumbs.length - 1
        ? { label: bc.name, href: `/category/${bc.id}` }
        : { label: bc.name }
    ),
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb className="mb-4" items={breadcrumbItems} />

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{categoryName}</h1>
          {categoryDescription && (
            <p className="mt-2 text-foreground-secondary">{categoryDescription}</p>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link
              href={`/category/edit/${categoryId}`}
              className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors bg-muted text-foreground-secondary hover:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              編集
            </Link>
            <Link
              href={`/liquor/create/${categoryId}`}
              className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              お酒を追加
            </Link>
            <Link
              href={`/category/create/${categoryId}`}
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
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            お酒一覧 ({liquors.length}件)
          </h2>
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

