'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLiquorTags, type TagItem } from '@/components/pages/liquor/LiquorDetail/hooks/useLiquorTags';
import { TagList } from '@/components/ui/TagList/TagList';
import { routes } from '@/lib/routes';
import { TagAddInput } from './TagAddInput';

type Props = {
  liquorId: string;
  initialTags: TagItem[];
};

export function LiquorTagSection({ liquorId, initialTags }: Props) {
  const { isLogin } = useAuth();
  const { tags, handleAddTag, handleDeleteTag } = useLiquorTags({ liquorId, initialTags });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const tagData = tags.map((t) => ({
    id: t.id,
    label: t.text,
    href: routes.discovery.tag(t.text),
  }));

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <TagList
        tags={tagData}
        deletable={isLogin}
        onDelete={handleDeleteTag}
      />
      {isLogin && (
        tags.length === 0 ? (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-sm font-medium opacity-40 border border-dashed border-current text-muted-foreground hover:opacity-70 transition-opacity"
            aria-label="タグを追加"
          >
            タグを追加
            <span className="ml-0.5 opacity-60">+</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            aria-label="タグを追加"
          >
            <span className="text-base leading-none">+</span>
          </button>
        )
      )}
      <TagAddInput
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onAddAction={handleAddTag}
        />
      
    </div>
  );
}
