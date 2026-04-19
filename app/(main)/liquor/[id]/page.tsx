import { notFound } from 'next/navigation';
import { LiquorDetail } from '@/components/pages/liquor/LiquorDetail/LiquorDetail';
import { fetchBoardPosts } from '@/lib/server/boardPosts/fetch';
import { fetchAllCategories, buildCategoryBreadcrumbs } from '@/lib/server/categories/fetch';
import { fetchLiquor } from '@/lib/server/liquors/fetch';

type Props = { params: Promise<{ id: string }> };

export default async function LiquorDetailPage({ params }: Props) {
  const { id } = await params;

  const [liquor, boardPosts, allCategories] = await Promise.all([
    fetchLiquor(id),
    fetchBoardPosts(id),
    fetchAllCategories(),
  ]);

  if (!liquor) notFound();

  const categoryPath = buildCategoryBreadcrumbs(liquor.categoryId, allCategories);

  return (
    <LiquorDetail
      initialLiquor={liquor}
      initialBoardPosts={boardPosts}
      initialTags={liquor.tags}
      categoryPath={categoryPath}
    />
  );
}
