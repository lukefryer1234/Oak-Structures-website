
"use client";

// import Link from 'next/link'; // Link is unused
import { Building } from 'lucide-react';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Building className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Timberline Commerce</span>
          </div>
          <div className="text-sm text-muted-foreground text-center md:text-right">
             <p>&copy; {currentYear} Timberline Commerce. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
