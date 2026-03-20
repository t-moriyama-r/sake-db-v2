import type { Schema } from '../../data/resource';
import { getDataClient } from '../_shared/data-client';

type CognitoIdentity = { sub: string } | null;

/**
 * 現在のログインユーザーが指定お酒をブックマーク済みか判定する。
 */
export const handler: Schema['getIsBookMarked']['functionHandler'] = async (event) => {
  const { id } = event.arguments;
  const identity = event.identity as CognitoIdentity;
  const client = await getDataClient();

  const { data: bookmarks } = await client.models.BookMark.list({
    filter: {
      and: [{ liquorId: { eq: id } }, { owner: { eq: identity?.sub ?? '' } }],
    },
  });

  return (bookmarks?.length ?? 0) > 0;
};
