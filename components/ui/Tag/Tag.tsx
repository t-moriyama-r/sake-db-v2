'use client';

import Link from 'next/link';

export type ColorScheme = 'primary' | 'success' | 'destructive';

type Props = {
  label: string;
  href?: string;
  deletable?: boolean;
  onDeleteAction?: () => void;
  onClickAction?: () => void;
  colorScheme?: ColorScheme;
  variant?: 'default' | 'outline';
};

const colorMap: Record<ColorScheme, Record<'default' | 'outline', string>> = {
  primary: {
    default: 'bg-primary/10 text-primary',
    outline: 'border border-primary text-primary bg-surface hover:bg-primary/10',
  },
  success: {
    default: 'bg-success-subtle text-success-subtle-foreground',
    outline: 'border border-success text-success bg-surface hover:bg-success-subtle',
  },
  destructive: {
    default: 'bg-destructive-subtle text-destructive-subtle-foreground',
    outline: 'border border-destructive text-destructive bg-surface hover:bg-destructive-subtle',
  },
};

export function Tag({
  label,
  href,
  deletable = false,
  onDeleteAction,
  onClickAction,
  colorScheme = 'primary',
  variant = 'default',
}: Props) {
  const colorClass = colorMap[colorScheme][variant];
  const showDelete = deletable && onDeleteAction;
  const baseClass = `inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-sm font-medium transition-colors ${colorClass}`;

  const content = (
    <>
      {href ? <Link href={href}>#{label}</Link> : `#${label}`}
      {showDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteAction();
          }}
          className="ml-0.5 text-current opacity-60 hover:opacity-100"
          aria-label={`タグ ${label} を削除`}
        >
          ✕
        </button>
      )}
    </>
  );

  if (onClickAction) {
    return (
      <button
        type="button"
        className={`${baseClass} cursor-pointer`}
        onClick={onClickAction}
        aria-label={`タグ ${label} で絞り込む`}
      >
        {content}
      </button>
    );
  }

  return <span className={baseClass}>{content}</span>;
}
