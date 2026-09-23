import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If user visits root path /, redirect to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Security headers & basic request handling
  const response = NextResponse.next();
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/projects/:path*',
    '/calendar/:path*',
    '/chat/:path*',
    '/directory/:path*',
    '/hr/:path*',
    '/sketch/:path*',
    '/settings/:path*',
  ],
};
