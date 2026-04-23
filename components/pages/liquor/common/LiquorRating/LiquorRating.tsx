import { StarRating } from '@/components/ui/StarRating/StarRating';

type Props = {
  memberAvgRate: number;
  memberRateCount: number;
  allAvgRate?: number | null;
  allRateCount?: number | null;
};

export function LiquorRating({ memberAvgRate, memberRateCount, allAvgRate, allRateCount }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      {allAvgRate != null ? (
        <StarRating value={allAvgRate} readonly size="sm" />
      ) : (
        <span className="text-sm text-muted-foreground">未評価</span>
      )}
      <span className="text-sm text-muted-foreground">
        {allAvgRate != null
          ? `${allAvgRate.toFixed(1)}/${allRateCount != null ? `${allRateCount}件` : '-'}`
          : null}
        {memberAvgRate > 0
          ? `（認証済 ${memberAvgRate.toFixed(1)}/${memberRateCount}件）`
          : null}
      </span>
    </div>
  );
}
