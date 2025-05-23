// src/components/layout/site-header.tsx
"use client";

import Link from "next/link";
import {
  User,
  Menu,
  Home,
  TreeDeciduous,
  DoorOpen,
  Layers,
  Sparkles,
  LayoutGrid,
  FileText,
  Info,
  HelpCircle,
  Phone,
  // LayoutDashboard, // Removed as admin section is simplified
  // ShoppingCart, // Removed as basket is simplified
  // Tags,
  // Ruler,
  // ImageIcon as ImageIconLucide,
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
// import { Badge } from "@/components/ui/badge"; // Removed as basket count is simplified
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

interface NavLink {
  href: string;
  label: string;
  icon?: React.ElementType;
}

// Simplified main navigation for landing page style
const mainNavLinks: NavLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products/garages/configure", label: "Garages", icon: DoorOpen }, // Icon changed for variety
  { href: "/products/gazebos/configure", label: "Gazebos", icon: TreeDeciduous },
  { href: "/products/porches/configure", label: "Porches", icon: DoorOpen },
  { href: "/products/oak-beams/configure", label: "Oak Beams", icon: Layers },
  // Oak Flooring link will point to its simplified page if directory is restored
  { href: "/products/oak-flooring_COMPLETELY_DISABLED/configure", label: "Oak Flooring", icon: LayoutGrid },
  { href: "/special-deals", label: "Special Deals", icon: Sparkles },
];

const otherNavLinks: NavLink[] = [
  { href: "/gallery", label: "Gallery", icon: LayoutGrid },
  { href: "/custom-order", label: "Bespoke Inquiry", icon: FileText }, // Renamed for clarity
  { href: "/about", label: "About Us", icon: Info },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
  { href: "/contact", label: "Contact", icon: Phone },
];

// Consistent skeleton for header loading state
function HeaderContentSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-full items-center justify-between px-4 md:px-6">
        {/* Minimal static placeholder for left side */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-muted rounded-md animate-pulse"></div> {/* Represents mobile menu or home icon */}
        </div>
        {/* Minimal static placeholder for right side */}
        <div className="flex items-center gap-4">
          {/* <div className="h-9 w-9 bg-muted rounded-full animate-pulse"></div> Basket icon placeholder */}
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
      let errorMessage = "An unknown error occurred during logout.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({ variant: "destructive", title: "Logout Error", description: errorMessage });
    }
  };

  // const formatPrice = (price: number) => { // Not used for now
  //     return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);
  // }

  // const isAdmin = true; // Admin link removed for now

  // const basketItemCount = 0; // Basket simplified
  // const basketTotalPrice = 0;

  if (authLoading) {
    return <HeaderContentSkeleton />;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-full items-center justify-between px-4 md:px-6"> {/* Ensure h-full for container */}
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
                          {/* Home link always visible */}
                          <Link
                             href="/"
                             className="flex items-center gap-4 px-2.5 py-2 text-muted-foreground hover:text-foreground rounded-md"
                             onClick={closeMobileMenu}
                          >
                             <Home className="h-5 w-5" />
                             Home
                          </Link>
                          <Separator className="my-2"/>
                           <p className="px-2.5 text-sm font-medium text-muted-foreground mb-1">Our Products</p>
                           {mainNavLinks.filter(link => link.href !== "/").map((link) => ( // Filter out home if already listed
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
                           <Separator className="my-2"/>
                           <p className="px-2.5 text-sm font-medium text-muted-foreground mb-1">More</p>
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
                 className="h-9 w-9 hidden md:inline-flex" // Kept for desktop consistency
                 aria-label="Navigation Menu"
               >
                 <Menu className="h-5 w-5 text-muted-foreground" />
                 <span className="sr-only">Navigation Menu</span>
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="start" className="w-56">
                 <DropdownMenuLabel>Products</DropdownMenuLabel>
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
        </div>

        {/* Centered Timberline Commerce Name/Logo */}
        <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-semibold text-primary hover:opacity-80 transition-opacity">
            Timberline Commerce
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Basket icon removed for simplification
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
          */}

          {/* Admin Dashboard icon removed for simplification
          {isAdmin && (
            <Button variant="ghost" size="icon" asChild className="h-9 w-9">
              <Link href="/admin" aria-label="Admin Dashboard">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </Link>
            </Button>
          )}
          */}

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
                    <Link href="/account/orders">Orders (Coming Soon)</Link>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem asChild>
                    <Link href="/account/addresses">Addresses</Link>
                  </DropdownMenuItem> */}
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
    return <HeaderContentSkeleton />;
  }

  return <ActualHeaderContent />;
}
