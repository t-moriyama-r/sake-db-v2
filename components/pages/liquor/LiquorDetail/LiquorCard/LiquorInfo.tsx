import { LiquorRating } from '@/components/pages/liquor/common/LiquorRating/LiquorRating';
import { calcMemberAvgRate, calcMemberRateCount } from '@/lib/liquor/rating';
import type { LiquorRecord } from '@/lib/server/liquors/fetch';

type Props = {
  liquor: LiquorRecord;
};

export function LiquorInfo({ liquor }: Props) {
  return (
    <>
      <p className="text-sm text-muted-foreground">{liquor.categoryName}</p>
      <h1 className="mt-1 text-2xl font-bold text-foreground">{liquor.name}</h1>
      <div className="mt-2">
        <LiquorRating
          memberAvgRate={calcMemberAvgRate(liquor)}
          memberRateCount={calcMemberRateCount(liquor)}
          allAvgRate={liquor.boardAvgRate}
          allRateCount={liquor.boardRateCount}
        />
      </div>
      {liquor.description && (
        <p className="mt-4 whitespace-pre-wrap text-foreground-secondary">{liquor.description}</p>
      )}
    </>
  );
}

