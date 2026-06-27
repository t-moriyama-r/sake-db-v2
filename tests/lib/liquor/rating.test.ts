import { describe, it, expect } from 'vitest';
import { calcMemberAvgRate, calcMemberRateCount } from '@/lib/liquor/rating';

// Amplify の a.string().array().required() は Nullable<string>[] に解決される
// Nullable<string>[] = (string | null)[] （フィールド自体は必須で undefined にならない）
type RateFields = {
  rate5Users: (string | null)[];
  rate4Users: (string | null)[];
  rate3Users: (string | null)[];
  rate2Users: (string | null)[];
  rate1Users: (string | null)[];
};

function makeRateFields(partial: Partial<RateFields>): RateFields {
  return {
    rate5Users: partial.rate5Users ?? [],
    rate4Users: partial.rate4Users ?? [],
    rate3Users: partial.rate3Users ?? [],
    rate2Users: partial.rate2Users ?? [],
    rate1Users: partial.rate1Users ?? [],
  };
}

describe('calcMemberRateCount', () => {
  it('評価者が0人のとき0を返す', () => {
    const liquor = makeRateFields({});
    expect(calcMemberRateCount(liquor)).toBe(0);
  });

  it('各評価のユーザー数を合計する', () => {
    const liquor = makeRateFields({
      rate5Users: ['a', 'b'],
      rate4Users: ['c'],
      rate3Users: [],
      rate2Users: ['d', 'e', 'f'],
      rate1Users: ['g'],
    });
    expect(calcMemberRateCount(liquor)).toBe(7);
  });

  it('一部のフィールドのみ存在する場合に正しく合計する', () => {
    const liquor = makeRateFields({
      rate5Users: ['a', 'b', 'c'],
      rate3Users: ['d'],
    });
    expect(calcMemberRateCount(liquor)).toBe(4);
  });

  it('全フィールドが1人ずつの場合に5を返す', () => {
    const liquor = makeRateFields({
      rate5Users: ['a'],
      rate4Users: ['b'],
      rate3Users: ['c'],
      rate2Users: ['d'],
      rate1Users: ['e'],
    });
    expect(calcMemberRateCount(liquor)).toBe(5);
  });
});

describe('calcMemberAvgRate', () => {
  it('評価者が0人のとき0を返す', () => {
    const liquor = makeRateFields({});
    expect(calcMemberAvgRate(liquor)).toBe(0);
  });

  it('全員が5点のとき5を返す', () => {
    const liquor = makeRateFields({
      rate5Users: ['a', 'b', 'c'],
    });
    expect(calcMemberAvgRate(liquor)).toBe(5);
  });

  it('全員が1点のとき1を返す', () => {
    const liquor = makeRateFields({
      rate1Users: ['a', 'b'],
    });
    expect(calcMemberAvgRate(liquor)).toBe(1);
  });

  it('平均を正しく計算しMath.roundで丸める（3.5 → 4）', () => {
    // 5点×1人、2点×1人 → 合計7 / 2人 = 3.5 → 4
    const liquor = makeRateFields({
      rate5Users: ['a'],
      rate2Users: ['b'],
    });
    expect(calcMemberAvgRate(liquor)).toBe(4);
  });

  it('平均を正しく計算しMath.roundで丸める（3.0 → 3）', () => {
    // 5点×1人、2点×2人 → 合計9 / 3人 = 3.0
    const liquor = makeRateFields({
      rate5Users: ['a'],
      rate2Users: ['b', 'c'],
    });
    expect(calcMemberAvgRate(liquor)).toBe(3);
  });

  it('5点×2人、3点×2人、1点×1人の場合', () => {
    // 10 + 0 + 6 + 0 + 1 = 17 / 5 = 3.4 → 3
    const liquor = makeRateFields({
      rate5Users: ['a', 'b'],
      rate3Users: ['c', 'd'],
      rate1Users: ['e'],
    });
    expect(calcMemberAvgRate(liquor)).toBe(3);
  });

  it('全フィールドが1人ずつの場合、(5+4+3+2+1)/5 = 3を返す', () => {
    const liquor = makeRateFields({
      rate5Users: ['a'],
      rate4Users: ['b'],
      rate3Users: ['c'],
      rate2Users: ['d'],
      rate1Users: ['e'],
    });
    expect(calcMemberAvgRate(liquor)).toBe(3);
  });
});
