'use client';

import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  // Always render children for public routes regardless of auth state
  return <>{children}</>;
}
