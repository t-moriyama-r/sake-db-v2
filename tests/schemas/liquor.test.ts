import { describe, it, expect } from 'vitest';
import { liquorSchema } from '@/schemas/liquor';

describe('liquorSchema', () => {
  it('必須項目のみで有効な値でパースできる', () => {
    const result = liquorSchema.safeParse({
      categoryId: 'cat-1',
      name: 'テスト酒',
    });
    expect(result.success).toBe(true);
  });

  it('全フィールド指定でパースできる', () => {
    const result = liquorSchema.safeParse({
      categoryId: 'cat-1',
      name: 'テスト酒',
      description: '説明文',
      youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });
    expect(result.success).toBe(true);
  });

  it('categoryId が空のときエラー', () => {
    const result = liquorSchema.safeParse({
      categoryId: '',
      name: 'テスト酒',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('カテゴリは必須です');
    }
  });

  it('name が空のときエラー', () => {
    const result = liquorSchema.safeParse({
      categoryId: 'cat-1',
      name: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('お酒の名前は必須です');
    }
  });

  it('name が101文字のときエラー', () => {
    const result = liquorSchema.safeParse({
      categoryId: 'cat-1',
      name: 'a'.repeat(101),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('お酒の名前は100文字以内で入力してください');
    }
  });

  it('description が5001文字のときエラー', () => {
    const result = liquorSchema.safeParse({
      categoryId: 'cat-1',
      name: 'テスト酒',
      description: 'a'.repeat(5001),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('説明は5000文字以内で入力してください');
    }
  });

  it('youtube が不正なURLのときエラー', () => {
    const result = liquorSchema.safeParse({
      categoryId: 'cat-1',
      name: 'テスト酒',
      youtube: 'https://example.com/not-youtube',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('有効なYouTube URLを入力してください');
    }
  });

  it('youtube が空文字列のときはエラーなし', () => {
    const result = liquorSchema.safeParse({
      categoryId: 'cat-1',
      name: 'テスト酒',
      youtube: '',
    });
    expect(result.success).toBe(true);
  });

  it('youtu.be 短縮URLを受け付ける', () => {
    const result = liquorSchema.safeParse({
      categoryId: 'cat-1',
      name: 'テスト酒',
      youtube: 'https://youtu.be/dQw4w9WgXcQ',
    });
    expect(result.success).toBe(true);
  });

  it('image が 2MB 超のときエラー', () => {
    const largeFile = new File(['x'.repeat(2 * 1024 * 1024 + 1)], 'large.jpg', {
      type: 'image/jpeg',
    });
    const result = liquorSchema.safeParse({
      categoryId: 'cat-1',
      name: 'テスト酒',
      image: largeFile,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('画像は2MB以下にしてください');
    }
  });

  it('image がimage/* 以外のファイルのときエラー', () => {
    const textFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const result = liquorSchema.safeParse({
      categoryId: 'cat-1',
      name: 'テスト酒',
      image: textFile,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('画像ファイルを選択してください');
    }
  });
});
