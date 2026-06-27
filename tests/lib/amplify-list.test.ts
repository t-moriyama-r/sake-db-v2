import { describe, it, expect, vi } from 'vitest';
import { fetchAll } from '@/lib/amplify-list';

// テスト用にLegacyListFnの2引数形式を再現するヘルパー
// vi.fn()は.length===0になるため、明示的な関数宣言で引数2つを持つ関数を用意する
function makeLegacyFn<T>(
  impl: (nextToken?: string | null, limit?: number) => Promise<{
    data: T[];
    nextToken?: string | null;
    errors?: { message: string }[] | null;
  }>,
): (nextToken?: string | null, limit?: number) => Promise<{
  data: T[];
  nextToken?: string | null;
  errors?: { message: string }[] | null;
}> {
  // function宣言で2引数（.length === 2）を保持しつつspyできるようにラップ
  const spy = vi.fn(impl);
  // length===2になるようにラッパー関数を使う
  function legacyWrapper(nextToken?: string | null, limit?: number) {
    return spy(nextToken, limit);
  }
  // spyのモック機能をlegacyWrapperに委譲
  (legacyWrapper as unknown as { mock: unknown }).mock = spy.mock;
  return legacyWrapper as typeof impl;
}

describe('fetchAll', () => {
  describe('LegacyListFn形式（引数2つ、.length===2）', () => {
    it('1ページで全件取得できる', async () => {
      const data = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const implSpy = vi.fn(async (_nextToken?: string | null, _limit?: number) => ({
        data,
        nextToken: null,
      }));
      function legacyFn(nextToken?: string | null, limit?: number) {
        return implSpy(nextToken, limit);
      }

      const result = await fetchAll(legacyFn);

      expect(result).toEqual(data);
      expect(implSpy).toHaveBeenCalledTimes(1);
      expect(implSpy).toHaveBeenCalledWith(undefined, 500);
    });

    it('複数ページをまたいで全件取得できる', async () => {
      const page1 = [{ id: '1' }, { id: '2' }];
      const page2 = [{ id: '3' }, { id: '4' }];
      const implSpy = vi
        .fn()
        .mockResolvedValueOnce({ data: page1, nextToken: 'token1' })
        .mockResolvedValueOnce({ data: page2, nextToken: null });
      function legacyFn(nextToken?: string | null, limit?: number) {
        return implSpy(nextToken, limit) as Promise<{ data: { id: string }[]; nextToken: string | null }>;
      }

      const result = await fetchAll(legacyFn);

      expect(result).toEqual([...page1, ...page2]);
      expect(implSpy).toHaveBeenCalledTimes(2);
      expect(implSpy).toHaveBeenNthCalledWith(1, undefined, 500);
      expect(implSpy).toHaveBeenNthCalledWith(2, 'token1', 500);
    });

    it('3ページ以上をまたいで全件取得できる', async () => {
      const page1 = [{ id: '1' }];
      const page2 = [{ id: '2' }];
      const page3 = [{ id: '3' }];
      const implSpy = vi
        .fn()
        .mockResolvedValueOnce({ data: page1, nextToken: 'token1' })
        .mockResolvedValueOnce({ data: page2, nextToken: 'token2' })
        .mockResolvedValueOnce({ data: page3, nextToken: null });
      function legacyFn(nextToken?: string | null, limit?: number) {
        return implSpy(nextToken, limit) as Promise<{ data: { id: string }[]; nextToken: string | null }>;
      }

      const result = await fetchAll(legacyFn);

      expect(result).toEqual([...page1, ...page2, ...page3]);
      expect(implSpy).toHaveBeenCalledTimes(3);
    });

    it('カスタムlimitを指定できる', async () => {
      const implSpy = vi.fn(async (_nextToken?: string | null, _limit?: number) => ({
        data: [{ id: '1' }],
        nextToken: null,
      }));
      function legacyFn(nextToken?: string | null, limit?: number) {
        return implSpy(nextToken, limit);
      }

      await fetchAll(legacyFn, 100);

      expect(implSpy).toHaveBeenCalledWith(undefined, 100);
    });

    it('errorsがある場合はwarningを出し、そのページのデータはpushせずにbreakする', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const page1 = [{ id: '1' }];
      const implSpy = vi
        .fn()
        .mockResolvedValueOnce({ data: page1, nextToken: 'token1', errors: [{ message: 'エラー発生' }] })
        .mockResolvedValueOnce({ data: [{ id: '2' }], nextToken: null });
      function legacyFn(nextToken?: string | null, limit?: number) {
        return implSpy(nextToken, limit) as Promise<{ data: { id: string }[]; nextToken: string | null; errors: { message: string }[] }>;
      }

      const result = await fetchAll(legacyFn);

      // errorsがあるとbreakでpushをスキップするため空配列になる
      expect(result).toEqual([]);
      expect(implSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledOnce();

      consoleWarnSpy.mockRestore();
    });

    it('データが空配列でも正常に返す', async () => {
      const implSpy = vi.fn(async (_nextToken?: string | null, _limit?: number) => ({
        data: [] as { id: string }[],
        nextToken: null,
      }));
      function legacyFn(nextToken?: string | null, limit?: number) {
        return implSpy(nextToken, limit);
      }

      const result = await fetchAll(legacyFn);

      expect(result).toEqual([]);
    });
  });

  describe('AmplifyListFn形式（引数1つ、.length<=1）', () => {
    it('1ページで全件取得できる', async () => {
      const data = [{ id: '1' }, { id: '2' }];
      const listFn = vi.fn(async (_options?: { limit?: number; nextToken?: string | null }) => ({
        data,
        nextToken: null,
      }));

      const result = await fetchAll(listFn);

      expect(result).toEqual(data);
      expect(listFn).toHaveBeenCalledTimes(1);
      expect(listFn).toHaveBeenCalledWith({ nextToken: undefined, limit: 500 });
    });

    it('複数ページをまたいで全件取得できる', async () => {
      const page1 = [{ id: '1' }, { id: '2' }];
      const page2 = [{ id: '3' }];
      const listFn = vi
        .fn()
        .mockResolvedValueOnce({ data: page1, nextToken: 'token1' })
        .mockResolvedValueOnce({ data: page2, nextToken: null });

      const result = await fetchAll(
        listFn as (options?: { limit?: number; nextToken?: string | null }) => Promise<{ data: { id: string }[]; nextToken: string | null }>,
      );

      expect(result).toEqual([...page1, ...page2]);
      expect(listFn).toHaveBeenCalledTimes(2);
      expect(listFn).toHaveBeenNthCalledWith(1, { nextToken: undefined, limit: 500 });
      expect(listFn).toHaveBeenNthCalledWith(2, { nextToken: 'token1', limit: 500 });
    });

    it('errorsがある場合はwarningを出し、そのページのデータはpushせずにbreakする', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const page1 = [{ id: '1' }];
      const listFn = vi
        .fn()
        .mockResolvedValueOnce({ data: page1, nextToken: 'token1', errors: [{ message: 'エラー発生' }] });

      const result = await fetchAll(
        listFn as (options?: { limit?: number; nextToken?: string | null }) => Promise<{ data: { id: string }[]; nextToken: string | null; errors: { message: string }[] }>,
      );

      // errorsがあるとbreakでpushをスキップするため空配列になる
      expect(result).toEqual([]);
      expect(listFn).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledOnce();

      consoleWarnSpy.mockRestore();
    });

    it('カスタムlimitを指定できる', async () => {
      const listFn = vi.fn(async (_options?: { limit?: number; nextToken?: string | null }) => ({
        data: [{ id: '1' }],
        nextToken: null,
      }));

      await fetchAll(listFn, 200);

      expect(listFn).toHaveBeenCalledWith({ nextToken: undefined, limit: 200 });
    });
  });
});
