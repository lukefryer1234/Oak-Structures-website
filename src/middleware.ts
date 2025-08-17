import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that are accessible to everyone, regardless of auth status
const publicPaths = [
  '/',
  '/about',
  '/contact',
  '/gallery', 
  '/faq',
  '/special-deals',
  '/terms',
  '/privacy',
  '/products', // All product-related paths are public
];

// Define paths that are part of the authentication flow
const authPaths = [
  '/login',
  '/register',
  '/forgot-password',
];

// Helper to check if a path is public
const isPublic = (path: string) => {
  return publicPaths.some(p => path === p || path.startsWith(p + '/'));
};

// Helper to check if a path is for authentication
const isAuthPath = (path: string) => {
  return authPaths.includes(path);
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  const isApiRoute = pathname.startsWith('/api');

  // Allow all API routes to pass through; they have their own authentication checks
  if (isApiRoute) {
    return NextResponse.next();
  }

  // If the user is authenticated (has a session cookie)
  if (sessionCookie) {
    // If they are trying to access an auth page (like login), redirect to their account
    if (isAuthPath(pathname)) {
      const accountUrl = new URL('/account/profile', request.url);
      return NextResponse.redirect(accountUrl);
    }
  }
  // If the user is not authenticated (no session cookie)
  else {
    // And they are trying to access a protected route (not public and not an auth route)
    if (!isPublic(pathname) && !isAuthPath(pathname)) {
      // Redirect them to the login page, preserving the intended destination
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow the request to proceed for all other cases
  // (e.g., public paths, or protected paths for authenticated users)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
