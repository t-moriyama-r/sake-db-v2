import { cookies } from 'next/headers';
import outputs from '@/amplify_outputs.json';

export type ServerUser = {
  id: string;
  username: string;
  isAdmin: boolean;
};

function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
}

/**
 * Amplify が SSR モードで保存した Cognito Cookie からサーバー側ユーザーを取得する。
 * トークンが存在しない・期限切れの場合は null を返す。
 */
export async function getServerUser(): Promise<ServerUser | null> {
  const clientId: string | undefined = outputs?.auth?.user_pool_client_id;
  if (!clientId) return null;

  const cookieStore = await cookies();

  const lastUser = cookieStore.get(
    `CognitoIdentityServiceProvider.${clientId}.LastAuthUser`,
  )?.value;
  if (!lastUser) return null;

  const accessToken = cookieStore.get(
    `CognitoIdentityServiceProvider.${clientId}.${lastUser}.accessToken`,
  )?.value;
  if (!accessToken) return null;

  try {
    const payload = decodeJwtPayload(accessToken);
    const exp = payload.exp as number;
    if (exp * 1000 < Date.now()) {
      return null;
    }

    const groups = (payload['cognito:groups'] as string[] | undefined) ?? [];
    return {
      id: payload.sub as string,
      username: lastUser,
      isAdmin: groups.includes('admin'),
    };
  } catch {
    console.error('getServerUser: 認証トークンの検証に失敗しました');
    return null;
  }
}

/**
 * Cookieのアクセストークンをそのまま返す。
 * トークンが存在しない・期限切れの場合は null を返す。
 */
export async function getServerAccessToken(): Promise<string | null> {
  const clientId: string | undefined = outputs?.auth?.user_pool_client_id;
  if (!clientId) return null;

  const cookieStore = await cookies();

  const lastUser = cookieStore.get(
    `CognitoIdentityServiceProvider.${clientId}.LastAuthUser`,
  )?.value;
  if (!lastUser) return null;

  const accessToken = cookieStore.get(
    `CognitoIdentityServiceProvider.${clientId}.${lastUser}.accessToken`,
  )?.value;
  if (!accessToken) return null;

  try {
    const payload = decodeJwtPayload(accessToken);
    const exp = payload.exp as number;
    if (exp * 1000 < Date.now()) return null;
    return accessToken;
  } catch {
    console.error('getServerAccessToken: 認証トークンの検証に失敗しました');
    return null;
  }
}

export type ServerUserProfile = {
  id: string;
  name: string;
  email: string;
  profile?: string;
  imageBase64?: string;
};

/**
 * CookieのidTokenからユーザー属性（name, email, profile, imageBase64）を取得する。
 * トークンが存在しない・期限切れの場合は null を返す。
 */
export async function getServerUserProfile(): Promise<ServerUserProfile | null> {
  const clientId: string | undefined = outputs?.auth?.user_pool_client_id;
  if (!clientId) return null;

  const cookieStore = await cookies();
  const lastUser = cookieStore.get(
    `CognitoIdentityServiceProvider.${clientId}.LastAuthUser`,
  )?.value;
  if (!lastUser) return null;

  const idToken = cookieStore.get(
    `CognitoIdentityServiceProvider.${clientId}.${lastUser}.idToken`,
  )?.value;
  if (!idToken) return null;

  try {
    const payload = decodeJwtPayload(idToken);
    const exp = payload.exp as number;
    if (exp * 1000 < Date.now()) return null;

    return {
      id: payload.sub as string,
      name: (payload.name as string) ?? '',
      email: (payload.email as string) ?? '',
      profile: payload.profile as string | undefined,
      imageBase64: payload['custom:imageBase64'] as string | undefined,
    };
  } catch {
    console.error('getServerUserProfile: 認証トークンの検証に失敗しました');
    return null;
  }
}
