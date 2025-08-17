
"use client";

import React from 'react'; // Removed useState as it's replaced by useBasket
import Link from 'next/link';
import Image from 'next/image'; // Added Image import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingCart as ShoppingCartIcon } from 'lucide-react'; // Added ShoppingCartIcon for empty state
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBasket } from '@/context/basket-context'; // Import useBasket
// BasketItem type is implicitly used via useBasket hook's return type

// VAT rate and shipping logic should ideally come from context or a shared utility if complex/dynamic
// For now, assuming they might be part of basket context's calculation or simple constants if not.
// const VAT_RATE = 0.20; // This logic is now in basket-context
// const FREE_SHIPPING_THRESHOLD = 1000; // This logic is now in basket-context
// const SHIPPING_RATE_PER_M3 = 50;
// const MINIMUM_DELIVERY_CHARGE = 25;

export default function BasketPage() {
  const {
    items,
    itemCount,
    subtotal,
    vatAmount,
    shippingCost,
    grandTotal,
    removeItem,
    updateItemQuantity,
    clearBasket // Now using clearBasket
  } = useBasket();

  // Function to format currency
  const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);
  }

  return (
     <div>
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <Card className="max-w-4xl mx-auto shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight text-center">
                Your Shopping Basket
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              {itemCount === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCartIcon className="mx-auto h-24 w-24 text-muted-foreground/50 mb-6" strokeWidth={1} />
                  <p className="text-xl text-muted-foreground mb-6">Your basket is currently empty.</p>
                <Button asChild>
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <Card className="border-border/50">
                      <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>Your Items ({itemCount})</CardTitle>
                        {itemCount > 0 && (
                           <Button variant="outline" size="sm" onClick={clearBasket} className="text-destructive hover:bg-destructive/10">
                             <Trash2 className="mr-1.5 h-4 w-4" /> Clear Basket
                           </Button>
                        )}
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-border">
                          {items.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 sm:p-6">
                              <div className="relative w-full sm:w-32 h-32 sm:h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                <Image
                                  src={item.imageSrc || `https://picsum.photos/seed/${item.productId}/200/200`}
                                  alt={item.productName}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </div>
                              <div className="flex-grow">
                                <h3 className="text-lg font-semibold">{item.productName}</h3>
                                {item.configurationSummary && (
                                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{item.configurationSummary}</p>
                                )}
                                <p className="text-sm mt-2">Unit Price: {formatPrice(item.unitPrice)}</p>
                              </div>
                              <div className="flex flex-col items-start sm:items-end space-y-2 sm:w-auto md:w-48"> {/* Adjusted width for responsiveness */}
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm hidden sm:inline">Qty:</span>
                                  <Input
                                    id={`quantity-${item.id}`}
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => {
                                        const newQuantity = parseInt(e.target.value, 10);
                                        if (!isNaN(newQuantity)) updateItemQuantity(item.id, newQuantity);
                                    }}
                                    className="h-9 w-16 text-center bg-background/70"
                                  />
                                </div>
                                <p className="text-lg font-semibold">Item Total: {formatPrice(item.totalItemPrice)}</p>
                                <Button variant="outline" size="sm" className="mt-2 text-destructive hover:bg-destructive/10 w-full sm:w-auto" onClick={() => removeItem(item.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:col-span-1">
                    <Card className="sticky top-20 border-border/50">
                      <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                          <span className="text-foreground">{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="text-foreground">{shippingCost === 0 && itemCount > 0 ? 'FREE' : formatPrice(shippingCost)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">VAT ({(0.20 * 100).toFixed(0)}%)</span> {/* Assuming VAT rate is from context or constant */}
                          <span className="text-foreground">{formatPrice(vatAmount)}</span>
                        </div>
                        <Separator className="border-border/50"/>
                        <div className="flex justify-between font-bold text-lg">
                          <span>Grand Total</span>
                          <span>{formatPrice(grandTotal)}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-6">
                        <Button className="w-full" size="lg" asChild disabled={itemCount === 0}>
                           <Link href={itemCount > 0 ? "/checkout" : "#"} aria-disabled={itemCount === 0}>Proceed to Checkout</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                      <Link href="/" className="hover:underline">Continue Shopping</Link>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            {/* The main CardFooter was removed in the previous step, which is fine as the summary is part of the grid.
                If itemCount === 0, the whole grid section including the summary card is not rendered.
                The "Proceed to Checkout" button is inside the summary card, which is only shown if itemCount > 0.
                So, the explicit CardFooter for the main Card is not strictly necessary here.
            */}
          </Card>
        </div>
     </div>
  );
}