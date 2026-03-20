import type { Schema } from '../../data/resource';
import { getDataClient } from '../_shared/data-client';

type CognitoIdentity = { sub: string } | null;

/**
 * 現在のログインユーザーが対象お酒に投票したフレーバーデータを返す。
 */
export const handler: Schema['getVoted']['functionHandler'] = async (event) => {
  const { liquorId } = event.arguments;
  const identity = event.identity as CognitoIdentity;
  const client = await getDataClient();

  const { data: votes } = await client.models.FlavorVote.list({
    filter: { liquorId: { eq: liquorId } },
  });

  const userVote = votes?.find((v) => v.owner === identity?.sub);
  if (!userVote) return null;

  return {
    liquorId: userVote.liquorId,
    userId: userVote.owner ?? '',
    categoryId: userVote.categoryId,
    x: userVote.x,
    y: userVote.y,
    updatedAt: userVote.updatedAt,
  };
};
