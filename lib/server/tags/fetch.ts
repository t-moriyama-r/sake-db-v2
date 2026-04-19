import type { Schema } from '@/amplify/data/resource';
import { fetchAll } from '../amplify-list';
import { withCache, CACHE_TAGS } from '../cache';
import { getGuestClient } from '../client';

export type TagRecord = Schema['Tag']['type'];
export type SerializableTagRecord = Omit<TagRecord, 'liquor'>;

/** 指定お酒のタグを取得する。 */
export const fetchTags = withCache(
  async (liquorId: string): Promise<SerializableTagRecord[]> => {
    const client = getGuestClient();
    const result = await fetchAll((t, lim) =>
      client.models.Tag.list({ filter: { liquorId: { eq: liquorId } }, limit: lim, nextToken: t }),
    );
    return JSON.parse(JSON.stringify(result)) as SerializableTagRecord[];
  },
  ['tags'],
  { tags: [CACHE_TAGS.tags], revalidate: 600 },
);
