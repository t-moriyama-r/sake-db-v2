'use client';

import { useState } from 'react';
import { client } from '@/lib/amplify-client';
import { revalidateTagsCache } from '@/lib/server/tags/revalidate';

export type TagItem = { id: string; text: string };

type Options = {
  liquorId: string;
  initialTags: TagItem[];
};

export function useLiquorTags({ liquorId, initialTags }: Options) {
  const [tags, setTags] = useState<TagItem[]>(initialTags);

  async function handleAddTag(text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) throw new Error('タグを入力してください');
    if (tags.some((t) => t.text === trimmed)) throw new Error('同じタグがすでに存在します');
    const { errors: createErrors } = await client.models.Tag.create({ liquorId, text: trimmed }, { authMode: 'identityPool' });
    if (createErrors?.length) throw new Error(createErrors[0].message);
    const { data: tagList } = await client.models.Tag.list({ filter: { liquorId: { eq: liquorId } }, authMode: 'identityPool' });
    setTags(tagList.map(({ id, text }) => ({ id, text })));
    await revalidateTagsCache();
  }

  async function handleDeleteTag(tagId: string): Promise<void> {
    const { errors } = await client.models.Tag.delete({ id: tagId }, { authMode: 'identityPool' });
    if (errors?.length) throw new Error(errors[0].message);
    setTags((prev) => prev.filter((t) => t.id !== tagId));
    await revalidateTagsCache();
  }

  return { tags, handleAddTag, handleDeleteTag };
}

