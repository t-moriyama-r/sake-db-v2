'use client';

type Props = {
  value: number;
  max?: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };

export const StarRating = ({ value, max = 5, onChange, readonly, size = 'md' }: Props) => {
  return (
    <div
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={readonly ? `${value}点` : '評価'}
      className="flex items-center gap-0.5"
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        readonly ? (
          <span
            key={star}
            className={`${sizeClasses[size]} leading-none ${star <= (value ?? 0) ? 'text-rating' : 'text-border-input'}`}
            aria-hidden="true"
          >
            ★
          </span>
        ) : (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className={`${sizeClasses[size]} leading-none transition-transform cursor-pointer hover:scale-110`}
            aria-label={`${star}点`}
            aria-pressed={star <= (value ?? 0)}
          >
            <span className={star <= value ? 'text-rating' : 'text-border-input'}>★</span>
          </button>
        )
      ))}
    </div>
  );
}
