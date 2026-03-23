type TagProps = {
  label: string;
  onDelete?: () => void;
  onClick?: () => void;
  variant?: 'default' | 'outline';
};

export const Tag = ({ label, onDelete, onClick, variant = 'default' }: TagProps) => {
  const base =
    variant === 'outline'
      ? 'border border-blue-500 text-blue-600 bg-white hover:bg-blue-50'
      : 'bg-blue-100 text-blue-700';

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
