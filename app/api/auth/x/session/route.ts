import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { decryptXSession } from '@/lib/server/x-session';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('x_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'no session' }, { status: 401 });
  }

  const payload = decryptXSession(token);
  if (!payload) {
    return NextResponse.json({ error: 'invalid session' }, { status: 401 });
  }

  const response = NextResponse.json({
    username: payload.username,
    xUserId: payload.xUserId,
    xName: payload.xName,
  });
  response.cookies.delete('x_session');

  return response;
}
