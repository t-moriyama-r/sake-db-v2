import { fetchRandomLiquors } from '@/lib/server/liquors';
import { fetchRootCategories } from '@/lib/server/categories';
import { LiquorCard } from '@/components/cards/LiquorCard';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function HomePage() {
  const [liquors] = await Promise.all([
    fetchRandomLiquors(12),
    fetchRootCategories(), // Sidebar用に先に読みこみキャッシュしておく
  ]);

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <section>
          <h1 className="mb-6 text-2xl font-bold text-gray-900">おすすめのお酒</h1>
          {liquors.length === 0 ? (
            <p className="py-16 text-center text-gray-500">まだお酒が登録されていません</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {liquors.map((liquor) => (
                <LiquorCard key={liquor.id} liquor={liquor} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
