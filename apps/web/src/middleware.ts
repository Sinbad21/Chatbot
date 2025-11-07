import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect dashboard routes (excluding API calls and static files)
  if (pathname.startsWith('/dashboard')) {
    // Check for auth cookie (set during login)
    const authCookie = request.cookies.get('auth_session');

    // If no auth cookie, redirect to login
    if (!authCookie || authCookie.value !== 'true') {
      const loginUrl = new URL('/auth/login', request.url);
      // Prevent redirect loops
      if (pathname !== '/auth/login') {
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
// Exclude _next/static, _next/image, favicon.ico
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
