
"use client"; // Needed for state management

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Import Table components

// Placeholder Item Interface
interface BasketItem {
  id: string;
  name: string;
  description: string; // Include key configurations here
  price: number;
  quantity: number;
  // image: string; // Removed image property
  href: string; // Should point to the config page ideally
  // dataAiHint: string; // Removed dataAiHint
  category: string; // Added category to construct config link
}

// Placeholder basket data - replace with actual data fetching/state management
const initialBasketItems: BasketItem[] = [
  { id: 'garage1', category: 'garages', name: 'Custom Garage (3-Bay)', description: 'Curved Truss, Reclaimed Oak, No Cat Slide, Bays: 2, Beam Size: 6x6, Bay Size: standard', price: 12500, quantity: 1, href: '/products/garages/configure?id=garage1' },
  { id: 'flooring1', category: 'oak-flooring', name: 'Oak Flooring (Kilned)', description: 'Kilned Oak Flooring: 25.00m²', price: 1875, quantity: 1, href: '/products/oak-flooring/configure?id=flooring1' },
  { id: 'deal2', category: 'special-deals', name: 'Garden Gazebo Kit', description: 'Special Deal Item', price: 3200, quantity: 1, href: '/special-deals/gazebo-kit' },
  { id: 'beam-168...', category: 'oak-beams', name: 'Oak Beam (Green)', description: 'Green Oak Beam: 200cm L x 15cm W x 15cm T', price: 36, quantity: 1, href: '/products/oak-beams/configure' },
];

// Placeholder VAT rate and shipping calculation logic
const VAT_RATE = 0.20; // 20%
const FREE_SHIPPING_THRESHOLD = 1000;
const SHIPPING_RATE_PER_M3 = 50; // Example rate
const MINIMUM_DELIVERY_CHARGE = 25; // Example minimum

export default function BasketPage() {
  const [basketItems, setBasketItems] = useState<BasketItem[]>(initialBasketItems);

  const updateQuantity = (id: string, quantity: number) => {
    const newQuantity = Math.max(1, quantity); // Ensure quantity is at least 1
    setBasketItems(items =>
      items.map(item => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
     alert(`Update quantity for item ${id} to ${newQuantity} (placeholder)`);
  };

  const removeItem = (id: string) => {
    setBasketItems(items => items.filter(item => item.id !== id));
     alert(`Remove item ${id} (placeholder)`);
  };

  const subtotal = basketItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vat = subtotal * VAT_RATE;

  // Placeholder shipping calculation - replace with actual logic based on item types, volume, etc.
  const calculateShipping = () => {
    // In a real app, you'd need item properties to determine volume/type
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      return 0;
    }
    // Dummy calculation
    const estimatedVolume = basketItems.length * 0.5; // Very rough estimate
    const calculatedShipping = estimatedVolume * SHIPPING_RATE_PER_M3;
    return Math.max(calculatedShipping, MINIMUM_DELIVERY_CHARGE);
  };

  const shippingCost = calculateShipping();
  const total = subtotal + vat + shippingCost;

  // Function to format currency
  const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);
  }

  return (
     // Removed relative isolate and background image handling
     <div>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">Shopping Basket</h1>

          {basketItems.length === 0 ? (
             // Adjust card appearance if needed
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
                            {basketItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{item.description}</TableCell>
                                <TableCell className="text-center">
                                  <Input
                                    id={`quantity-${item.id}`}
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                    className="h-8 w-16 mx-auto bg-background/70" /* Adjusted background and centered */
                                  />
                                </TableCell>
                                <TableCell className="text-right font-medium">{formatPrice(item.price * item.quantity)}</TableCell>
                                <TableCell className="text-right">
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => removeItem(item.id)}>
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

    