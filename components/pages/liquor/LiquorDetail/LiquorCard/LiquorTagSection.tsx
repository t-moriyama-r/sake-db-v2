import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import { Tag } from '@/components/ui/Tag/Tag';
import type { TagRecord } from '@/lib/server/tags/fetch';

type Props = {
  tags: TagRecord[];
  isLogin: boolean;
  newTag: string;
  onNewTagChangeAction: (value: string) => void;
  onAddTagAction: () => void;
  onDeleteTagAction: (id: string) => void;
};

export function LiquorTagSection({ tags, isLogin, newTag, onNewTagChangeAction, onAddTagAction, onDeleteTagAction }: Props) {
  return (
    <>
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link key={t.id} href={`/discovery/tag/${encodeURIComponent(t.text)}`}>
              <Tag
                label={t.text}
                onDelete={isLogin ? () => onDeleteTagAction(t.id) : undefined}
              />
            </Link>
          ))}
        </div>
      )}

      {isLogin && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => onNewTagChangeAction(e.target.value)}
            placeholder="タグを追加..."
            className="rounded-md border border-border-input bg-surface px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddTagAction();
              }
            }}
          />
          <Button size="sm" variant="secondary" onClick={onAddTagAction}>追加</Button>
        </div>
      )}
    </>
  );
}
