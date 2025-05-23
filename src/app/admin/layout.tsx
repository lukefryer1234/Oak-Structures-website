
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context'; // Keep useAuth to manage loading state

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading: authLoading, currentUser } = useAuth(); // Use authLoading

  // For development: Admin access is temporarily open once auth state is resolved.
  // In production, implement robust role-based access control.
  const isUserAdmin = () => {
    // return true; // Previous bypass for all users
    if (!currentUser) return false;
    // Define your admin emails or roles here
    const adminEmails = ["luke@mcconversions.uk", "admin@timberline.com"]; // Example
    return adminEmails.includes(currentUser.email || "");
  };

  const isAdmin = isUserAdmin(); // This check will be used after loading

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-muted/20">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading User Information...</p>
      </div>
    );
  }

  // Once auth loading is complete, check if the user is an admin or if access is open for dev
  const effectiveIsAdmin = true; // TEMPORARY BYPASS FOR DEVELOPMENT as per last request

  if (!effectiveIsAdmin) {
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

  // If admin access is granted (or bypassed for dev)
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-muted/20">
       {/* The prominent yellow banner for testing if layout updates are seen - REMOVE FOR PRODUCTION */}
       {/* <h2 style={{ position: 'fixed', top: '5px', left: '5px', backgroundColor: 'yellow', color: 'black', padding: '10px', zIndex: 9999 }}>ADMIN LAYOUT UPDATED - {new Date().toLocaleTimeString()}</h2> */}
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
