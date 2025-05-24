
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading: authLoading, currentUser } = useAuth();

  // Define admin permissions properly
  const isUserAdmin = () => {
    if (!currentUser) return false;
    // Define your admin emails
    const adminEmails = ["luke@mcconversions.uk", "admin@timberline.com"];
    return adminEmails.includes(currentUser.email || "");
  };

  // Use proper authentication - no more temporary bypass
  const isAdmin = isUserAdmin();

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-muted/20">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading User Information...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-muted/20">
        <Card className="w-full max-w-lg bg-card shadow-xl">
          <CardHeader className="text-center">
            <ShieldAlert className="h-16 w-16 mx-auto text-destructive mb-4" />
            <CardTitle className="text-2xl md:text-3xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You do not have permission to view this page. Please log in with an administrator account.
            </p>
            <Button asChild className="mt-6">
              <Link href="/login?redirect=/admin">Login</Link>
            </Button>
            <Button variant="outline" asChild className="mt-2 sm:mt-0 sm:ml-2">
              <Link href="/">Return to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If admin access is granted
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-2xl bg-card shadow-xl">
        <CardHeader className="text-center">
          <ShieldAlert className="h-16 w-16 mx-auto text-primary mb-4" />
          <CardTitle className="text-2xl md:text-3xl">Admin Area - Under Construction</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            The full admin panel with management tools for orders, products, pricing, and site settings is currently under development and will be available in a future update.
          </p>
          <p className="text-muted-foreground">
            For now, this section is a placeholder. Some sub-pages might be accessible for direct development.
          </p>
          <div className="mt-6 p-4 border rounded-md bg-background/50">
            {children}
          </div>
          <Button asChild className="mt-6">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
