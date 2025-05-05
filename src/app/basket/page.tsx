
"use client"; // Needed for state management

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';

// Placeholder Item Interface
interface BasketItem {
  id: string;
  name: string;
  description: string; // Include key configurations here
  price: number;
  quantity: number;
  image: string;
  href: string; // Should point to the config page ideally
  dataAiHint: string;
  category: string; // Added category to construct config link
}

// Placeholder basket data - replace with actual data fetching/state management
const initialBasketItems: BasketItem[] = [
  { id: 'garage1', category: 'garages', name: 'Custom Garage (3-Bay)', description: 'Curved Truss, Reclaimed Oak, No Cat Slide', price: 12500, quantity: 1, image: '/images/basket-garage.jpg', href: '/products/garages/configure?id=garage1', dataAiHint: 'oak frame garage construction' },
  { id: 'flooring1', category: 'oak-flooring', name: 'Oak Flooring (25m²)', description: 'Kilned Dried Oak', price: 1875, quantity: 1, image: '/images/basket-flooring.jpg', href: '/products/oak-flooring/configure?id=flooring1', dataAiHint: 'oak flooring planks' },
  { id: 'deal2', category: 'special-deals', name: 'Garden Gazebo Kit', description: 'Special Deal Item', price: 3200, quantity: 1, image: '/images/special-deal-gazebo.jpg', href: '/special-deals/gazebo-kit', dataAiHint: 'garden gazebo wood structure' },
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
              <div className="lg:col-span-2 space-y-6">
                {basketItems.map((item) => {
                  // Construct link based on category
                  const itemLink = item.category === 'special-deals'
                                     ? `/special-deals` // Link to deals page for deal items
                                     : `/products/${item.category}/configure`; // Link to config page

                  return (
                     // Adjust card appearance if needed
                    <Card key={item.id} className="overflow-hidden bg-card/80 backdrop-blur-sm border border-border/50">
                      <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                        <div className="relative h-32 w-full sm:w-32 flex-shrink-0 bg-muted/50 rounded-md overflow-hidden"> {/* Adjusted background */}
                          <Image
                            src={`https://picsum.photos/seed/${item.id}/200/200`} // Placeholder
                            alt={item.name}
                            layout="fill"
                            objectFit="cover"
                            data-ai-hint={item.dataAiHint}
                          />
                        </div>
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <Link href={itemLink} className="text-lg font-semibold hover:underline">{item.name}</Link>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <label htmlFor={`quantity-${item.id}`} className="text-sm sr-only">Quantity</label>
                              <Input
                                id={`quantity-${item.id}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                className="h-8 w-16 bg-background/70" /* Adjusted background */
                              />
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(item.id)} aria-label="Remove item">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            <span className="text-lg font-medium">£{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="lg:col-span-1">
                 {/* Adjust card appearance if needed */}
                <Card className="sticky top-20 bg-card/80 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">£{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">{shippingCost === 0 ? 'FREE' : `£${shippingCost.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">VAT ({(VAT_RATE * 100).toFixed(0)}%)</span>
                      <span className="text-foreground">£{vat.toFixed(2)}</span>
                    </div>
                    <Separator className="border-border/50"/>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>£{total.toFixed(2)}</span>
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

    