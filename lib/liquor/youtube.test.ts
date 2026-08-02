import { describe, it, expect } from 'vitest';
import { extractYoutubeEmbedId } from '@/lib/liquor/youtube';

describe('extractYoutubeEmbedId', () => {
  it('watch URL の v= パラメータから ID を抽出する', () => {
    expect(extractYoutubeEmbedId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('youtu.be 短縮 URL から ID を抽出する', () => {
    expect(extractYoutubeEmbedId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('後続のクエリパラメータを ID に含めない', () => {
    expect(extractYoutubeEmbedId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s')).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('YouTube 以外の URL は undefined を返す', () => {
    expect(extractYoutubeEmbedId('https://example.com/video/123')).toBeUndefined();
  });

  it('YouTube 以外のホストに v= パラメータが含まれていても undefined を返す', () => {
    expect(extractYoutubeEmbedId('https://example.com/video?v=dQw4w9WgXcQ')).toBeUndefined();
  });

  it('null / undefined / 空文字列は undefined を返す', () => {
    expect(extractYoutubeEmbedId(null)).toBeUndefined();
    expect(extractYoutubeEmbedId(undefined)).toBeUndefined();
    expect(extractYoutubeEmbedId('')).toBeUndefined();
  });
});
