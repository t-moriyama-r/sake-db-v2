import { describe, it, expect } from 'vitest';
import { boardPostSchema, tagSchema } from '@/schemas/board';

describe('boardPostSchema', () => {
  it('テキストのみで有効な値でパースできる', () => {
    const result = boardPostSchema.safeParse({ text: 'コメントです' });
    expect(result.success).toBe(true);
  });

  it('全フィールド指定でパースできる', () => {
    const result = boardPostSchema.safeParse({
      text: 'コメントです',
      rate: 5,
      guestName: 'ゲスト',
    });
    expect(result.success).toBe(true);
  });

  it('text が空のときエラー', () => {
    const result = boardPostSchema.safeParse({ text: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('コメントを入力してください');
    }
  });

  it('text が2001文字のときエラー', () => {
    const result = boardPostSchema.safeParse({ text: 'a'.repeat(2001) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('コメントは2000文字以内で入力してください');
    }
  });

  it('rate が範囲外（0）のときエラー', () => {
    const result = boardPostSchema.safeParse({ text: 'コメント', rate: 0 });
    expect(result.success).toBe(false);
  });

  it('rate が範囲外（6）のときエラー', () => {
    const result = boardPostSchema.safeParse({ text: 'コメント', rate: 6 });
    expect(result.success).toBe(false);
  });

  it('rate が1〜5の整数のときパースできる', () => {
    for (const rate of [1, 2, 3, 4, 5]) {
      const result = boardPostSchema.safeParse({ text: 'コメント', rate });
      expect(result.success).toBe(true);
    }
  });

  it('guestName が21文字のときエラー', () => {
    const result = boardPostSchema.safeParse({
      text: 'コメント',
      guestName: 'a'.repeat(21),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('ニックネームは20文字以内で入力してください');
    }
  });
});

describe('tagSchema', () => {
  it('有効なタグでパースできる', () => {
    const result = tagSchema.safeParse({ text: '辛口' });
    expect(result.success).toBe(true);
  });

  it('text が空のときエラー', () => {
    const result = tagSchema.safeParse({ text: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('タグを入力してください');
    }
  });

  it('text が31文字のときエラー', () => {
    const result = tagSchema.safeParse({ text: 'a'.repeat(31) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('タグは30文字以内で入力してください');
    }
  });
});
