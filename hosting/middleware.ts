import { NextResponse, NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Define protected path patterns
const ADMIN_PATHS = /^\/admin(\/.*)?$/;
const ACCOUNT_PATHS = /^\/account(\/.*)?$/;
const CHECKOUT_PATHS = /^\/checkout(\/.*)?$/;

// Admin email list - in production, this should come from environment variables
const ADMIN_EMAILS = ['luke@mcconversions.uk', 'admin@timberline.com'];

// JWT decode result interface
interface FirebaseJwtPayload {
  name?: string;
  email?: string;
  email_verified?: boolean;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  firebase: {
    identities: {
      email?: string[];
      [key: string]: any;
    };
    sign_in_provider: string;
  };
  [key: string]: any; // For custom claims
}

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;
  
  // Create URL to redirect to if auth check fails
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  
  // Get Firebase ID token from cookie
  // Firebase stores the ID token in the '__session' cookie by default
  const firebaseToken = request.cookies.get('__session')?.value;
  
  // Basic check if the user is authenticated (token exists)
  const isAuthenticated = !!firebaseToken;
  
  // If not authenticated and trying to access protected routes
  if (!isAuthenticated && (ACCOUNT_PATHS.test(pathname) || CHECKOUT_PATHS.test(pathname) || ADMIN_PATHS.test(pathname))) {
    console.log(`[Middleware] Unauthenticated access attempt to ${pathname}`);
    return NextResponse.redirect(loginUrl);
  }
  
  // For admin paths, we need to do additional role checking
  if (ADMIN_PATHS.test(pathname) && isAuthenticated) {
    try {
      // Decode the JWT to get basic user information
      // Note: This is NOT a cryptographic verification - that happens server-side
      // This is just to avoid unnecessary redirects for non-admin users
      const decodedToken = jwtDecode<FirebaseJwtPayload>(firebaseToken);
      
      // Check if user has admin access (by email for now)
      const userEmail = decodedToken.email;
      const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);
      
      // Alternative approach would be to check custom claims:
      // const isAdmin = decodedToken.admin === true;
      
      if (!isAdmin) {
        console.log(`[Middleware] Unauthorized admin access attempt by ${userEmail}`);
        // Redirect to home with error
        const homeUrl = new URL('/', request.url);
        homeUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(homeUrl);
      }
    } catch (error) {
      console.error('[Middleware] Token decode error:', error);
      // If we can't decode the token, redirect to login
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // For all other routes, allow the request to proceed
  return NextResponse.next();
}

// For development/testing without authentication
// export function middleware(request: NextRequest) {
//   // Allow all requests during development
//   return NextResponse.next();
// }

// Define which paths this middleware should run on
export const config = {
  matcher: [
    // Match all admin routes
    '/admin/:path*',
    // Match all account routes
    '/account/:path*',
    // Match checkout routes
    '/checkout/:path*',
  ],
};

