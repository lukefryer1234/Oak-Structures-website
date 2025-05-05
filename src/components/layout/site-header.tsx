
"use client"; // Needed for state management and Dropdown

import Link from "next/link";
import {
  ShoppingCart,
  User,
  Menu,
  Home,
  Building,
  Image as ImageIcon,
  Mail,
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
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge"; // Import Badge

const mainNavLinks = [
  { href: "/products/garages", label: "Garages", icon: Wrench },
  { href: "/products/gazebos", label: "Gazebos", icon: TreeDeciduous },
  { href: "/products/porches", label: "Porches", icon: DoorOpen },
  { href: "/products/oak-beams", label: "Oak Beams", icon: Layers },
  { href: "/products/oak-flooring", label: "Oak Flooring", icon: Grid },
  { href: "/special-deals", label: "Special Deals", icon: Sparkles },
];

const otherNavLinks = [
  { href: "/gallery", label: "Gallery", icon: LayoutGrid },
  { href: "/custom-order", label: "Custom Order", icon: FileText },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
  { href: "/contact", label: "Contact", icon: Phone },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Placeholder for user authentication status
  const isLoggedIn = false; // Replace with actual auth check
  // Placeholder for basket item count
  const basketItemCount = 3; // Replace with actual basket count logic
  // Placeholder for basket total price - fetch this from actual basket state
  const basketTotalPrice = 17575.00; // Example value

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Function to format price
  const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6"> {/* justify-between here */}

        {/* Left Side: Hamburger Menus & Basket Total */}
        <div className="flex items-center gap-2">
           {/* Mobile Hamburger Trigger (only for triggering the sheet) */}
           <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 md:hidden h-9 w-9" // Display only on mobile
                  aria-label="Toggle navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
                {/* Mobile Sheet Content */}
                 <nav className="flex flex-col h-full">
                     <div className="p-4 border-b">
                        {/* Removed Title from mobile menu header */}
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
                          <Separator className="my-2"/>
                           <p className="px-2.5 text-sm font-medium text-muted-foreground mb-1">Products</p>
                           {mainNavLinks.map((link) => (
                             <Link
                               key={link.href}
                               href={link.href}
                               className="flex items-center gap-4 px-2.5 py-2 text-muted-foreground hover:text-foreground rounded-md"
                               onClick={closeMobileMenu}
                             >
                                <link.icon className="h-5 w-5" />
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
                                <link.icon className="h-5 w-5" />
                                {link.label}
                              </Link>
                           ))}
                     </div>
                  </nav>
              </SheetContent>
           </Sheet>

           {/* Desktop Hamburger Menu Trigger */}
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-9 w-9 hidden md:inline-flex" // Hidden on mobile, inline-flex on desktop
                 aria-label="Navigation Menu"
               >
                 <Menu className="h-5 w-5 text-muted-foreground" />
                 <span className="sr-only">Navigation Menu</span>
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="start" className="w-56"> {/* Align start for left side */}
               <DropdownMenuItem asChild>
                   <Link href="/" className="flex items-center gap-2">
                     <Home className="h-4 w-4" />
                     Home
                   </Link>
                 </DropdownMenuItem>
                  <DropdownMenuSeparator />
                 <DropdownMenuLabel>Products</DropdownMenuLabel>
                 {mainNavLinks.map((link) => (
                 <DropdownMenuItem key={link.href} asChild>
                   <Link href={link.href} className="flex items-center gap-2">
                     <link.icon className="h-4 w-4" />
                     {link.label}
                   </Link>
                 </DropdownMenuItem>
               ))}
               <DropdownMenuSeparator />
                 {otherNavLinks.map((link) => (
                   <DropdownMenuItem key={link.href} asChild>
                     <Link href={link.href} className="flex items-center gap-2">
                       <link.icon className="h-4 w-4" />
                       {link.label}
                     </Link>
                   </DropdownMenuItem>
                 ))}
             </DropdownMenuContent>
           </DropdownMenu>

            {/* Basket Total Price */}
            {basketItemCount > 0 && (
                <div className="text-sm font-medium text-foreground ml-2 hidden md:block">
                    {formatPrice(basketTotalPrice)}
                </div>
             )}
        </div>


        {/* Right Side: Icons */}
        <div className="flex items-center gap-2 md:gap-4"> {/* This group is positioned to the right by justify-between */}
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="User Account" className="h-9 w-9">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isLoggedIn ? (
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
                  <DropdownMenuItem onClick={() => alert("Logout clicked (placeholder)")}>Logout</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register">Register</Link>
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
