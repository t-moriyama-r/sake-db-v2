import type { Schema } from '@/amplify/data/resource';
import { fetchAll } from '@/lib/amplify-list';
import { withCache, CACHE_TAGS } from '../cache';
import { getGuestClient } from '../client';

export type TagRecord = Schema['Tag']['type'];
export type SerializableTagRecord = Omit<TagRecord, 'liquor'>;

/** 指定お酒のタグを取得する。 */
export const fetchTags = withCache(
  async (liquorId: string): Promise<SerializableTagRecord[]> => {
    const client = getGuestClient();
    const result = await fetchAll((t, lim) =>
      client.models.Tag.listTagByLiquorId(
        { liquorId },
        { limit: lim, nextToken: t ?? undefined },
      ),
    );
    return JSON.parse(JSON.stringify(result)) as SerializableTagRecord[];
  },
  ['tags'],
  { tags: [CACHE_TAGS.tags], revalidate: 600 },
);
