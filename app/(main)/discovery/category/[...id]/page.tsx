import Link from 'next/link';
import { LiquorCard } from '@/components/cards/LiquorCard/LiquorCard';
import {
  fetchAllCategories,
  fetchCategory,
  collectDescendantIds,
  type CategoryRecord,
} from '@/lib/server/categories/fetch';
import { fetchLiquorsByCategories } from '@/lib/server/liquors/fetch';
import { getServerUser } from '@/lib/server/auth';

type Props = { params: Promise<{ id: string[] }> };

export default async function CategoryDiscoveryPage({ params }: Props) {
  const { id: idSegments } = await params;
  const categoryId = idSegments[0];

  const allCategories = await fetchAllCategories();
  const [category, liquors, user] = await Promise.all([
    fetchCategory(categoryId),
    fetchLiquorsByCategories(collectDescendantIds(categoryId, allCategories)),
    getServerUser(),
  ]);
  const breadcrumbs = buildBreadcrumbs(categoryId, allCategories);
  const isLoggedIn = !!user;

  return (
    <div>
      <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm">
        <Link href="/" className="text-link hover:underline">ホーム</Link>
        {breadcrumbs.map((bc, i) => (
          <span key={bc.id} className="flex items-center gap-1">
            <span className="text-muted-foreground">›</span>
            {i < breadcrumbs.length - 1 ? (
              <Link href={`/discovery/category/${bc.id}`} className="text-link hover:underline">
                {bc.name}
              </Link>
            ) : (
              <span className="font-medium text-foreground-secondary">{bc.name}</span>
            )}
          </span>
        ))}
      </nav>

      {category && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-foreground-secondary">{category.description}</p>
          )}
        </div>
      )}

      {liquors.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {liquors.map((liquor) => (
            <LiquorCard key={liquor.id} liquor={liquor} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <p className="text-center text-muted-foreground">このカテゴリに登録されたお酒がありません。</p>
          {isLoggedIn && (
            <Link
              href={`/liquor/create/${categoryId}`}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              お酒を登録
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function buildBreadcrumbs(categoryId: string, allCategories: CategoryRecord[]): CategoryRecord[] {
  const category = allCategories.find((c) => c.id === categoryId);
  if (!category) return [];

  const ancestors = category.parentId
    ? buildBreadcrumbs(category.parentId, allCategories)
    : [];

  return [...ancestors, category];
}
