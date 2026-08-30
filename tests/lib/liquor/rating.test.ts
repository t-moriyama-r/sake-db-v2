import { describe, it, expect } from 'vitest';
import { calcMemberAvgRate, calcMemberRateCount } from '@/lib/liquor/rating';

const emptyRates = {
  rate5Users: [],
  rate4Users: [],
  rate3Users: [],
  rate2Users: [],
  rate1Users: [],
};

describe('calcMemberRateCount', () => {
  it('評価がゼロのとき 0 を返す', () => {
    expect(calcMemberRateCount(emptyRates)).toBe(0);
  });

  it('各レートのユーザー数の合計を返す', () => {
    expect(
      calcMemberRateCount({
        rate5Users: ['a', 'b'],
        rate4Users: ['c'],
        rate3Users: [],
        rate2Users: ['d', 'e', 'f'],
        rate1Users: [],
      }),
    ).toBe(6);
  });

  it('null/undefined フィールドを 0 として扱う', () => {
    expect(
      calcMemberRateCount({
        rate5Users: null,
        rate4Users: undefined,
        rate3Users: ['a'],
        rate2Users: null,
        rate1Users: undefined,
      } as unknown as Parameters<typeof calcMemberRateCount>[0]),
    ).toBe(1);
  });
});

describe('calcMemberAvgRate', () => {
  it('評価がゼロのとき 0 を返す', () => {
    expect(calcMemberAvgRate(emptyRates)).toBe(0);
  });

  it('全員が5点評価のとき 5 を返す', () => {
    expect(
      calcMemberAvgRate({
        ...emptyRates,
        rate5Users: ['a', 'b', 'c'],
      }),
    ).toBe(5);
  });

  it('全員が1点評価のとき 1 を返す', () => {
    expect(
      calcMemberAvgRate({
        ...emptyRates,
        rate1Users: ['a', 'b'],
      }),
    ).toBe(1);
  });

  it('3点と5点が同数のとき平均 4 を返す', () => {
    expect(
      calcMemberAvgRate({
        ...emptyRates,
        rate5Users: ['a'],
        rate3Users: ['b'],
      }),
    ).toBe(4);
  });

  it('端数は Math.round で丸められる', () => {
    // (5 + 4 + 3) / 3 = 4.0
    expect(
      calcMemberAvgRate({
        ...emptyRates,
        rate5Users: ['a'],
        rate4Users: ['b'],
        rate3Users: ['c'],
      }),
    ).toBe(4);
  });
});
