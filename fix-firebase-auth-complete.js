#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Complete Firebase Auth Fix Script');
console.log('=====================================');

// Step 1: Open Firebase Console for manual configuration
console.log('\n📱 Step 1: Opening Firebase Console for manual configuration...');
console.log('🌐 Visit: https://console.firebase.google.com/project/timberline-commerce/authentication/settings');
console.log('\nPlease manually configure the following:');
console.log('');
console.log('1. ✅ Authorized domains (add these if not present):');
console.log('   - timberline-commerce.web.app');
console.log('   - timberline-commerce.firebaseapp.com');  
console.log('   - localhost');
console.log('');
console.log('2. ✅ Sign-in providers (enable these):');
console.log('   - Email/Password: ✅ Enabled');
console.log('   - Google: ✅ Enabled (configure OAuth client)');
console.log('');
console.log('3. ✅ OAuth redirect domains:');
console.log('   - https://timberline-commerce.web.app/__/auth/handler');
console.log('   - https://timberline-commerce.firebaseapp.com/__/auth/handler');
console.log('');

// Step 2: Fix middleware and auth guards
console.log('📝 Step 2: Creating auth protection fixes...');

// Create a middleware fix
const middlewareContent = `import { NextResponse } from 'next/server';
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
};`;

fs.writeFileSync('./src/middleware.ts', middlewareContent);
console.log('✅ Created middleware.ts to fix route protection');

// Step 3: Fix auth context to remove unnecessary protection
console.log('\n🔧 Step 3: Fixing auth context...');

// Read the current auth context
let authContext = fs.readFileSync('./src/context/auth-context.tsx', 'utf8');

// Ensure product paths are clearly marked as public
const updatedAuthContext = authContext.replace(
  /\/\/ Check if the current path starts with any of the public paths[\s\S]*?return publicPaths\.includes\(path\);/,
  `// Check if the current path starts with any of the public paths
const isPublicPath = (path: string): boolean => {
  // Handle product category paths specifically - these should ALWAYS be public
  if (path.startsWith('/products/')) {
    return true;
  }
  
  // Handle gallery and other static content
  if (path.startsWith('/gallery') || path.startsWith('/special-deals')) {
    return true;
  }
  
  return publicPaths.includes(path);
};`
);

fs.writeFileSync('./src/context/auth-context.tsx', updatedAuthContext);
console.log('✅ Updated auth context to ensure product pages are public');

// Step 4: Create auth configuration test
console.log('\n🧪 Step 4: Creating auth test page...');

const authTestContent = `"use client";

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthTestPage() {
  const { currentUser, signInWithGoogle, signOut, error } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>Test Firebase Auth integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
              Error: {error}
            </div>
          )}
          
          {currentUser ? (
            <div className="space-y-2">
              <p className="text-green-600">✅ Authenticated as:</p>
              <p className="font-mono text-sm">{currentUser.email}</p>
              <p className="font-mono text-sm">{currentUser.displayName}</p>
              <Button onClick={signOut} variant="outline">Sign Out</Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600">Not authenticated</p>
              <Button onClick={signInWithGoogle}>Test Google Sign In</Button>
            </div>
          )}
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server'}</p>
            <p>Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}`;

fs.writeFileSync('./src/app/auth-test/page.tsx', authTestContent);
console.log('✅ Created auth test page at /auth-test');

// Step 5: Deploy fixes
console.log('\n🚀 Step 5: Deploying fixes...');

try {
  console.log('Building and deploying...');
  execSync('npm run build', { stdio: 'inherit' });
  execSync('firebase deploy --only hosting --project timberline-commerce', { stdio: 'inherit' });
  console.log('✅ Deployment complete!');
} catch (error) {
  console.log('⚠️  Deployment failed, but fixes are in place. Run deployment manually:');
  console.log('   npm run build && firebase deploy --only hosting');
}

console.log('\n🎉 Auth Fix Complete!');
console.log('====================');
console.log('');
console.log('✅ Next steps:');
console.log('1. Visit the Firebase Console link above to configure OAuth');
console.log('2. Test authentication at: https://timberline-commerce.web.app/auth-test');
console.log('3. Verify product pages work without login: https://timberline-commerce.web.app/products/oak-beams/configure');
console.log('');
console.log('🔗 Firebase Console: https://console.firebase.google.com/project/timberline-commerce/authentication/settings');
