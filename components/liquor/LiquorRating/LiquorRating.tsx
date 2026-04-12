import { StarRating } from '@/components/ui/StarRating/StarRating';

type LiquorRatingProps = {
  memberAvgRate: number;
  memberRateCount: number;
  allAvgRate?: number | null;
  allRateCount?: number | null;
};

export function LiquorRating({ memberAvgRate, memberRateCount, allAvgRate, allRateCount }: LiquorRatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      {memberAvgRate > 0 ? (
        <StarRating value={memberAvgRate} readonly size="sm" />
      ) : (
        <span className="text-sm text-muted-foreground">未評価</span>
      )}
      <span className="text-sm text-muted-foreground">
        {memberAvgRate > 0
          ? `${memberAvgRate.toFixed(1)}/${memberRateCount}件`
          : null}
        {allAvgRate != null
          ? `（${allAvgRate.toFixed(1)}/${allRateCount != null ? `${allRateCount}件` : '-'}）`
          : null}
      </span>
    </div>
  );
}
