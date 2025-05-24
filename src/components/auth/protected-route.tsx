'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Only redirect if not loading and user is not authenticated
    if (!loading && !currentUser) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [currentUser, loading, router, pathname]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  // If not loading and user is authenticated, render children
  return currentUser ? <>{children}</> : null;
}
