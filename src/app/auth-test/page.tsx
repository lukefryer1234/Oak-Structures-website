"use client";

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
}
