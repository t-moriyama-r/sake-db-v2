'use server';

import { fetchLiquor } from './fetch';

/** お酒の categoryId をサーバーサイドで取得する Server Action。 */
export async function getLiquorCategoryId(liquorId: string): Promise<string | null> {
  const liquor = await fetchLiquor(liquorId);
  return liquor?.categoryId ?? null;
}
