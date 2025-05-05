"use client";

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

const mainNavLinks = [
  { href: "/products/garages", label: "Garages" },
  { href: "/products/gazebos", label: "Gazebos" },
  { href: "/products/porches", label: "Porches" },
  { href: "/products/oak-beams", label: "Oak Beams" },
  { href: "/products/oak-flooring", label: "Oak Flooring" },
  { href: "/special-deals", label: "Special Deals" },
];

const hamburgerNavLinks = [
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/custom-order", label: "Custom Order", icon: Mail },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Placeholder for user authentication status
  const isLoggedIn = false; // Replace with actual auth check

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Mobile Hamburger Menu (always present, hidden on md+) */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Building className="h-6 w-6 text-primary" />
                <span className="sr-only">Timberline Commerce</span>
              </Link>
              <Link
                href="/"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                 onClick={() => setMobileMenuOpen(false)}
              >
                 <Home className="h-5 w-5" />
                 Home
              </Link>
              {mainNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                   onClick={() => setMobileMenuOpen(false)}
                >
                   {/* Add appropriate icons if desired */}
                  {link.label}
                </Link>
              ))}
              <DropdownMenuSeparator />
              {hamburgerNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                   onClick={() => setMobileMenuOpen(false)}
                >
                   <link.icon className="h-5 w-5" />
                   {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop Logo and Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Building className="h-6 w-6 text-primary" />
            <span className="text-lg">Timberline Commerce</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            {mainNavLinks.map((link) => (
               <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
             {/* Desktop Hamburger Menu Trigger */}
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button
                   variant="ghost"
                   size="icon"
                   className="h-8 w-8"
                 >
                   <Menu className="h-5 w-5 text-muted-foreground" />
                   <span className="sr-only">More pages</span>
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="start">
                 {hamburgerNavLinks.map((link) => (
                   <DropdownMenuItem key={link.href} asChild>
                     <Link href={link.href} className="flex items-center gap-2">
                       <link.icon className="h-4 w-4" />
                       {link.label}
                     </Link>
                   </DropdownMenuItem>
                 ))}
               </DropdownMenuContent>
             </DropdownMenu>
          </nav>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/basket" aria-label="Shopping Basket">
              <ShoppingCart className="h-5 w-5" />
              {/* Add badge here if basket has items */}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="User Account">
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
                  <DropdownMenuItem>Logout</DropdownMenuItem>
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
