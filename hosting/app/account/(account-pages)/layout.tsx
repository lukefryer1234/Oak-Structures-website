
"use client";

import React, { useEffect } from 'react'; // Added useEffect
import { User, ShoppingBag, MapPin, LogOut } from 'lucide-react'; // Added LogOut icon
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePathname, useRouter } from 'next/navigation'; // Added useRouter
import { useAuth } from '@/context/auth-context'; // Import useAuth
import { useToast } from '@/hooks/use-toast'; // For logout messages

const accountNavLinks = [
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/orders", label: "Orders", icon: ShoppingBag },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, loading, signOut } = useAuth(); // Get currentUser and loading state
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login?redirect=/account/profile'); // Redirect to login if not authenticated
    }
  }, [currentUser, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      // Success toast is handled in AuthContext
    } catch (error: any) {
      toast({ variant: "destructive", title: "Logout Error", description: error.message });
    }
  };

  const isActive = (path: string) => pathname === path;

  if (loading || !currentUser) {
    // Display a loading state or null while checking auth / redirecting
    return (
        <div className="flex items-center justify-center min-h-screen">
             <p>Loading account...</p> {/* Or a spinner component */}
        </div>
    );
  }

  return (
    <div>
        <div className="container mx-auto px-4 py-12">
           <h1 className="text-3xl font-bold mb-8">My Account</h1>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1">
                 <Card className="bg-card/80 backdrop-blur-sm">
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
                               onClick={handleLogout} // Use the new handler
                            >
                               <LogOut className="mr-2 h-4 w-4" /> {/* Added icon */}
                               Logout
                           </Button>
                        </nav>
                    </CardContent>
                 </Card>
              </div>
              <div className="md:col-span-3">
                 <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border shadow-sm">
                    {children}
                 </div>
              </div>
           </div>
        </div>
    </div>
  );
}
