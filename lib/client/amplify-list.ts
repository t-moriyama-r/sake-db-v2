type ListResult<T> = {
  data: T[];
  nextToken?: string | null;
  errors?: { message: string }[] | null;
};

// 既存形式: (nextToken, limit) の2引数を受け取る関数型
type LegacyListFn<T> = (nextToken?: string | null, limit?: number) => Promise<ListResult<T>>;

// Amplify Gen2 の list メソッド形式: オプションオブジェクトを受け取る関数型
type AmplifyListFn<T> = (options?: {
  limit?: number;
  nextToken?: string | null;
}) => Promise<ListResult<T>>;

/**
 * nextToken ページネーションで全件取得するクライアントサイド向けユーティリティ。
 *
 * 2つの呼び出し形式をサポートする：
 * - 既存形式: `fetchAll((nextToken, limit) => client.models.Category.list({ nextToken, limit }))`
 * - Amplify 形式: `fetchAll(client.models.Category.list)`
 *
 * @param listFn - nextToken と limit を受け取る関数、または Amplify の list メソッド
 * @param limit - 1ページあたりの取得件数（デフォルト 500）
 */
export async function fetchAll<T>(listFn: LegacyListFn<T>, limit?: number): Promise<T[]>;
export async function fetchAll<T>(listFn: AmplifyListFn<T>, limit?: number): Promise<T[]>;
export async function fetchAll<T>(
  listFn: LegacyListFn<T> | AmplifyListFn<T>,
  limit = 500,
): Promise<T[]> {
  // 既存形式のアロー関数は (nextToken, limit) と明示的に2引数を宣言するため .length === 2
  // Amplify の .list メソッドは (args) => ... の1引数形式のため .length === 1
  // .length === 2 なら既存形式、それ以外（<= 1）なら Amplify 形式として扱う
  const normalizedFn: LegacyListFn<T> =
    listFn.length === 2
      ? (listFn as LegacyListFn<T>)
      : (nextToken, lim) => (listFn as AmplifyListFn<T>)({ nextToken, limit: lim });

  const all: T[] = [];
  let nextToken: string | null | undefined;
  do {
    const result = await normalizedFn(nextToken, limit);
    if (result.errors?.length) {
      console.warn('取得中にエラーが発生しました:', result.errors);
      break;
    }
    all.push(...result.data);
    nextToken = result.nextToken;
  } while (nextToken);
  return all;
}
