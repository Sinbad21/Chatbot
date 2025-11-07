import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if accessing dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Check for auth cookie
    const authCookie = request.cookies.get('auth_session');

    // If no auth cookie, redirect to login
    if (!authCookie) {
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
