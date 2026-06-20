import { cookies } from 'next/headers';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const outputs = require('@/amplify_outputs.json');

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
  console.log('[getServerUser] clientId:', clientId);
  if (!clientId) return null;

  const cookieStore = await cookies();
  const allCookieNames = cookieStore.getAll().map((c) => c.name);
  console.log('[getServerUser] all cookie names:', allCookieNames);

  const lastUser = cookieStore.get(
    `CognitoIdentityServiceProvider.${clientId}.LastAuthUser`,
  )?.value;
  console.log('[getServerUser] lastUser:', lastUser);
  if (!lastUser) return null;

  const accessToken = cookieStore.get(
    `CognitoIdentityServiceProvider.${clientId}.${lastUser}.accessToken`,
  )?.value;
  console.log('[getServerUser] accessToken found:', !!accessToken);
  if (!accessToken) return null;

  try {
    const payload = decodeJwtPayload(accessToken);
    const exp = payload.exp as number;
    if (exp * 1000 < Date.now()) {
      console.log('[getServerUser] token expired');
      return null;
    }

    const groups = (payload['cognito:groups'] as string[] | undefined) ?? [];
    return {
      id: payload.sub as string,
      username: lastUser,
      isAdmin: groups.includes('admin'),
    };
  } catch (e) {
    console.log('[getServerUser] error:', e);
    return null;
  }
}
