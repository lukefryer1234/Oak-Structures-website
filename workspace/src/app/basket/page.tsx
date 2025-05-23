// src/app/basket/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

export default function BasketPage() {
  return (
    <div>
        <div className="container mx-auto px-4 py-12 md:py-16 flex items-center justify-center min-h-[calc(100vh-12rem)]">
            <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm border border-border/50 shadow-xl text-center">
                <CardHeader className="items-center pb-4 pt-8">
                    <ShoppingCart className="h-16 w-16 text-primary mb-4" />
                    <CardTitle className="text-3xl text-card-foreground">Online Shopping Basket</CardTitle>
                    <CardDescription className="text-muted-foreground pt-2 max-w-md mx-auto">
                        Our online ordering and basket functionality is currently under development.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 px-6 sm:px-10 py-8">
                    <p className="text-muted-foreground text-sm sm:text-base">
                        We are working hard to bring you a seamless online purchasing experience for our configurable timber products and special deals.
                    </p>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        In the meantime, if you would like to place an order or have any questions about our products, please don&apos;t hesitate to contact us directly.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                        <Button asChild size="lg" variant="outline">
                            <Link href="/contact">Contact Us</Link>
                        </Button>
                        <Button asChild size="lg">
                            <Link href="/"> <ArrowLeft className="mr-2 h-4 w-4"/> Continue Browsing</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
