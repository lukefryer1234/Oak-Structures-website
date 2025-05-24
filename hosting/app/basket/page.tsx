
"use client"; // Needed for state management

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash2, RefreshCw, ShoppingCart, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBasket } from '@/context/basket-context';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function BasketPage() {
  const { 
    items: basketItems, 
    subtotal, 
    vat, 
    shippingCost, 
    total, 
    loading, 
    addingToBasket,
    removingFromBasket,
    clearingBasket,
    error,
    updateItemQuantity,
    removeItem,
    refreshBasket,
    emptyBasket
  } = useBasket();
  
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // State for tracking which items are being updated
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({});
  
  // Function to format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);
  };
  
  // Handle quantity update with validation
  const handleUpdateQuantity = async (id: string, quantity: number) => {
    // Ensure quantity is at least 1
    const newQuantity = Math.max(1, quantity);
    
    // Track which item is being updated
    setUpdatingItems(prev => ({ ...prev, [id]: true }));
    
    try {
      const success = await updateItemQuantity(id, newQuantity);
      
      if (!success) {
        toast({
          title: "Update Failed",
          description: "Failed to update quantity. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdatingItems(prev => ({ ...prev, [id]: false }));
    }
  };
  
  // Handle item removal
  const handleRemoveItem = async (id: string) => {
    try {
      const success = await removeItem(id);
      
      if (!success) {
        toast({
          title: "Removal Failed",
          description: "Failed to remove item. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle basket refresh
  const handleRefreshBasket = async () => {
    try {
      await refreshBasket();
      toast({
        title: "Basket Updated",
        description: "Your basket has been refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing basket:", error);
      toast({
        title: "Error",
        description: "Failed to refresh your basket. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle clearing the basket
  const handleClearBasket = async () => {
    if (window.confirm("Are you sure you want to empty your basket?")) {
      try {
        const success = await emptyBasket();
        
        if (!success) {
          toast({
            title: "Error",
            description: "Failed to clear your basket. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error clearing basket:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Redirect to login if no user
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-lg mx-auto bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center space-y-4">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">Login Required</h2>
            <p className="text-muted-foreground mb-4">Please login to view your basket</p>
            <Button asChild>
              <Link href={`/login?redirect=${encodeURIComponent('/basket')}`}>Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Shopping Basket</h1>
          
          {/* Refresh button */}
          {basketItems.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshBasket}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>
        
        {/* Error display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-4 mb-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {/* Empty basket state */}
        {!loading && basketItems.length === 0 && (
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center space-y-4">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-bold">Your basket is empty</h2>
              <p className="text-muted-foreground mb-4">
                Browse our product categories to find quality oak structures and products.
              </p>
              <Button asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Basket with items */}
        {!loading && basketItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Basket Items List */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Items ({basketItems.length})</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearBasket}
                    disabled={clearingBasket}
                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Empty Basket
                  </Button>
                </CardHeader>
                <CardContent className="p-0"> {/* Remove default padding */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="hidden md:table-cell">Description</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {basketItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{item.name}</span>
                              <span className="text-sm text-muted-foreground md:hidden">{item.description}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                            {item.description}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                                className="h-8 w-16 mx-auto bg-background/70"
                                disabled={updatingItems[item.id] || removingFromBasket}
                              />
                              {updatingItems[item.id] && (
                                <div className="ml-2">
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" 
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={removingFromBasket}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20 bg-card/80 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">
                      {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT (20%)</span>
                    <span className="text-foreground">{formatPrice(vat)}</span>
                  </div>
                  <Separator className="border-border/50"/>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border/50 pt-6">
                  <Button 
                    className="w-full" 
                    size="lg" 
                    asChild
                    disabled={loading || basketItems.length === 0}
                  >
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                </CardFooter>
              </Card>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <Link href="/" className="hover:underline">Continue Shopping</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
