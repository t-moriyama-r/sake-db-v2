import type { Schema } from '../../data/resource';
import { getDataClient } from '../_shared/data-client';

/**
 * 指定ユーザーのプロフィールと評価リストを返す。
 * UserProfile モデルから基本情報を、BoardPost から評価データを集計する。
 */
export const handler: Schema['getUserByIdDetail']['functionHandler'] = async (event) => {
  const { id } = event.arguments;
  const client = await getDataClient();

  const [{ data: profiles }, { data: posts }] = await Promise.all([
    // cognitoId フィールドで UserProfile を検索（セカンダリインデックスを使用）
    client.models.UserProfile.list({ filter: { cognitoId: { eq: id } } }),
    client.models.BoardPost.list({ filter: { userId: { eq: id } } }),
  ]);

  const profile = profiles?.[0];
  if (!profile) throw new Error(`UserProfile not found for cognitoId: ${id}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allPosts: any[] = posts ?? [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toUserLiquor = (post: any) => ({
    id: post.id,
    liquorId: post.liquorId,
    name: post.liquorName,
    categoryId: post.categoryId,
    categoryName: post.categoryName,
    imageBase64: null as string | null,
    comment: post.text,
    rate: post.rate ?? null,
    updatedAt: post.updatedAt,
  });

  const evaluateList = {
    recentComments: [...allPosts]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map(toUserLiquor),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rate5Liquors: allPosts.filter((p: any) => p.rate === 5).map(toUserLiquor),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rate4Liquors: allPosts.filter((p: any) => p.rate === 4).map(toUserLiquor),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rate3Liquors: allPosts.filter((p: any) => p.rate === 3).map(toUserLiquor),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rate2Liquors: allPosts.filter((p: any) => p.rate === 2).map(toUserLiquor),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rate1Liquors: allPosts.filter((p: any) => p.rate === 1).map(toUserLiquor),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    noRateLiquors: allPosts.filter((p: any) => p.rate == null).map(toUserLiquor),
  };

  return {
    evaluateList,
    user: {
      id: profile.cognitoId,
      name: profile.name,
      email: profile.email,
      profile: profile.profile ?? null,
      imageBase64: profile.imageBase64 ?? null,
      roles: profile.roles ?? [],
    },
  };
};
