import { describe, it, expect } from 'vitest';
import { routes } from '@/lib/routes';

describe('routes', () => {
  it('動的パラメータを含むパスを生成する', () => {
    expect(routes.liquor.detail('abc-123')).toBe('/liquor/abc-123');
    expect(routes.category.edit('xyz')).toBe('/category/edit/xyz');
  });

  it('タグ名を URL エンコードする', () => {
    expect(routes.discovery.tag('辛口 日本酒')).toBe(
      '/discovery/tag/%E8%BE%9B%E5%8F%A3%20%E6%97%A5%E6%9C%AC%E9%85%92',
    );
  });

  it('検索クエリを URL エンコードする', () => {
    expect(routes.discovery.searchWithQuery('梅酒&焼酎')).toBe(
      '/discovery/search?q=%E6%A2%85%E9%85%92%26%E7%84%BC%E9%85%8E',
    );
  });

  it('liquor.create は categoryId の有無でパスが変わる', () => {
    expect(routes.liquor.create()).toBe('/liquor/create');
    expect(routes.liquor.create('cat-1')).toBe('/liquor/create/cat-1');
  });
});
