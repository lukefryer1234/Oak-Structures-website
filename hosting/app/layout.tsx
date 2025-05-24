
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Changed from Geist_Sans, Geist_Mono
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteProvider } from "@/components/layout/site-provider";
import { BackgroundImage } from "@/components/layout/background-image";
import { AuthProvider } from "@/context/auth-context"; // Import AuthProvider
import { BasketProvider } from "@/context/basket-context"; // Import BasketProvider

const interSans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans", // Keep CSS variable name for compatibility
});

const interMono = Inter({
  subsets: ["latin"],
  variable: "--font-geist-mono", // Keep CSS variable name for compatibility
});

export const metadata: Metadata = {
  title: "Timberline Commerce",
  description: "Custom timber products and structures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${interSans.variable} ${interMono.variable} font-sans antialiased`}
      >
        <SiteProvider>
          <AuthProvider> {/* Wrap with AuthProvider */}
            <BasketProvider> {/* Wrap with BasketProvider */}
              <BackgroundImage>
                <div className="relative flex min-h-screen flex-col">
                  <SiteHeader />
                  <main className="flex-1">{children}</main>
                  <SiteFooter />
                </div>
              </BackgroundImage>
            </BasketProvider>
          </AuthProvider>
          <Toaster />
        </SiteProvider>
      </body>
    </html>
  );
}
