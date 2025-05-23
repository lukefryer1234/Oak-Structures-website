
"use client";

import Link from "next/link";
import {
  ShoppingCart,
  User,
  Menu,
  Home,
  // Building, // No longer used directly here
  // ImageIcon, // No longer used directly here
  // Mail, // No longer used directly here
  Wrench,
  TreeDeciduous,
  DoorOpen,
  Layers,
  Grid,
  Sparkles,
  LayoutGrid,
  FileText,
  Info,
  HelpCircle,
  Phone,
  LayoutDashboard, // For Admin Dashboard Icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
// import { cn } from "@/lib/utils"; // No longer used

interface NavLink {
  href: string;
  label: string;
  icon?: React.ElementType; // Icon is optional
}


const mainNavLinks: NavLink[] = [
  { href: "/products/garages/configure", label: "Garages", icon: Wrench },
  { href: "/products/gazebos/configure", label: "Gazebos", icon: TreeDeciduous },
  { href: "/products/porches/configure", label: "Porches", icon: DoorOpen },
  { href: "/products/oak-beams/configure", label: "Oak Beams", icon: Layers },
  // Assuming oak-flooring is re-enabled later, it would need an icon. Using Grid as placeholder.
  // { href: "/products/oak-flooring_COMPLETELY_DISABLED/configure", label: "Oak Flooring", icon: Grid },
  { href: "/special-deals", label: "Special Deals", icon: Sparkles },
];

const otherNavLinks: NavLink[] = [
  { href: "/gallery", label: "Gallery", icon: LayoutGrid },
  { href: "/custom-order", label: "Custom Order", icon: FileText },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
  { href: "/contact", label: "Contact", icon: Phone },
];

// Consistent skeleton for header loading state
function HeaderContentSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-full items-center justify-between px-4 md:px-6">
        {/* Left side skeleton */}
        <div className="flex items-center gap-2">
           <div className="h-9 w-9 bg-muted rounded-md animate-pulse"></div> {/* Represents mobile menu or home icon */}
        </div>
        {/* Right side skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-muted rounded-full animate-pulse"></div> {/* Basket icon placeholder */}
          <div className="h-9 w-9 bg-muted rounded-full animate-pulse"></div> {/* User icon placeholder */}
        </div>
      </div>
    </header>
  );
}


// Main header content, rendered after client mount and auth loading
function ActualHeaderContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({ variant: "destructive", title: "Logout Error", description: error.message });
      } else {
         toast({ variant: "destructive", title: "Logout Error", description: "An unknown error occurred." });
      }
    }
  };

  const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);
  }

  // TEMPORARILY MODIFIED FOR DEVELOPMENT: Always true for admin links visibility
  const isAdmin = true; 

  // Placeholder basket data
  const basketItemCount = 3; 
  const basketTotalPrice = 17575.00; 

  if (authLoading) {
    return <HeaderContentSkeleton />;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
           <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden h-9 w-9"
                aria-label="Toggle navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
                 <nav className="flex flex-col h-full">
                     <div className="p-4 border-b">
                         <h2 className="text-lg font-semibold">Menu</h2>
                     </div>
                     <div className="flex-1 overflow-y-auto py-4 px-4">
                          <Link
                             href="/"
                             className="flex items-center gap-4 px-2.5 py-2 text-muted-foreground hover:text-foreground rounded-md"
                             onClick={closeMobileMenu}
                          >
                             <Home className="h-5 w-5" />
                             Home
                          </Link>
                          {/* Always show Admin Dashboard link in mobile menu */}
                          {isAdmin && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-4 px-2.5 py-2 text-muted-foreground hover:text-foreground rounded-md"
                                onClick={closeMobileMenu}
                            >
                                <LayoutDashboard className="h-5 w-5 text-primary" />
                                Admin Dashboard
                            </Link>
                          )}
                          <Separator className="my-2"/>
                           <p className="px-2.5 text-sm font-medium text-muted-foreground mb-1">Products</p>
                           {mainNavLinks.map((link) => (
                             <Link
                               key={link.href}
                               href={link.href}
                               className="flex items-center gap-4 px-2.5 py-2 text-muted-foreground hover:text-foreground rounded-md"
                               onClick={closeMobileMenu}
                             >
                               {/* Conditionally render icon if it exists */}
                               {link.icon && <link.icon className="h-5 w-5" />}
                              {link.label}
                             </Link>
                           ))}
                           <Separator className="my-2"/>
                           {otherNavLinks.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center gap-4 px-2.5 py-2 text-muted-foreground hover:text-foreground rounded-md"
                                onClick={closeMobileMenu}
                              >
                                {link.icon && <link.icon className="h-5 w-5" />}
                                {link.label}
                              </Link>
                           ))}
                     </div>
                  </nav>
              </SheetContent>
           </Sheet>

           <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-9 w-9 hidden md:inline-flex"
                 aria-label="Navigation Menu"
               >
                 <Menu className="h-5 w-5 text-muted-foreground" />
                 <span className="sr-only">Navigation Menu</span>
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="start" className="w-56">
                 <DropdownMenuLabel>Main Navigation</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 {mainNavLinks.map((link) => (
                 <DropdownMenuItem key={link.href} asChild>
                   <Link href={link.href} className="flex items-center gap-2">
                     {link.icon && <link.icon className="h-4 w-4" />}
                     {link.label}
                   </Link>
                 </DropdownMenuItem>
               ))}
               <DropdownMenuSeparator />
               <DropdownMenuLabel>More</DropdownMenuLabel>
                 {/* Always show Admin Dashboard link in desktop dropdown */}
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                 {otherNavLinks.map((link) => (
                   <DropdownMenuItem key={link.href} asChild>
                     <Link href={link.href} className="flex items-center gap-2">
                       {link.icon && <link.icon className="h-4 w-4" />}
                       {link.label}
                     </Link>
                   </DropdownMenuItem>
                 ))}
             </DropdownMenuContent>
           </DropdownMenu>
           
           <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href="/" aria-label="Homepage">
              <Home className="h-5 w-5" />
            </Link>
          </Button>


            {basketItemCount > 0 && (
                <div className="text-sm font-medium text-foreground ml-2 hidden md:block">
                    {formatPrice(basketTotalPrice)}
                </div>
             )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" asChild className="relative h-9 w-9">
            <Link href="/basket" aria-label="Shopping Basket">
              <ShoppingCart className="h-5 w-5" />
              {basketItemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 min-w-4 justify-center rounded-full p-0.5 text-[10px] leading-none">
                    {basketItemCount}
                </Badge>
              )}
            </Link>
          </Button>

           {/* Always show Admin Dashboard icon link if isAdmin is true */}
          {isAdmin && (
            <Button variant="ghost" size="icon" asChild className="h-9 w-9">
              <Link href="/admin" aria-label="Admin Dashboard">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </Link>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="User Account" className="h-9 w-9">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {currentUser ? (
                <>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/addresses">Addresses</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/login?tab=register">Register</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}


export function SiteHeader() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render a consistent skeleton on the server and for initial client render
    return <HeaderContentSkeleton />;
  }

  return <ActualHeaderContent />;
}
