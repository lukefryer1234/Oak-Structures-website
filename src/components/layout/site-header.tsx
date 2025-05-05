"use client"; // Needed for state management and Dropdown

import Link from "next/link";
import {
  Package2,
  ShoppingCart,
  User,
  Menu,
  Home,
  Building,
  Image as ImageIcon,
  Mail,
  Wrench, // Example icon for a product category
  TreeDeciduous, // Example icon
  DoorOpen, // Example icon
  Layers, // Example icon
  Grid, // Example icon
  Sparkles, // Example icon
  LayoutGrid, // Icon for Gallery
  FileText, // Icon for Custom Order
  Info, // Icon for About
  HelpCircle, // Icon for FAQ
  Phone, // Icon for Contact
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
import { Separator } from "@/components/ui/separator"; // Import Separator


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
  { href: "/contact", label: "Contact", icon: Phone }, // Use Phone or Mail
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Placeholder for user authentication status
  const isLoggedIn = false; // Replace with actual auth check

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">

        {/* Logo (visible on all sizes) */}
        <Link href="/" className="flex items-center gap-2 font-semibold mr-4">
          <Building className="h-6 w-6 text-primary" />
          <span className="text-lg hidden sm:inline-block">Timberline Commerce</span>
          <span className="sr-only">Timberline Commerce</span>
        </Link>


        {/* Desktop Hamburger Menu & Right Icons */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
           {/* Desktop Hamburger Menu Trigger */}
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-9 w-9" // Slightly smaller icon button
                 aria-label="Navigation Menu"
               >
                 <Menu className="h-5 w-5 text-muted-foreground" />
                 <span className="sr-only">Navigation Menu</span>
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="w-56">
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


          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href="/basket" aria-label="Shopping Basket">
              <ShoppingCart className="h-5 w-5" />
              {/* Add badge here if basket has items */}
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
                        <Link
                           href="/"
                           className="flex items-center gap-2 text-lg font-semibold mb-4"
                           onClick={closeMobileMenu}
                         >
                           <Building className="h-6 w-6 text-primary" />
                           <span >Timberline Commerce</span>
                         </Link>
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
                      {/* Optional Footer in Mobile Menu */}
                     {/* <div className="p-4 border-t mt-auto">
                         <p className="text-xs text-muted-foreground">Footer Info</p>
                     </div> */}
                  </nav>
              </SheetContent>
           </Sheet>
        </div>
      </div>
    </header>
  );
}
