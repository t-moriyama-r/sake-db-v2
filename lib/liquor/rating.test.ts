import { describe, it, expect } from 'vitest';
import { calcMemberAvgRate, calcMemberRateCount } from '@/lib/liquor/rating';

describe('calcMemberRateCount', () => {
  it('全評価のユーザー数を合計する', () => {
    const count = calcMemberRateCount({
      rate5Users: ['a', 'b'],
      rate4Users: ['c'],
      rate3Users: [],
      rate2Users: ['d'],
      rate1Users: ['e', 'f'],
    });
    expect(count).toBe(6);
  });

  it('全フィールドが空配列なら 0 を返す', () => {
    const count = calcMemberRateCount({
      rate5Users: [],
      rate4Users: [],
      rate3Users: [],
      rate2Users: [],
      rate1Users: [],
    });
    expect(count).toBe(0);
  });
});

describe('calcMemberAvgRate', () => {
  it('評価の加重平均を四捨五入して返す', () => {
    const avg = calcMemberAvgRate({
      rate5Users: ['a'],
      rate4Users: ['b'],
      rate3Users: [],
      rate2Users: [],
      rate1Users: [],
    });
    expect(avg).toBe(5); // (5 + 4) / 2 = 4.5 → 四捨五入で 5
  });

  it('評価者が 1 人なら評価値そのものを返す', () => {
    const avg = calcMemberAvgRate({
      rate5Users: [],
      rate4Users: [],
      rate3Users: ['a'],
      rate2Users: [],
      rate1Users: [],
    });
    expect(avg).toBe(3);
  });

  it('評価者が 0 人なら 0 を返す（ゼロ除算にしない）', () => {
    const avg = calcMemberAvgRate({
      rate5Users: [],
      rate4Users: [],
      rate3Users: [],
      rate2Users: [],
      rate1Users: [],
    });
    expect(avg).toBe(0);
  });

  it('平均がちょうど整数になるケースも正しく計算する', () => {
    const avg = calcMemberAvgRate({
      rate5Users: [],
      rate4Users: ['a'],
      rate3Users: [],
      rate2Users: [],
      rate1Users: ['b', 'c'],
    });
    expect(avg).toBe(2); // (4 + 1 + 1) / 3 = 2.0
  });
});
