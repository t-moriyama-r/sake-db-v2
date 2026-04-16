import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function GET() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  const state = crypto.randomBytes(16).toString('base64url');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.X_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/x/callback`,
    scope: 'users.read tweet.read',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const response = NextResponse.redirect(
    `https://twitter.com/i/oauth2/authorize?${params}`,
  );
  response.cookies.set('x_oauth_state', state, {
    httpOnly: true, sameSite: 'lax', maxAge: 600, path: '/',
  });
  response.cookies.set('x_oauth_code_verifier', codeVerifier, {
    httpOnly: true, sameSite: 'lax', maxAge: 600, path: '/',
  });

  return response;
}
