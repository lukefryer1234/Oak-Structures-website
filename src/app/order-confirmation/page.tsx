
// Order Confirmation Page using Suspense for searchParams

"use client"; // Keep client component for useSearchParams

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, ShoppingBag, Home, Loader2 } from "lucide-react"; // Added Loader2
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
// Removed Image import as it's handled globally

// Inner component that uses searchParams
function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId'); // Can be null if param not present

    // TODO: Optionally fetch actual order details based on orderId for display
    // const { data: orderDetails, isLoading, error } = useQuery(['order', orderId], () => fetchOrderDetails(orderId), { enabled: !!orderId });

    return (
        // Removed relative isolate and background image handling
        <div>
            <div className="container mx-auto px-4 py-12 md:py-16 flex items-center justify-center min-h-[calc(100vh-12rem)]"> {/* Adjusted min-height */}
                 {/* Added transparency and blur */}
                <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm border border-border shadow-xl text-center overflow-hidden">
                     {/* Slightly adjusted bg opacity */}
                    <CardHeader className="items-center pb-4 bg-muted/30 pt-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <CardTitle className="text-3xl text-card-foreground">Order Confirmed!</CardTitle>
                        <CardDescription className="text-muted-foreground pt-2 max-w-md mx-auto">
                            Thank you for your purchase from Timberline Commerce. Your order is being processed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5 px-6 sm:px-10 py-8">
                        {/* Order ID display with adjusted background */}
                        {orderId ? (
                            <div className="bg-background/70 border border-border rounded-md p-4 shadow-sm">
                                <p className="text-base sm:text-lg text-muted-foreground">
                                    Your Order ID is:
                                </p>
                                <p className="font-semibold text-primary text-lg sm:text-xl break-all mt-1">{orderId}</p>
                            </div>
                        ) : (
                            <p className="text-lg text-card-foreground">
                                Your order has been placed successfully.
                            </p>
                        )}
                        <p className="text-muted-foreground text-sm sm:text-base">
                            You will receive an email confirmation shortly with your order details and invoice.
                            If you have an account, you can also view your order history.
                        </p>
                         {/* Optional: Display a brief summary of items or total based on fetched orderDetails */}

                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                             {/* Use custom accent button class */}
                            <Button asChild size="lg" className="btn-accent shadow">
                                <Link href="/"> <Home className="mr-2 h-4 w-4"/> Back to Homepage</Link>
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/account/orders"> <ShoppingBag className="mr-2 h-4 w-4"/> View My Orders</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Fallback component for Suspense
function LoadingConfirmation() {
    return (
        // Removed relative isolate and background image handling
         <div>
            <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
                 <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading confirmation details...</p>
            </div>
        </div>
    );
}


// Export the main page component that wraps the content in Suspense
export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<LoadingConfirmation />}>
            <OrderConfirmationContent />
        </Suspense>
    );
}

    