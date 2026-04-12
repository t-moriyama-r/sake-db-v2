import Link from 'next/link';
import { LiquorCard } from '@/components/cards/LiquorCard/LiquorCard';
import {
  fetchAllCategories,
  fetchCategory,
  collectDescendantIds,
  type CategoryRecord,
} from '@/lib/server/categories';
import { fetchLiquorsByCategories } from '@/lib/server/liquors';

type Props = { params: Promise<{ id: string[] }> };

export default async function CategoryDiscoveryPage({ params }: Props) {
  const { id: idSegments } = await params;
  const categoryId = idSegments[0];

  const allCategories = await fetchAllCategories();
  const [category, liquors] = await Promise.all([
    fetchCategory(categoryId),
    fetchLiquorsByCategories(collectDescendantIds(categoryId, allCategories)),
  ]);
  const breadcrumbs = buildBreadcrumbs(categoryId, allCategories);

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
        <p className="py-16 text-center text-muted-foreground">まだ登録がありません</p>
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
