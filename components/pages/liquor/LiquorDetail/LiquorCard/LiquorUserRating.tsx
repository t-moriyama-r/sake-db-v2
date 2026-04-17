import { StarRating } from '@/components/ui/StarRating/StarRating';

type Props = {
  ratingValue: number | null;
  ratingLoading: boolean;
  onRateAction: (value: number) => void;
};

export function LiquorUserRating({ ratingValue, ratingLoading, onRateAction }: Props) {
  return (
    <div className="mt-4">
      <p className="mb-1 text-sm font-medium text-foreground-secondary">あなたの評価</p>
      <StarRating
        value={ratingValue}
        onChange={ratingLoading ? undefined : onRateAction}
      />
    </div>
  );
}
