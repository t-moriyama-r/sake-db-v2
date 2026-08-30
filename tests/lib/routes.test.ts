import { describe, it, expect } from 'vitest';
import { routes } from '@/lib/routes';

describe('routes', () => {
  it('home は "/" を返す', () => {
    expect(routes.home()).toBe('/');
  });

  describe('liquor', () => {
    it('detail は "/liquor/{id}" を返す', () => {
      expect(routes.liquor.detail('abc')).toBe('/liquor/abc');
    });

    it('edit は "/liquor/edit/{id}" を返す', () => {
      expect(routes.liquor.edit('abc')).toBe('/liquor/edit/abc');
    });

    it('create は categoryId なしのとき "/liquor/create" を返す', () => {
      expect(routes.liquor.create()).toBe('/liquor/create');
    });

    it('create は categoryId ありのとき "/liquor/create/{categoryId}" を返す', () => {
      expect(routes.liquor.create('cat-1')).toBe('/liquor/create/cat-1');
    });
  });

  describe('category', () => {
    it('detail は "/category/{id}" を返す', () => {
      expect(routes.category.detail('cat-1')).toBe('/category/cat-1');
    });

    it('edit は "/category/edit/{id}" を返す', () => {
      expect(routes.category.edit('cat-1')).toBe('/category/edit/cat-1');
    });

    it('create は "/category/create/{parentCategoryId}" を返す', () => {
      expect(routes.category.create('parent-1')).toBe('/category/create/parent-1');
    });
  });

  describe('discovery', () => {
    it('category は "/discovery/category/{id}" を返す', () => {
      expect(routes.discovery.category('cat-1')).toBe('/discovery/category/cat-1');
    });

    it('search は "/discovery/search" を返す', () => {
      expect(routes.discovery.search()).toBe('/discovery/search');
    });

    it('searchWithQuery はクエリパラメータ付きで返す', () => {
      expect(routes.discovery.searchWithQuery('日本酒')).toBe(
        '/discovery/search?q=%E6%97%A5%E6%9C%AC%E9%85%92',
      );
    });

    it('tag はURLエンコードされたパスを返す', () => {
      expect(routes.discovery.tag('辛口')).toBe('/discovery/tag/%E8%BE%9B%E5%8F%A3');
    });
  });

  describe('mypage', () => {
    it('index は "/mypage" を返す', () => {
      expect(routes.mypage.index()).toBe('/mypage');
    });

    it('edit は "/mypage/edit" を返す', () => {
      expect(routes.mypage.edit()).toBe('/mypage/edit');
    });
  });

  it('user は "/user/{id}" を返す', () => {
    expect(routes.user('user-1')).toBe('/user/user-1');
  });

  it('admin は "/admin" を返す', () => {
    expect(routes.admin()).toBe('/admin');
  });

  describe('auth', () => {
    it('login は "/login" を返す', () => {
      expect(routes.auth.login()).toBe('/login');
    });

    it('register は "/register" を返す', () => {
      expect(routes.auth.register()).toBe('/register');
    });

    it('passwordReset は "/password-reset" を返す', () => {
      expect(routes.auth.passwordReset()).toBe('/password-reset');
    });

    it('passwordResetExe は "/password-reset-exe" を返す', () => {
      expect(routes.auth.passwordResetExe()).toBe('/password-reset-exe');
    });

    it('xLogin は "/api/auth/x/login" を返す', () => {
      expect(routes.auth.xLogin()).toBe('/api/auth/x/login');
    });

    it('xComplete は "/x/complete" を返す', () => {
      expect(routes.auth.xComplete()).toBe('/x/complete');
    });
  });
});
