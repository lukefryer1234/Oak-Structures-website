// src/app/preview/page.tsx
"use client";

import React, { Suspense } from 'react'; // Removed useMemo
// import { useSearchParams, useRouter } from 'next/navigation'; // Not needed for simplified page
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator'; // Not needed
import { Loader2, Info, ArrowLeft } from 'lucide-react'; // Replaced icons
import Link from 'next/link';

function PreviewContentSimplified() {
    // const searchParams = useSearchParams();
    // const router = useRouter();
    // const category = searchParams.get('category') || 'Product';
    // const configString = searchParams.get('config');
    // const price = searchParams.get('price') || '0.00';

    // Config parsing and display logic removed for simplification

    // const productName = `Custom ${category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
    
    return (
        <div>
            <div className="container mx-auto px-4 py-12 md:py-16 flex items-center justify-center min-h-[calc(100vh-12rem)]">
                <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm border border-border/50 shadow-xl text-center">
                    <CardHeader className="items-center pb-4 pt-8">
                        <Info className="h-16 w-16 text-primary mb-4" />
                        <CardTitle className="text-3xl text-card-foreground">Product Details</CardTitle>
                        <CardDescription className="text-muted-foreground pt-2 max-w-md mx-auto">
                            Our online product preview and direct ordering system is currently being enhanced.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5 px-6 sm:px-10 py-8">
                        <p className="text-muted-foreground text-sm sm:text-base">
                            For detailed information about specific product configurations, pricing, or to discuss a bespoke project, please reach out to our team.
                        </p>
                        <p className="text-muted-foreground text-sm sm:text-base">
                            We are happy to provide you with a personalized quote and guide you through the ordering process.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                             <Button asChild size="lg" variant="outline">
                                <Link href="/contact">Get a Quote / Contact Us</Link>
                            </Button>
                            <Button asChild size="lg">
                                <Link href="/"> <ArrowLeft className="mr-2 h-4 w-4"/> Back to Homepage</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function LoadingPreview() {
    return (
        <div>
            <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
                 <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading page...</p>
            </div>
        </div>
    );
}

export default function PreviewPage() {
    return (
        <Suspense fallback={<LoadingPreview />}>
            <PreviewContentSimplified />
        </Suspense>
    );
}
