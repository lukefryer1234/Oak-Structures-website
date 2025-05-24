'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  const routes = [
    { name: 'Home', path: '/' },
    { name: 'Garages', path: '/products/garages/configure' },
    { name: 'Gazebos', path: '/products/gazebos/configure' },
    { name: 'Porches', path: '/products/porches/configure' },
    { name: 'Oak Beams', path: '/products/oak-beams/configure' },
    { name: 'Oak Flooring', path: '/products/oak-flooring/configure' },
    { name: 'Special Deals', path: '/special-deals' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];
  
  return (
    <div className="block md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Menu">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px]">
          <div className="flex flex-col space-y-4 mt-8">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`text-lg py-2 ${
                  pathname === route.path ? 'text-primary font-bold' : 'text-foreground'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {route.name}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-2 px-4 flex justify-around">
        <Link href="/" aria-label="Home">
          <Button variant="ghost" size="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </Button>
        </Link>
        <Link href="/basket" aria-label="Shopping Cart">
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-6 w-6" />
          </Button>
        </Link>
        <Link href="/account" aria-label="Account">
          <Button variant="ghost" size="icon">
            <User className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

