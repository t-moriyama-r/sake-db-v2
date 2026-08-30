import type { ReactNode } from 'react';
import { LiquorRating } from '@/components/pages/liquor/common/LiquorRating/LiquorRating';
import { calcMemberAvgRate, calcMemberRateCount } from '@/lib/liquor/rating';
import type { SerializableLiquorRecord } from '@/lib/server/liquors/fetch';

type Props = {
  liquor: SerializableLiquorRecord;
  actions?: ReactNode;
};

export function LiquorInfo({ liquor, actions }: Props) {
  return (
    <>
      <p className="text-sm text-muted-foreground">{liquor.categoryName}</p>
      <div className="mt-1 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">{liquor.name}</h1>
        {actions}
      </div>
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
