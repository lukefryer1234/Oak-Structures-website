
"use client"; // Keep "use client" because we use hooks and client-side logic

import React from 'react';
import { User, ShoppingBag, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePathname } from 'next/navigation'; // Import usePathname

const accountNavLinks = [
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/orders", label: "Orders", icon: ShoppingBag },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
];

// TODO: Add authentication check here. Redirect if not logged in.

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Get current pathname using the hook

  // Updated isActive logic using pathname from the hook
  const isActive = (path: string) => pathname === path;

  return (
    <div className="container mx-auto px-4 py-12">
       <h1 className="text-3xl font-bold mb-8">My Account</h1>
       <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
             <Card>
                <CardContent className="p-4">
                    <nav className="flex flex-col space-y-2">
                       {accountNavLinks.map(link => (
                          <Button
                             key={link.href}
                             variant={isActive(link.href) ? "secondary" : "ghost"}
                             className="w-full justify-start gap-2"
                             asChild
                          >
                             <Link href={link.href}>
                                <link.icon className="h-4 w-4" />
                                {link.label}
                             </Link>
                          </Button>
                       ))}
                       <Button
                           variant="ghost"
                           className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                           onClick={() => {/* Handle Logout */ alert("Logout clicked (placeholder)")}}
                        >
                           Logout
                       </Button>
                    </nav>
                </CardContent>
             </Card>
          </div>
          <div className="md:col-span-3">
             {children}
          </div>
       </div>
    </div>
  );
}
