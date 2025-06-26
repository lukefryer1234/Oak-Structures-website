
"use client";

import Link from 'next/link';
import { ShoppingCart, Menu, Home, User } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { user, isAdmin, logout } = useAuth();
  const itemCount = 0;
  const cartTotal = 0;
  
  const formattedCartTotal = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(cartTotal);

  const productsForMenu = [
    { id: 'garages', name: 'Garages' },
    { id: 'gazebos', name: 'Gazebos' },
    { id: 'porches', name: 'Porches' },
    { id: 'oak-beams', name: 'Oak Beams' },
    { id: 'oak-flooring', name: 'Oak Flooring' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-secondary">
      <div className="container mx-auto w-full flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
           <Link href="/" passHref>
            <Button variant="ghost" size="icon" aria-label="Store Home">
              <Home className="h-7 w-7 text-foreground" />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-7 w-7 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Products</DropdownMenuLabel>
              {productsForMenu.map(product => (
                <Link key={product.id} href={`/products/${product.id}/configure`} passHref>
                  <DropdownMenuItem>{product.name}</DropdownMenuItem>
                </Link>
              ))}
              <Link href="/special-deals" passHref>
                <DropdownMenuItem>Special Deals</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link href="/gallery" passHref>
                <DropdownMenuItem>Gallery</DropdownMenuItem>
              </Link>
              <Link href="/about" passHref>
                <DropdownMenuItem>About Us</DropdownMenuItem>
              </Link>
              <Link href="/custom-order" passHref>
                <DropdownMenuItem>Custom Order</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="hidden md:flex flex-grow items-center justify-evenly space-x-2">
          {productsForMenu.map(product => (
            <Link key={product.id} href={`/products/${product.id}/configure`} passHref>
              <Button variant="link" className="text-base font-semibold text-foreground hover:text-primary px-2">
                {product.name}
              </Button>
            </Link>
          ))}
          <Link href="/special-deals" passHref>
            <Button variant="link" className="text-base font-semibold text-foreground hover:text-primary px-2">
              Special Deals
            </Button>
          </Link>
        </nav>
        
        <nav className="flex items-center space-x-3 ml-auto">
            <span className="text-sm font-medium text-foreground">
              {formattedCartTotal}
            </span>
          <Link href="/basket" passHref>
            <Button variant="ghost" className="relative flex items-center text-sm font-medium text-foreground transition-colors hover:text-primary p-2 sm:p-2" aria-label="Shopping basket">
              <ShoppingCart className="h-6 w-6 text-foreground" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="User menu">
                <User className="h-6 w-6 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/account" passHref>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" passHref>
                      <DropdownMenuItem>Admin Dashboard</DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </>
              ) : (
                <>
                  <Link href="/login" passHref>
                    <DropdownMenuItem>Login</DropdownMenuItem>
                  </Link>
                  <Link href="/register" passHref>
                    <DropdownMenuItem>Create Account</DropdownMenuItem>
                  </Link>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
