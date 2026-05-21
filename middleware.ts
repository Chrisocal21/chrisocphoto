import { NextRequest, NextResponse } from 'next/server';

async function expectedToken(password: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('chrisocphoto-admin'));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin')) return NextResponse.next();

  // Let the login page and login API through
  if (req.nextUrl.pathname === '/admin/login') return NextResponse.next();
  if (req.nextUrl.pathname.startsWith('/api/admin/login')) return NextResponse.next();

  const adminPassword = process.env.ADMIN_PASSWORD ?? '';
  const session = req.cookies.get('admin_session')?.value ?? '';

  if (adminPassword && session === await expectedToken(adminPassword)) {
    return NextResponse.next();
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = '/admin/login';
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
