import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register');
    const isApiRoute = req.nextUrl.pathname.startsWith('/api');

    // Skip middleware for API routes (handled by individual API routes)
    if (isApiRoute) {
      return NextResponse.next();
    }

    // Allow access to public pages without authentication
    if (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/seed' || req.nextUrl.pathname === '/debug') {
      return NextResponse.next();
    }

    // Allow access to auth pages for everyone
    if (isAuthPage) {
      return NextResponse.next();
    }

    // Require authentication for all other pages
    if (!isAuth) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Role-based access control for authenticated users
    const userRole = token.role as string;
    const pathname = req.nextUrl.pathname;

    // Customer-only pages
    if (pathname.startsWith('/providers') && userRole !== 'customer') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Provider-only restrictions can be added here if needed

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (req.nextUrl.pathname === '/' ||
            req.nextUrl.pathname === '/seed' ||
            req.nextUrl.pathname === '/debug' ||
            req.nextUrl.pathname.startsWith('/login') ||
            req.nextUrl.pathname.startsWith('/register') ||
            req.nextUrl.pathname.startsWith('/api')) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
