'use client';

type StarRatingProps = {
  value: number;
  max?: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };

export const StarRating = ({ value, max = 5, onChange, readonly, size = 'md' }: StarRatingProps) => {
  return (
    <div className="flex items-center gap-0.5" role={readonly ? undefined : 'radiogroup'}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          className={`${sizeClasses[size]} leading-none transition-transform ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
          aria-label={readonly ? undefined : `${star}点`}
          tabIndex={readonly ? -1 : 0}
        >
          <span className={star <= value ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
    </div>
  );
}
