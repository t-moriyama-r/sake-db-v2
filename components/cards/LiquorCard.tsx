import Link from 'next/link';
import StarRating from '@/components/ui/StarRating';
import type { Schema } from '@/amplify/data/resource';

type Liquor = Schema['Liquor']['type'];

function calcAvgRate(liquor: Liquor): number {
  const total =
    (liquor.rate5Users?.length ?? 0) * 5 +
    (liquor.rate4Users?.length ?? 0) * 4 +
    (liquor.rate3Users?.length ?? 0) * 3 +
    (liquor.rate2Users?.length ?? 0) * 2 +
    (liquor.rate1Users?.length ?? 0) * 1;
  const count =
    (liquor.rate5Users?.length ?? 0) +
    (liquor.rate4Users?.length ?? 0) +
    (liquor.rate3Users?.length ?? 0) +
    (liquor.rate2Users?.length ?? 0) +
    (liquor.rate1Users?.length ?? 0);
  if (count === 0) return 0;
  return Math.round(total / count);
}

type LiquorCardProps = {
  liquor: Liquor;
};

export default function LiquorCard({ liquor }: LiquorCardProps) {
  const avg = calcAvgRate(liquor);

  return (
    <Link
      href={`/liquor/${liquor.id}`}
      className="group flex flex-col rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative mb-3 aspect-video overflow-hidden rounded-md bg-gray-100">
        {liquor.imageBase64 || liquor.imageUrl ? (
          <img
            src={liquor.imageBase64 ?? liquor.imageUrl ?? ''}
            alt={liquor.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-gray-300">🍶</div>
        )}
      </div>
      <p className="text-xs text-gray-500">{liquor.categoryName}</p>
      <h3 className="mt-1 font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2">{liquor.name}</h3>
      {liquor.description && (
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{liquor.description}</p>
      )}
      {avg > 0 && (
        <div className="mt-2">
          <StarRating value={avg} readonly size="sm" />
        </div>
      )}
    </Link>
  );
}
