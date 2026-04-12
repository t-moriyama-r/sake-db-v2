import type { LiquorRecord } from '@/lib/server/liquors';

type RateFields = Pick<
  LiquorRecord,
  'rate5Users' | 'rate4Users' | 'rate3Users' | 'rate2Users' | 'rate1Users'
>;

export function calcMemberAvgRate(liquor: RateFields): number {
  const total =
    (liquor.rate5Users?.length ?? 0) * 5 +
    (liquor.rate4Users?.length ?? 0) * 4 +
    (liquor.rate3Users?.length ?? 0) * 3 +
    (liquor.rate2Users?.length ?? 0) * 2 +
    (liquor.rate1Users?.length ?? 0);
  const count = calcMemberRateCount(liquor);
  return count === 0 ? 0 : Math.round(total / count);
}

export function calcMemberRateCount(liquor: RateFields): number {
  return (
    (liquor.rate5Users?.length ?? 0) +
    (liquor.rate4Users?.length ?? 0) +
    (liquor.rate3Users?.length ?? 0) +
    (liquor.rate2Users?.length ?? 0) +
    (liquor.rate1Users?.length ?? 0)
  );
}
