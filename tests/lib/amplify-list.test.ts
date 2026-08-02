import { describe, it, expect, vi } from 'vitest';
import { fetchAll } from '@/lib/amplify-list';

type Item = { id: string };

describe('fetchAll', () => {
  it('単一ページの結果を全件返す', async () => {
    const items: Item[] = [{ id: '1' }, { id: '2' }];
    const listFn = vi.fn().mockResolvedValue({ data: items, nextToken: null });

    const result = await fetchAll<Item>(listFn);

    expect(result).toEqual(items);
    expect(listFn).toHaveBeenCalledOnce();
  });

  it('複数ページにわたるデータを全件返す', async () => {
    const page1: Item[] = [{ id: '1' }];
    const page2: Item[] = [{ id: '2' }];

    const listFn = vi
      .fn()
      .mockResolvedValueOnce({ data: page1, nextToken: 'token-1' })
      .mockResolvedValueOnce({ data: page2, nextToken: null });

    const result = await fetchAll<Item>(listFn);

    expect(result).toEqual([...page1, ...page2]);
    expect(listFn).toHaveBeenCalledTimes(2);
  });

  it('エラーが含まれるとき途中で取得を中断し、エラーページ以前のデータを返す', async () => {
    const page1: Item[] = [{ id: '1' }];
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const listFn = vi
      .fn()
      .mockResolvedValueOnce({ data: page1, nextToken: 'token-1' })
      .mockResolvedValueOnce({
        data: [],
        nextToken: null,
        errors: [{ message: 'something went wrong' }],
      });

    const result = await fetchAll<Item>(listFn);

    expect(result).toEqual(page1);
    expect(listFn).toHaveBeenCalledTimes(2);
    consoleSpy.mockRestore();
  });

  it('Amplify 形式（1引数）の関数で全件取得できる', async () => {
    const items: Item[] = [{ id: 'a' }, { id: 'b' }];
    // 1引数のAmplifyスタイル関数
    const amplifyListFn = vi.fn((_options?: { limit?: number; nextToken?: string | null }) =>
      Promise.resolve({ data: items, nextToken: null })
    );

    const result = await fetchAll<Item>(amplifyListFn);

    expect(result).toEqual(items);
    expect(amplifyListFn).toHaveBeenCalledOnce();
  });

  it('既存形式（2引数）の関数で全件取得できる', async () => {
    const items: Item[] = [{ id: 'x' }];
    // 2引数のレガシー形式
    const legacyListFn = vi.fn(
      (_nextToken?: string | null, _limit?: number) =>
        Promise.resolve({ data: items, nextToken: null })
    );

    const result = await fetchAll<Item>(legacyListFn);

    expect(result).toEqual(items);
    expect(legacyListFn).toHaveBeenCalledOnce();
  });

  it('結果が空のとき空配列を返す', async () => {
    const listFn = vi.fn().mockResolvedValue({ data: [], nextToken: null });

    const result = await fetchAll<Item>(listFn);

    expect(result).toEqual([]);
  });
});
