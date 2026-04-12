import { notFound } from 'next/navigation';
import { fetchLiquor, fetchBoardPosts, fetchTags } from '@/lib/server/liquors';
import { getServerUser } from '@/lib/server/auth';
import { LiquorDetailClient } from '@/components/liquor/LiquorDetailClient/LiquorDetailClient';

type Props = { params: Promise<{ id: string }> };

export default async function LiquorDetailPage({ params }: Props) {
  const { id } = await params;

  const [liquor, boardPosts, tags, serverUser] = await Promise.all([
    fetchLiquor(id),
    fetchBoardPosts(id),
    fetchTags(id),
    getServerUser(),
  ]);

  if (!liquor) notFound();

  // Amplify Gen2 の lazy loading 関数フィールド（category, boardPosts 等）を除去し、
  // Client Component に渡せるシリアライザブルな形式に変換する
  const serializableLiquor = JSON.parse(JSON.stringify(liquor)) as typeof liquor;

  return (
    <LiquorDetailClient
      initialLiquor={serializableLiquor}
      initialBoardPosts={boardPosts}
      initialTags={tags}
      serverUser={serverUser}
    />
  );
}
