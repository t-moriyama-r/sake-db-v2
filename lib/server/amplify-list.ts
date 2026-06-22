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
 * nextToken ページネーションで全件取得するユーティリティ。
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
  // listFn.length === 0 → Amplify 形式（引数なし or オプションオブジェクト1つ）
  // listFn.length > 0  → 既存形式（nextToken, limit の2引数）
  const isAmplifyForm = listFn.length === 0;
  const all: T[] = [];
  let nextToken: string | null | undefined;
  do {
    const result = isAmplifyForm
      ? await (listFn as AmplifyListFn<T>)({ nextToken, limit })
      : await (listFn as LegacyListFn<T>)(nextToken, limit);
    if (result.errors?.length) {
      console.warn('取得中にエラーが発生しました:', result.errors);
      break;
    }
    all.push(...result.data);
    nextToken = result.nextToken;
  } while (nextToken);
  return all;
}
