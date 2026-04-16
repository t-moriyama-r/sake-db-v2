import Link from 'next/link';
import { LiquorRating } from '@/components/liquor/LiquorRating/LiquorRating';
import { calcMemberAvgRate, calcMemberRateCount } from '@/lib/liquor/rating';
import { routes } from '@/lib/routes';
import type { Schema } from '@/amplify/data/resource';

type Liquor = Schema['Liquor']['type'];

type Props = {
  liquor: Liquor;
};

export const LiquorCard = ({ liquor }: Props) => {
  return (
    <Link
      href={routes.liquor.detail(liquor.id)}
      className="group flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative mb-3 aspect-video overflow-hidden rounded-md bg-muted">
        {liquor.imageBase64 || liquor.imageUrl ? (
          <img
            src={liquor.imageBase64 ?? liquor.imageUrl ?? ''}
            alt={liquor.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-muted-foreground">🍶</div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{liquor.categoryName}</p>
      <h3 className="mt-1 font-semibold text-foreground group-hover:text-primary line-clamp-2">{liquor.name}</h3>
      {liquor.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{liquor.description}</p>
      )}
      <div className="mt-2">
        <LiquorRating
          memberAvgRate={calcMemberAvgRate(liquor)}
          memberRateCount={calcMemberRateCount(liquor)}
          allAvgRate={liquor.boardAvgRate}
          allRateCount={liquor.boardRateCount}
        />
      </div>
    </Link>
  );
}
