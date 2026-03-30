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

    const groups = (payload['cognito:groups'] as string[] | undefined) ?? [];
    return {
      id: payload.sub as string,
      username: lastUser,
      isAdmin: groups.includes('admin'),
    };
  } catch {
    return null;
  }
}
