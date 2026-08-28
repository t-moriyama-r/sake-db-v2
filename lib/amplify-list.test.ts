import { describe, it, expect, vi } from 'vitest';
import { fetchAll } from '@/lib/amplify-list';

// fetchAll は宣言引数の数（fn.length === 2）で既存形式と判別するため、2 引数を明示する
function pagedListFn(pages: string[][]) {
  return async (nextToken?: string | null, limit?: number) => {
    const index = nextToken ? Number(nextToken) : 0;
    return {
      data: pages[index].slice(0, limit),
      nextToken: index + 1 < pages.length ? String(index + 1) : null,
    };
  };
}

describe('fetchAll', () => {
  it('nextToken をたどって全ページを結合する', async () => {
    const result = await fetchAll(pagedListFn([['a', 'b'], ['c'], ['d', 'e']]));
    expect(result).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('1 ページで完結する場合もそのまま返す', async () => {
    const result = await fetchAll(pagedListFn([['a']]));
    expect(result).toEqual(['a']);
  });

  it('空の結果は空配列を返す', async () => {
    const result = await fetchAll(pagedListFn([[]]));
    expect(result).toEqual([]);
  });

  it('エラーが返ったら警告してそこまでの結果を返す', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const listFn = async (nextToken?: string | null, limit?: number) => {
      if (nextToken) {
        return { data: [], nextToken: null, errors: [{ message: '取得失敗' }] };
      }
      return { data: ['a'].slice(0, limit), nextToken: '1' };
    };
    const result = await fetchAll(listFn);
    expect(result).toEqual(['a']);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  // 意図的な非対称性の固定: fetchAll は関数の宣言引数の数（.length）で
  // 既存形式（2 引数）と Amplify の list メソッド形式（1 引数）を判別する。
  // この判別が壊れると Amplify 形式で nextToken がオブジェクトとして渡らなくなる。
  it('1 引数のオプションオブジェクト形式（Amplify list メソッド）も全件取得できる', async () => {
    const pages = [['a', 'b'], ['c']];
    const amplifyStyle = async (options?: { limit?: number; nextToken?: string | null }) => {
      const index = options?.nextToken ? Number(options.nextToken) : 0;
      return {
        data: pages[index],
        nextToken: index + 1 < pages.length ? String(index + 1) : null,
      };
    };
    const result = await fetchAll(amplifyStyle);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('指定した limit が listFn に渡る', async () => {
    const listFn = vi.fn(async (_nextToken?: string | null, limit?: number) => ({
      data: [limit],
      nextToken: null,
    }));
    const result = await fetchAll(listFn, 42);
    expect(result).toEqual([42]);
    expect(listFn).toHaveBeenCalledWith(undefined, 42);
  });
});
