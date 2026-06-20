import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { routes } from '@/lib/routes';
import { encryptXSession } from '@/lib/server/x-session';

export const runtime = 'nodejs';

const cognito = new CognitoIdentityProviderClient({ region: 'ap-northeast-1' });
const USER_POOL_ID = 'ap-northeast-1_CqSONoI3Y';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('x_oauth_state')?.value;
  const codeVerifier = request.cookies.get('x_oauth_code_verifier')?.value;

  if (!code || !state || state !== storedState || !codeVerifier) {
    return NextResponse.redirect(new URL(`${routes.auth.login()}?error=oauth_failed`, request.url));
  }

  const xUser = await exchangeCodeForUser(code, codeVerifier, request.url);
  if (!xUser) {
    return NextResponse.redirect(new URL(`${routes.auth.login()}?error=oauth_failed`, request.url));
  }

  const username = `x_${xUser.id}`;
  await ensureCognitoUser(username, xUser.name);

  const token = encryptXSession({
    username,
    xUserId: xUser.id,
    xName: xUser.name,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  const response = NextResponse.redirect(new URL(routes.auth.xComplete(), request.url));
  response.cookies.set('x_session', token, {
    httpOnly: true, sameSite: 'lax', maxAge: 300, path: '/',
  });
  response.cookies.delete('x_oauth_state');
  response.cookies.delete('x_oauth_code_verifier');

  return response;
}

type XUser = { id: string; name: string };

async function exchangeCodeForUser(code: string, codeVerifier: string, requestUrl: string): Promise<XUser | null> {
  try {
    const appUrl = new URL(requestUrl).origin;
    const credentials = Buffer.from(
      `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`,
    ).toString('base64');

    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${appUrl}/api/auth/x/callback`,
        code_verifier: codeVerifier,
      }),
    });
    if (!tokenRes.ok) return null;
    const { access_token } = await tokenRes.json() as { access_token: string };

    const userRes = await fetch(
      'https://api.twitter.com/2/users/me?user.fields=profile_image_url',
      { headers: { Authorization: `Bearer ${access_token}` } },
    );
    if (!userRes.ok) return null;
    const { data } = await userRes.json() as { data: { id: string; name: string } };

    return { id: data.id, name: data.name };
  } catch {
    return null;
  }
}

async function ensureCognitoUser(username: string, displayName: string): Promise<void> {
  try {
    await cognito.send(new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: username }));
  } catch {
    await cognito.send(new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      MessageAction: 'SUPPRESS',
      UserAttributes: [
        { Name: 'name', Value: displayName },
        { Name: 'email', Value: `${username}@x-auth.internal` },
        { Name: 'email_verified', Value: 'true' },
      ],
    }));
    // CONFIRMED 状態にしてCustom Auth Flowで認証できるようにする
    await cognito.send(new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      Password: crypto.randomBytes(16).toString('base64') + 'Aa1!',
      Permanent: true,
    }));
  }
}
