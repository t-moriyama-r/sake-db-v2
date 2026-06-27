import { describe, it, expect } from 'vitest';
import { extractYoutubeEmbedId } from '@/lib/liquor/youtube';

describe('extractYoutubeEmbedId', () => {
  it('nullを渡したときundefinedを返す', () => {
    expect(extractYoutubeEmbedId(null)).toBeUndefined();
  });

  it('undefinedを渡したときundefinedを返す', () => {
    expect(extractYoutubeEmbedId(undefined)).toBeUndefined();
  });

  it('空文字列を渡したときundefinedを返す', () => {
    expect(extractYoutubeEmbedId('')).toBeUndefined();
  });

  it('YouTubeのURLではない文字列でundefinedを返す', () => {
    expect(extractYoutubeEmbedId('https://example.com/video')).toBeUndefined();
  });

  it('?v=形式の標準URLからビデオIDを抽出する', () => {
    expect(extractYoutubeEmbedId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('?v=形式で追加のクエリパラメータがあってもビデオIDを抽出する', () => {
    expect(extractYoutubeEmbedId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s')).toBe('dQw4w9WgXcQ');
  });

  it('youtu.be/形式の短縮URLからビデオIDを抽出する', () => {
    expect(extractYoutubeEmbedId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('youtu.be/形式でクエリパラメータ（?t=）がある場合、IDにクエリが含まれる（正規表現は?を区切り文字として扱わない）', () => {
    // 正規表現 [^&\s]+ は & と空白のみ区切り文字として扱うため ? は含まれる
    expect(extractYoutubeEmbedId('https://youtu.be/dQw4w9WgXcQ?t=30')).toBe('dQw4w9WgXcQ?t=30');
  });

  it('埋め込みURL（embed/）形式はサポートしない', () => {
    // embed/ 形式は ?v= も youtu.be/ も含まないためundefinedになる
    expect(extractYoutubeEmbedId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBeUndefined();
  });
});
