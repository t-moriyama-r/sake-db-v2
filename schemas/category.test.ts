import { describe, it, expect } from 'vitest';
import { categorySchema } from '@/schemas/category';

describe('categorySchema', () => {
  it('必須項目で有効な値でパースできる', () => {
    const result = categorySchema.safeParse({
      parentId: 'parent-1',
      name: 'テストカテゴリ',
    });
    expect(result.success).toBe(true);
  });

  it('parentId が空のときエラー', () => {
    const result = categorySchema.safeParse({
      parentId: '',
      name: 'テストカテゴリ',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('親カテゴリを選択してください');
    }
  });

  it('name が空のときエラー', () => {
    const result = categorySchema.safeParse({
      parentId: 'parent-1',
      name: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('カテゴリ名は必須です');
    }
  });

  it('name が101文字のときエラー', () => {
    const result = categorySchema.safeParse({
      parentId: 'parent-1',
      name: 'a'.repeat(101),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('カテゴリ名は100文字以内で入力してください');
    }
  });

  it('description が5001文字のときエラー', () => {
    const result = categorySchema.safeParse({
      parentId: 'parent-1',
      name: 'テストカテゴリ',
      description: 'a'.repeat(5001),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('説明は5000文字以内で入力してください');
    }
  });

  it('image が 2MB 超のときエラー', () => {
    const largeFile = new File(['x'.repeat(2 * 1024 * 1024 + 1)], 'large.jpg', {
      type: 'image/jpeg',
    });
    const result = categorySchema.safeParse({
      parentId: 'parent-1',
      name: 'テストカテゴリ',
      image: largeFile,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('画像は2MB以下にしてください');
    }
  });

  it('image が image/* 以外のファイルのときエラー', () => {
    const textFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const result = categorySchema.safeParse({
      parentId: 'parent-1',
      name: 'テストカテゴリ',
      image: textFile,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('画像ファイルを選択してください');
    }
  });
});
