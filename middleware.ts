import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const outputs = require('./amplify_outputs.json');

const CLIENT_ID: string = outputs?.auth?.user_pool_client_id ?? '';

/** Amplify SSR モードが保存する Cookie からアクセストークンを取得する。 */
function getAccessToken(request: NextRequest): string | undefined {
  const lastUser = request.cookies.get(
    `CognitoIdentityServiceProvider.${CLIENT_ID}.LastAuthUser`,
  )?.value;
  if (!lastUser) return undefined;

  return request.cookies.get(
    `CognitoIdentityServiceProvider.${CLIENT_ID}.${lastUser}.accessToken`,
  )?.value;
}

function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(),
    );
    return (payload.exp as number) * 1000 > Date.now();
  } catch {
    return false;
  }
}

function getGroups(token: string): string[] {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(),
    );
    return (payload['cognito:groups'] as string[] | undefined) ?? [];
  } catch {
    return [];
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = getAccessToken(request);
  const isAuthenticated = !!token && isTokenValid(token);

  // 要ログインルート
  const requiresAuth = [
    '/liquor/create',
    '/liquor/edit',
    '/mypage',
  ].some((p) => pathname.startsWith(p));

  if (requiresAuth && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 要 admin ルート
  const requiresAdmin = [
    '/admin',
    '/category/create',
    '/category/edit',
  ].some((p) => pathname.startsWith(p));

  if (requiresAdmin) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    const groups = getGroups(token!);
    if (!groups.includes('admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/liquor/create/:path*',
    '/liquor/edit/:path*',
    '/mypage/:path*',
    '/admin/:path*',
    '/category/create/:path*',
    '/category/edit/:path*',
  ],
};
