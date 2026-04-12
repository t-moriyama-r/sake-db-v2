import { LiquorCard } from '@/components/cards/LiquorCard/LiquorCard';
import { fetchLiquorsByTag } from '@/lib/server/liquors';

type Props = { params: Promise<{ tag: string }> };

export default async function TagSearchPage({ params }: Props) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const liquors = await fetchLiquorsByTag(decodedTag);

  return (
    <>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">タグ検索</p>
        <h1 className="text-2xl font-bold text-foreground">#{decodedTag}</h1>
      </div>

      {liquors.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          #{decodedTag} のタグを持つお酒が見つかりませんでした
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">{liquors.length} 件</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {liquors.map((liquor) => (
              <LiquorCard key={liquor.id} liquor={liquor} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
