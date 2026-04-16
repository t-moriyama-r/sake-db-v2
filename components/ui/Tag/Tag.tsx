type Props = {
  label: string;
  onDelete?: () => void;
  onClick?: () => void;
  variant?: 'default' | 'outline';
};

export const Tag = ({ label, onDelete, onClick, variant = 'default' }: Props) => {
  const base =
    variant === 'outline'
      ? 'border border-primary text-primary bg-surface hover:bg-primary/10'
      : 'bg-primary/10 text-primary';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-sm font-medium transition-colors ${base} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      #{label}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="ml-0.5 text-current opacity-60 hover:opacity-100"
          aria-label={`タグ ${label} を削除`}
        >
          ✕
        </button>
      )}
    </span>
  );
}
