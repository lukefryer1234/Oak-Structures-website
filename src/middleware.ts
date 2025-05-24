import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public paths that don't require authentication
const publicPaths = [
  '/',
  '/about',
  '/contact',
  '/gallery', 
  '/faq',
  '/special-deals',
  '/terms',
  '/privacy',
  '/login',
  '/register', 
  '/forgot-password',
  '/auth-test',
];

// Check if path is a product page (should be public)
function isProductPath(pathname: string): boolean {
  return pathname.startsWith('/products/') || pathname === '/products';
}

// Check if path is public
function isPublicPath(pathname: string): boolean {
  if (isProductPath(pathname)) return true;
  return publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow all public paths and product pages
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // For protected paths, let the client-side auth handle redirects
  // This middleware only handles server-side route protection
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
