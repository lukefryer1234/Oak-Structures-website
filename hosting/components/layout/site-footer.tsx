"use client";

import Link from 'next/link';
import { Building } from 'lucide-react';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40">
      {/* Reduced vertical padding py-8 md:py-12 to py-4 md:py-6 */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Building className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Timberline Commerce</span>
          </div>
          <div className="text-sm text-muted-foreground text-center md:text-right">
             <p>&copy; {currentYear} Timberline Commerce. All rights reserved.</p>
             {/* Add more footer links here if needed */}
             {/* Example:
             <nav className="mt-2 flex gap-4 justify-center md:justify-end">
               <Link href="/privacy-policy" className="hover:text-foreground">Privacy Policy</Link>
               <Link href="/terms-of-service" className="hover:text-foreground">Terms of Service</Link>
             </nav>
            */}
          </div>
        </div>
      </div>
    </footer>
  );
}
