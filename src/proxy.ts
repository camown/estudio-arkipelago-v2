import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight in-memory token bucket rate limiter for Edge / Node runtime
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute per IP on sensitive routes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count += 1;
  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit protection on /api routes
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'anonymous';
    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Too Many Requests. Please slow down.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }
  }

  // If user visits root path /, redirect to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Security headers & basic request handling
  const response = NextResponse.next();
  response.headers.set('x-frame-options', 'SAMEORIGIN');
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/',
    '/api/:path*',
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

