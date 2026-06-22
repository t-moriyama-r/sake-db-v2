type ListResult<T> = {
  data: T[];
  nextToken?: string | null;
  errors?: { message: string }[] | null;
};

/**
 * nextToken ページネーションで全件取得するクライアントサイド向けユーティリティ。
 * @param listFn - nextToken と limit を受け取り ListResult を返す関数
 * @param limit - 1ページあたりの取得件数（デフォルト 500）
 */
export async function fetchAll<T>(
  listFn: (nextToken?: string | null, limit?: number) => Promise<ListResult<T>>,
  limit = 500,
): Promise<T[]> {
  const all: T[] = [];
  let nextToken: string | null | undefined;
  do {
    const result = await listFn(nextToken, limit);
    if (result.errors?.length) {
      console.warn('取得中にエラーが発生しました:', result.errors);
      break;
    }
    all.push(...result.data);
    nextToken = result.nextToken;
  } while (nextToken);
  return all;
}
