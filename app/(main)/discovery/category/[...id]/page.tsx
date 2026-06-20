import Link from 'next/link';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { routes } from '@/lib/routes';
import { LiquorCard } from '@/components/pages/liquor/LiquorCard/LiquorCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb/Breadcrumb';
import { getServerUser } from '@/lib/server/auth';
import {
  fetchAllCategories,
  fetchCategory,
  collectDescendantIds,
  type SerializableCategoryRecord,
} from '@/lib/server/categories/fetch';
import { fetchLiquorsByCategories } from '@/lib/server/liquors/fetch';

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
      <Breadcrumb
        className="mb-3"
        items={[
          { label: 'ホーム', href: routes.home() },
          ...breadcrumbs.map((bc, i) =>
            i < breadcrumbs.length - 1
              ? { label: bc.name ?? '', href: routes.discovery.category(bc.id) }
              : { label: bc.name ?? '' }
          ),
        ]}
      />

      {category && (
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
            {isLoggedIn && (
              <Link
                href={routes.category.edit(categoryId)}
                className="inline-flex items-center justify-center rounded-md p-1.5 text-sm transition-colors text-foreground-secondary hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="カテゴリを編集"
              >
                <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
              </Link>
            )}
          </div>
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
              href={routes.liquor.create(categoryId)}
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

function buildBreadcrumbs(categoryId: string, allCategories: SerializableCategoryRecord[]): SerializableCategoryRecord[] {
  const category = allCategories.find((c) => c.id === categoryId);
  if (!category) return [];

  const ancestors = category.parentId
    ? buildBreadcrumbs(category.parentId, allCategories)
    : [];

  return [...ancestors, category];
}
