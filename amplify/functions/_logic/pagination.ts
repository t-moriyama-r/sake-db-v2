/**
 * nextToken ベースのページネーションを持つ list 関数を、全件取得するまで繰り返す。
 *
 * @example
 * const items = await listAll((nextToken) =>
 *   client.models.Liquor.list({ limit: 1000, nextToken, selectionSet: ['id', 'name'] as const })
 * );
 */
export async function listAll<T>(
  listFn: (nextToken?: string) => Promise<{ data: T[]; nextToken?: string | null }>,
): Promise<T[]> {
  const items: T[] = [];
  let nextToken: string | undefined;

  do {
    const result = await listFn(nextToken);
    items.push(...result.data);
    nextToken = result.nextToken ?? undefined;
  } while (nextToken);

  return items;
}
