import { notFound } from 'next/navigation';
import { LiquorDetail } from '@/components/pages/liquor/LiquorDetail/LiquorDetail';
import { getServerUser } from '@/lib/server/auth';
import { fetchBoardPosts } from '@/lib/server/boardPosts/fetch';
import { fetchAllCategories, buildCategoryBreadcrumbs } from '@/lib/server/categories/fetch';
import { fetchLiquor } from '@/lib/server/liquors/fetch';
import { fetchTags } from '@/lib/server/tags/fetch';

type Props = { params: Promise<{ id: string }> };

export default async function LiquorDetailPage({ params }: Props) {
  const { id } = await params;

  const [liquor, boardPosts, tags, serverUser, allCategories] = await Promise.all([
    fetchLiquor(id),
    fetchBoardPosts(id),
    fetchTags(id),
    getServerUser(),
    fetchAllCategories(),
  ]);

  if (!liquor) notFound();

  const categoryPath = buildCategoryBreadcrumbs(liquor.categoryId, allCategories);

  // Amplify Gen2 の lazy loading 関数フィールド（category, boardPosts 等）を除去し、
  // Client Component に渡せるシリアライザブルな形式に変換する
  const serializableLiquor = JSON.parse(JSON.stringify(liquor)) as typeof liquor;
  const serializableBoardPosts = JSON.parse(JSON.stringify(boardPosts)) as typeof boardPosts;

  return (
    <LiquorDetail
      initialLiquor={serializableLiquor}
      initialBoardPosts={serializableBoardPosts}
      initialTags={tags}
      serverUser={serverUser}
      categoryPath={categoryPath}
    />
  );
}
