export const routes = {
  home: () => '/',
  liquor: {
    detail: (id: string) => `/liquor/${id}`,
    edit: (id: string) => `/liquor/edit/${id}`,
    create: (categoryId?: string) =>
      categoryId ? `/liquor/create/${categoryId}` : '/liquor/create',
  },
  category: {
    detail: (id: string) => `/category/${id}`,
    edit: (id: string) => `/category/edit/${id}`,
    create: (parentCategoryId: string) => `/category/create/${parentCategoryId}`,
  },
  discovery: {
    category: (id: string) => `/discovery/category/${id}`,
    search: () => '/discovery/search',
    searchWithQuery: (q: string) => `/discovery/search?q=${encodeURIComponent(q)}`,
    tag: (tag: string) => `/discovery/tag/${encodeURIComponent(tag)}`,
  },
  mypage: {
    index: () => '/mypage',
    edit: () => '/mypage/edit',
  },
  user: (id: string) => `/user/${id}`,
  admin: () => '/admin',
  auth: {
    login: () => '/login',
    register: () => '/register',
    passwordReset: () => '/password-reset',
    passwordResetExe: () => '/password-reset-exe',
    xLogin: () => '/api/auth/x/login',
    xComplete: () => '/x/complete',
  },
};
