import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

function sessionToken(password: string): string {
  return createHmac('sha256', password).update('chrisocphoto-admin').digest('hex');
}

export async function POST(req: NextRequest) {
  const { password } = await req.json() as { password?: string };
  const adminPassword = process.env.ADMIN_PASSWORD ?? '';

  if (!password || password !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = sessionToken(adminPassword);

  // Also store the expected token so middleware can compare without recomputing
  // (middleware can't use Node crypto, so we rely on ADMIN_SESSION_TOKEN env var
  //  OR compare against a freshly computed value in the API route and set it on the cookie)
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
