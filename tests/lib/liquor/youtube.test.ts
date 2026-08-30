import { describe, it, expect } from 'vitest';
import { extractYoutubeEmbedId } from '@/lib/liquor/youtube';

describe('extractYoutubeEmbedId', () => {
  it('youtube.com/watch?v= 形式の URL から動画IDを抽出できる', () => {
    expect(extractYoutubeEmbedId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('youtu.be/ 短縮URL から動画IDを抽出できる', () => {
    expect(extractYoutubeEmbedId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('追加クエリパラメータがあっても動画IDを抽出できる', () => {
    expect(extractYoutubeEmbedId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s')).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('null のとき undefined を返す', () => {
    expect(extractYoutubeEmbedId(null)).toBeUndefined();
  });

  it('undefined のとき undefined を返す', () => {
    expect(extractYoutubeEmbedId(undefined)).toBeUndefined();
  });

  it('YouTube URL でない文字列のとき undefined を返す', () => {
    expect(extractYoutubeEmbedId('https://example.com')).toBeUndefined();
  });

  it('空文字列のとき undefined を返す', () => {
    expect(extractYoutubeEmbedId('')).toBeUndefined();
  });
});
