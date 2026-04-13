import { fetchAllLiquorsRandomly } from '@/lib/server/liquors/fetch';
import { LiquorCard } from '@/components/cards/LiquorCard/LiquorCard';

export default async function HomePage() {
  const liquors = await fetchAllLiquorsRandomly();

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-foreground">おすすめのお酒</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {liquors.map((liquor) => (
          <LiquorCard key={liquor.id} liquor={liquor} />
        ))}
      </div>
    </section>
  );
}
