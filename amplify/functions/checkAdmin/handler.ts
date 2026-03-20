import type { Schema } from '../../data/resource';

type CognitoIdentity = { groups?: string[] } | null;

/**
 * 現在のユーザーが admin グループに属しているか判定する。
 */
export const handler: Schema['checkAdmin']['functionHandler'] = async (event) => {
  const identity = event.identity as CognitoIdentity;
  const groups = identity?.groups ?? [];
  return groups.includes('admin');
};
