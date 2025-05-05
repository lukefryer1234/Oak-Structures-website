
"use client";

import React, { Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShoppingCart, CreditCard } from 'lucide-react';
import Link from 'next/link';

// Helper function to format configuration keys into readable labels
const formatConfigLabel = (key: string): string => {
    switch (key) {
        case 'bays': return 'Number of Bays';
        case 'beamSize': return 'Structural Beam Size';
        case 'trussType': return 'Truss Type';
        case 'baySize': return 'Size Per Bay';
        case 'catSlide': return 'Cat Slide Roof';
        case 'legType': return 'Leg Type';
        case 'sizeType': return 'Gazebo/Porch Size';
        case 'oakType': return 'Oak Type';
        case 'dimensions': return 'Dimensions';
        case 'area': return 'Area';
        default: return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    }
};

// Helper function to format configuration values
const formatConfigValue = (key: string, value: any): string => {
    if (key === 'bays' && Array.isArray(value)) {
        return value[0].toString();
    }
    if (key === 'catSlide') {
        return value ? 'Yes' : 'No';
    }
    if (key === 'dimensions' && typeof value === 'object' && value !== null) {
        return `L: ${value.length || 'N/A'}cm, W: ${value.width || 'N/A'}cm, T: ${value.thickness || 'N/A'}cm`;
    }
     if (key === 'area' && typeof value === 'object' && value !== null) {
        let areaVal = parseFloat(value.area);
        if (isNaN(areaVal) || areaVal <= 0) {
            const lengthM = parseFloat(value.length) / 100;
            const widthM = parseFloat(value.width) / 100;
             if (!isNaN(lengthM) && !isNaN(widthM) && lengthM > 0 && widthM > 0) {
                areaVal = lengthM * widthM;
             } else {
                areaVal = 0;
             }
        }
        return `${areaVal.toFixed(2)} m²`;
     }

    if (typeof value === 'string') {
         // Capitalize first letter and add spaces before capital letters for camelCase keys
         return value.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    }
    return String(value);
};

function PreviewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const category = searchParams.get('category') || 'Unknown Product';
    const configString = searchParams.get('config');
    const price = searchParams.get('price') || '0.00';

    const config = useMemo(() => {
        if (!configString) return {};
        try {
            return JSON.parse(decodeURIComponent(configString));
        } catch (e) {
            console.error("Failed to parse config:", e);
            return {};
        }
    }, [configString]);

    // Generate a descriptive product name
    const productName = `Custom ${category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
    // Generate description based on config
    const description = Object.entries(config)
        .map(([key, value]) => `${formatConfigLabel(key)}: ${formatConfigValue(key, value)}`)
        .join(', ');

    const handleAddToBasket = () => {
        // TODO: Implement Add to Basket logic
        // Need to store basket items (e.g., localStorage, context, or API call)
        const item = {
             // Generate a unique ID for the basket item
            id: `${category}-${Date.now()}`,
            name: productName,
            description: description,
            price: parseFloat(price),
            quantity: 1,
            // image: `https://picsum.photos/seed/${category}/200/200`, // Image removed from basket item
            href: `/products/${category}/configure`, // Link back to config if needed
            // dataAiHint: `${category} configured`, // Removed dataAiHint
            category: category,
            configuration: config, // Store the full configuration
        };
        console.log("Adding to basket:", item);
        alert(`Added ${productName} to basket! (Placeholder)`);
         // Optional: Redirect to basket page
         router.push('/basket');
    };

    const handleBuyNow = () => {
        // TODO: Implement Buy Now logic
        // 1. Add item to basket (or directly proceed)
        // 2. Redirect to checkout
        console.log("Proceeding to checkout with:", productName);
        alert(`Proceeding to checkout with ${productName}! (Placeholder)`);
        // Ideally, add to basket first then redirect
         handleAddToBasket(); // Add to basket first
         // router.push('/checkout'); // Then redirect (commented out until add to basket is implemented)
    };

    return (
        <div>
            <div className="container mx-auto px-4 py-12">
                <Card className="max-w-2xl mx-auto bg-card/90 backdrop-blur-sm border border-border/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl">Preview Your Purchase</CardTitle>
                        <CardDescription>Review your custom configuration before proceeding.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <h3 className="text-xl font-semibold">{productName}</h3>
                        <div className="space-y-2 text-sm">
                            <p className="font-medium text-muted-foreground">Configuration Details:</p>
                            <ul className="list-disc pl-5 text-foreground space-y-1">
                                {Object.entries(config).map(([key, value]) => (
                                    <li key={key}>
                                        <strong>{formatConfigLabel(key)}:</strong> {formatConfigValue(key, value)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Separator className="border-border/50" />
                        <div className="flex justify-between items-center">
                            <span className="text-lg text-muted-foreground">Estimated Price:</span>
                            <span className="text-2xl font-bold text-primary">£{price}</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-right">(Excludes VAT & Delivery)</p>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 border-t border-border/50 pt-6">
                        <Button size="lg" onClick={handleAddToBasket}>
                            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Basket
                        </Button>
                        <Button size="lg" variant="secondary" onClick={handleBuyNow}>
                             <CreditCard className="mr-2 h-5 w-5" /> Buy Now
                        </Button>
                    </CardFooter>
                     <CardFooter className="justify-center pt-4">
                         <Link href={`/products/${category}/configure?config=${configString}`} className="text-sm text-muted-foreground hover:text-primary hover:underline">
                             &larr; Back to Configuration
                         </Link>
                     </CardFooter>
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
                <p className="text-muted-foreground">Loading preview...</p>
            </div>
        </div>
    );
}

export default function PreviewPage() {
    return (
        <Suspense fallback={<LoadingPreview />}>
            <PreviewContent />
        </Suspense>
    );
}

    