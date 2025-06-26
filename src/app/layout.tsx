
"use client"

import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from '@/contexts/CartContext';

const queryClient = new QueryClient();

const interSans = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const interMono = Inter({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${interSans.variable} ${interMono.variable} antialiased flex flex-col min-h-screen`}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              <SiteHeader />
              <main className="flex-grow">
                <div className="config-page-background">
                  {children}
                </div>
              </main>
              <SiteFooter />
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
