// src/app/admin/layout.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Temporarily bypass all auth and role checks for initial simplified launch
  // The actual admin panel functionality is deferred.

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
            For now, this section is a placeholder.
          </p>
          {/* Render children if any admin sub-page is directly navigated to, 
              but they will also be simplified to "Coming Soon" */}
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
