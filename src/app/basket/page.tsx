
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash2, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCart } from '@/contexts/CartContext';
import { SelectedConfiguration } from '@/types';

// Helper to format configuration details into a readable string
const formatConfiguration = (configuration: SelectedConfiguration[] | undefined) => {
    if (!configuration || configuration.length === 0) {
        // Find a better fallback text
        return 'Standard Item';
    }
    return configuration.map(c => c.value).join(', ');
};


// Placeholder VAT rate and shipping calculation logic
const VAT_RATE = 0.20; // 20%
const FREE_SHIPPING_THRESHOLD = 1000;
const SHIPPING_RATE_PER_M3 = 50; // Example rate
const MINIMUM_DELIVERY_CHARGE = 25; // Example minimum

export default function BasketPage() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, isLoading, isClient } = useCart();

  const subtotal = isClient ? getCartTotal() : 0;
  const vat = subtotal * VAT_RATE;

  // Placeholder shipping calculation - replace with actual logic based on item types, volume, etc.
  const calculateShipping = () => {
    if (!isClient) return 0;
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      return 0;
    }
    // Dummy calculation
    const estimatedVolume = cartItems.length * 0.5; // Very rough estimate
    const calculatedShipping = estimatedVolume * SHIPPING_RATE_PER_M3;
    return Math.max(calculatedShipping, MINIMUM_DELIVERY_CHARGE);
  };

  const shippingCost = calculateShipping();
  const total = subtotal + vat + shippingCost;

  // Function to format currency
  const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);
  }

  if (isLoading || !isClient) {
    return (
        <div className="container mx-auto px-4 py-12 flex justify-center items-center" style={{minHeight: '50vh'}}>
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
     <div>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">Shopping Basket</h1>

          {cartItems.length === 0 ? (
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">Your basket is currently empty.</p>
                <Button asChild>
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Basket Items List (Cutting List Style) */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                    <CardHeader>
                        <CardTitle>Items</CardTitle>
                    </CardHeader>
                     <CardContent className="p-0"> {/* Remove default padding */}
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-center">Qty</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                              <TableHead className="w-[50px]">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cartItems.map((item) => (
                              <TableRow key={item.cartItemId}>
                                <TableCell className="font-medium">{item.product.name}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{formatConfiguration(item.configuration)}</TableCell>
                                <TableCell className="text-center">
                                  <Input
                                    id={`quantity-${item.cartItemId}`}
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => {
                                        const newQuantity = parseInt(e.target.value);
                                        if (!isNaN(newQuantity) && newQuantity > 0) {
                                            updateQuantity(item.cartItemId, newQuantity)
                                        }
                                    }}
                                    className="h-8 w-16 mx-auto bg-background/70" /* Adjusted background and centered */
                                  />
                                </TableCell>
                                <TableCell className="text-right font-medium">{formatPrice(item.unitPrice * item.quantity)}</TableCell>
                                <TableCell className="text-right">
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => removeFromCart(item.cartItemId)}>
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

              {/* Order Summary Card (Right Column) */}
              <div className="lg:col-span-1">
                 {/* Adjust card appearance if needed */}
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
                      <span className="text-foreground">{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">VAT ({(VAT_RATE * 100).toFixed(0)}%)</span>
                      <span className="text-foreground">{formatPrice(vat)}</span>
                    </div>
                    <Separator className="border-border/50"/>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border/50 pt-6"> {/* Added border and padding */}
                    <Button className="w-full" size="lg" asChild>
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

    