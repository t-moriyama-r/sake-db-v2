import type { Schema } from '../../data/resource';
import { getDataClient } from '../_shared/data-client';

type CognitoIdentity = { sub: string } | null;

/**
 * ブックマーク済みお酒の高評価レビューをおすすめリストとして返す。
 * ブックマークがない場合は全体の高評価レビューを返す。
 */
export const handler: Schema['getRecommendLiquorList']['functionHandler'] = async (event) => {
  const identity = event.identity as CognitoIdentity;
  const client = await getDataClient();

  type RecommendItem = NonNullable<Schema['getRecommendLiquorList']['returnType']>[number];

  const buildRecommend = async (liquorId: string, limit = 3): Promise<RecommendItem[]> => {
    const [{ data: posts }, { data: liquor }] = await Promise.all([
      client.models.BoardPost.list({
        filter: { and: [{ liquorId: { eq: liquorId } }, { rate: { ge: 4 } }] },
      }),
      client.models.Liquor.get({ id: liquorId }),
    ]);
    if (!liquor || !posts) return [];

    return posts.slice(0, limit).map((post) => ({
      rate: post.rate ?? 4,
      comment: post.text,
      liquor: {
        id: liquor.id,
        name: liquor.name,
        categoryId: liquor.categoryId,
        categoryName: liquor.categoryName,
        imageBase64: liquor.imageBase64 ?? null,
        description: liquor.description ?? '',
      },
      user: {
        id: post.userId ?? '',
        name: post.userName ?? '匿名',
        imageBase64: post.userImageBase64 ?? null,
      },
      updatedAt: post.updatedAt,
    }));
  };

  // ブックマーク済みお酒のおすすめを優先
  if (identity?.sub) {
    const { data: bookmarks } = await client.models.BookMark.list({
      filter: { owner: { eq: identity.sub } },
    });
    const bookmarkedIds = (bookmarks ?? []).map((b) => b.liquorId);

    if (bookmarkedIds.length > 0) {
      const results = await Promise.all(
        bookmarkedIds.slice(0, 5).map((id) => buildRecommend(id, 2)),
      );
      return results.flat().slice(0, 20);
    }
  }

  // フォールバック: 全体の高評価レビュー上位20件
  const { data: posts } = await client.models.BoardPost.list({
    filter: { rate: { ge: 5 } },
  });
  const sorted = (posts ?? [])
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 20);

  const results = await Promise.all(
    [...new Set(sorted.map((p) => p.liquorId))].slice(0, 10).map((id) => buildRecommend(id, 2)),
  );
  return results.flat().slice(0, 20);
};
