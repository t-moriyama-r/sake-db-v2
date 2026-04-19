import type { ColorScheme } from '@/components/ui/Tag/Tag';
import { Tag } from '@/components/ui/Tag/Tag';

export type TagListItem = {
  id: string;
  label: string;
  href?: string;
};

type Props = {
  tags: TagListItem[];
  deletable?: boolean;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  colorScheme?: ColorScheme;
  variant?: 'default' | 'outline';
  className?: string;
};

export function TagList({
  tags,
                          deletable = false,
  onDelete,
  onClick,
  colorScheme,
  variant,
  className = '',
}: Props) {
  if (tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <Tag
          key={tag.id}
          label={tag.label}
          href={tag.href}
          deletable={deletable}
          onDeleteAction={onDelete ? () => onDelete(tag.id) : undefined}
          onClickAction={onClick ? () => onClick(tag.id) : undefined}
          colorScheme={colorScheme}
          variant={variant}
        />
      ))}
    </div>
  );
}
