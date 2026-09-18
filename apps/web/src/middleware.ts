import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  checkRateLimit,
  getRateLimitHeaders,
  RateLimitCategory,
} from '@legalhub/utils';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply API rate limiting to /api/* routes
  if (pathname.startsWith('/api/')) {
    let category: RateLimitCategory = 'default';

    if (pathname.startsWith('/api/payments/')) {
      category = 'payments';
    } else if (pathname.startsWith('/api/admin/')) {
      category = 'admin';
    } else if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/otp')) {
      category = 'auth';
    } else if (pathname.startsWith('/api/documents/')) {
      category = 'documents';
    }

    // Identify client by forwarded IP, auth header or fallback
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0]!.trim() : '127.0.0.1';
    const userId = request.headers.get('x-user-id');
    const identifier = userId || ip;

    const rateLimitResult = checkRateLimit(identifier, category);
    const headers = getRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please slow down and try again later.',
          retryAfterSeconds: rateLimitResult.retryAfterSeconds,
        },
        {
          status: 429,
          headers,
        }
      );
    }

    const response = NextResponse.next();
    // Attach rate limit headers to response
    for (const [k, v] of Object.entries(headers)) {
      response.headers.set(k, v);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
