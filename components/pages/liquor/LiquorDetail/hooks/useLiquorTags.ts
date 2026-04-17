'use client';

import { useState } from 'react';
import { client } from '@/lib/amplify-client';
import type { TagRecord } from '@/lib/server/tags/fetch';

type Options = {
  liquorId: string;
  initialTags: TagRecord[];
};

export function useLiquorTags({ liquorId, initialTags }: Options) {
  const [tags, setTags] = useState(initialTags);
  const [newTag, setNewTag] = useState('');

  async function handleAddTag(): Promise<void> {
    if (!newTag.trim()) return;
    await client.models.Tag.create({ liquorId, text: newTag.trim() });
    const { data: tagList } = await client.models.Tag.list({ filter: { liquorId: { eq: liquorId } } });
    setTags(tagList.map(({ liquor: _liquorFn, ...tag }) => tag as TagRecord));
    setNewTag('');
  }

  async function handleDeleteTag(tagId: string): Promise<void> {
    await client.models.Tag.delete({ id: tagId });
    setTags((prev) => prev.filter((t) => t.id !== tagId));
  }

  return { tags, newTag, setNewTag, handleAddTag, handleDeleteTag };
}

