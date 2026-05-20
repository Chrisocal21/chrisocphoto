import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin')) return NextResponse.next();

  const auth = req.headers.get('authorization') ?? '';
  if (auth.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6));
      // Accept any username; password must match ADMIN_PASSWORD
      const password = decoded.split(':').slice(1).join(':');
      if (password === process.env.ADMIN_PASSWORD) return NextResponse.next();
    } catch { /* malformed header */ }
  }

  return new NextResponse('Admin access required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="chrisocphoto"' },
  });
}

export const config = { matcher: ['/admin/:path*'] };
