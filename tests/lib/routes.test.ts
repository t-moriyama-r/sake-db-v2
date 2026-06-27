import { describe, it, expect } from 'vitest';
import { routes } from '@/lib/routes';

describe('routes.home', () => {
  it("'/'を返す", () => {
    expect(routes.home()).toBe('/');
  });
});

describe('routes.liquor', () => {
  it('detail: /liquor/{id}を返す', () => {
    expect(routes.liquor.detail('abc123')).toBe('/liquor/abc123');
  });

  it('edit: /liquor/edit/{id}を返す', () => {
    expect(routes.liquor.edit('abc123')).toBe('/liquor/edit/abc123');
  });

  it('create: categoryIdなしで/liquor/createを返す', () => {
    expect(routes.liquor.create()).toBe('/liquor/create');
  });

  it('create: categoryIdありで/liquor/create/{id}を返す', () => {
    expect(routes.liquor.create('cat001')).toBe('/liquor/create/cat001');
  });
});

describe('routes.category', () => {
  it('detail: /category/{id}を返す', () => {
    expect(routes.category.detail('cat001')).toBe('/category/cat001');
  });

  it('edit: /category/edit/{id}を返す', () => {
    expect(routes.category.edit('cat001')).toBe('/category/edit/cat001');
  });

  it('create: /category/create/{parentId}を返す', () => {
    expect(routes.category.create('parent001')).toBe('/category/create/parent001');
  });
});

describe('routes.discovery', () => {
  it('category: /discovery/category/{id}を返す', () => {
    expect(routes.discovery.category('cat001')).toBe('/discovery/category/cat001');
  });

  it('search: /discovery/searchを返す', () => {
    expect(routes.discovery.search()).toBe('/discovery/search');
  });

  it('searchWithQuery: クエリをエンコードして返す', () => {
    expect(routes.discovery.searchWithQuery('日本酒')).toBe(
      '/discovery/search?q=%E6%97%A5%E6%9C%AC%E9%85%92',
    );
  });

  it('searchWithQuery: ASCIIのみのクエリはそのまま返す', () => {
    expect(routes.discovery.searchWithQuery('sake')).toBe('/discovery/search?q=sake');
  });

  it('searchWithQuery: スペースを%20にエンコードする', () => {
    expect(routes.discovery.searchWithQuery('日本 酒')).toBe(
      '/discovery/search?q=%E6%97%A5%E6%9C%AC%20%E9%85%92',
    );
  });

  it('tag: タグ名をURLエンコードして返す', () => {
    expect(routes.discovery.tag('純米大吟醸')).toBe(
      '/discovery/tag/%E7%B4%94%E7%B1%B3%E5%A4%A7%E5%90%9F%E9%86%B8',
    );
  });

  it('tag: ASCIIのみのタグはそのまま返す', () => {
    expect(routes.discovery.tag('junmai')).toBe('/discovery/tag/junmai');
  });

  it('tag: 特殊文字をエンコードする', () => {
    expect(routes.discovery.tag('sake & rice')).toBe('/discovery/tag/sake%20%26%20rice');
  });
});

describe('routes.mypage', () => {
  it('index: /mypageを返す', () => {
    expect(routes.mypage.index()).toBe('/mypage');
  });

  it('edit: /mypage/editを返す', () => {
    expect(routes.mypage.edit()).toBe('/mypage/edit');
  });
});

describe('routes.user', () => {
  it('/user/{id}を返す', () => {
    expect(routes.user('user001')).toBe('/user/user001');
  });
});

describe('routes.admin', () => {
  it('/adminを返す', () => {
    expect(routes.admin()).toBe('/admin');
  });
});

describe('routes.auth', () => {
  it('login: /loginを返す', () => {
    expect(routes.auth.login()).toBe('/login');
  });

  it('register: /registerを返す', () => {
    expect(routes.auth.register()).toBe('/register');
  });

  it('passwordReset: /password-resetを返す', () => {
    expect(routes.auth.passwordReset()).toBe('/password-reset');
  });

  it('passwordResetExe: /password-reset-exeを返す', () => {
    expect(routes.auth.passwordResetExe()).toBe('/password-reset-exe');
  });

  it('xLogin: /api/auth/x/loginを返す', () => {
    expect(routes.auth.xLogin()).toBe('/api/auth/x/login');
  });

  it('xComplete: /x/completeを返す', () => {
    expect(routes.auth.xComplete()).toBe('/x/complete');
  });
});
