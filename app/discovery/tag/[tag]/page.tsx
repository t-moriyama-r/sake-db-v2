import { LiquorCard } from '@/components/cards/LiquorCard';
import { Sidebar } from '@/components/layout/Sidebar';
import { fetchLiquorsByTag } from '@/lib/server/liquors';

type Props = { params: Promise<{ tag: string }> };

export default async function TagSearchPage({ params }: Props) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const liquors = await fetchLiquorsByTag(decodedTag);

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <p className="text-sm text-gray-500">タグ検索</p>
          <h1 className="text-2xl font-bold text-gray-900">#{decodedTag}</h1>
        </div>

        {liquors.length === 0 ? (
          <p className="py-16 text-center text-gray-500">
            #{decodedTag} のタグを持つお酒が見つかりませんでした
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">{liquors.length} 件</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {liquors.map((liquor) => (
                <LiquorCard key={liquor.id} liquor={liquor} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
