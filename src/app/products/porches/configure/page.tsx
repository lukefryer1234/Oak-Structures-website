
"use client"; // Needed for form/state

// Add dynamic export configuration to prevent static generation
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
// import { useQuery } from '@tanstack/react-query'; // Replaced by useFirestoreDocument
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestoreDocument } from '@/hooks/firebase/useFirestoreDocument';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// --- Configuration Interfaces & Data ---

interface ConfigOption {
  id: string;
  label: string;
  type: 'select' | 'radio';
  options?: { value: string; label: string; image?: string, dataAiHint?: string }[];
  defaultValue?: any;
}

interface CategoryConfig { // This interface might need an `id` field if fetched directly as a document
  id?: string; // Optional: if the document ID is separate from its content
  title: string;
  options: ConfigOption[];
}

// Specific configuration for Porches - This will now be fetched from Firestore
// const porchConfig: CategoryConfig = {
//     title: "Configure Your Porch",
//     options: [
//       { id: 'trussType', label: 'Truss Type', type: 'radio', options: [{ value: 'curved', label: 'Curved', image: '/images/config/truss-curved.jpg', dataAiHint: 'curved oak truss' }, { value: 'straight', label: 'Straight', image: '/images/config/truss-straight.jpg', dataAiHint: 'straight oak truss' }], defaultValue: 'curved' },
//       { id: 'legType', label: 'Leg Type', type: 'select', options: [{ value: 'floor', label: 'Legs to Floor' }, { value: 'wall', label: 'Legs to Wall' }], defaultValue: 'floor' },
//       { id: 'sizeType', label: 'Size Type', type: 'select', options: [{ value: 'narrow', label: 'Narrow (e.g., 1.5m Wide)' }, { value: 'standard', label: 'Standard (e.g., 2m Wide)' }, { value: 'wide', label: 'Wide (e.g., 2.5m Wide)' }], defaultValue: 'standard' },
//     ]
// };

// Data fetching is now handled by useFirestoreDocument
// const fetchPorchConfig = async (): Promise<CategoryConfig> => {
//   // In a real application, this would fetch from Firestore or an API
//   // For now, we return the hardcoded config
//   return new Promise((resolve) => {
//     setTimeout(() => resolve(porchConfig), 500); // Simulate API call
//   });
// };

// --- Helper Functions ---

const calculatePrice = (config: any, basePriceFromConfig?: number): number => {
  let basePrice = basePriceFromConfig || 2000; // Base price for Porch, can be overridden by config
  if (config.sizeType === 'wide') basePrice += 400;
  if (config.sizeType === 'narrow') basePrice -= 200;
  if (config.legType === 'floor') basePrice += 150;
  // Add other pricing adjustments based on config.trussType if needed
  return Math.max(0, basePrice);
};

// --- Component ---

export default function ConfigurePorchPage() {
  const category = 'porches';
  const router = useRouter();
  const { toast } = useToast();

  // Fetch configuration from Firestore
  const {
    data: categoryConfig,
    isLoading,
    isError,
    error
  } = useFirestoreDocument<CategoryConfig>(
    'product_configurations', // Collection name
    'porches_default_config', // Document ID for porch configuration
    {
      staleTime: 1000 * 60 * 5, // 5 minutes stale time
      onSuccess: (data) => {
        console.log("Porch configuration loaded:", data);
      },
      onError: (err) => {
        console.error("Error loading porch configuration:", err);
        toast({
          title: "Error Loading Configuration",
          description: err.message || "Could not load porch configuration data. Please try again later.",
          variant: "destructive",
        });
      },
    }
  );

  const [configState, setConfigState] = useState<any>({});
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  useEffect(() => {
    if (categoryConfig?.options) {
      const initialState: any = {};
      categoryConfig.options.forEach(opt => {
        initialState[opt.id] = opt.defaultValue;
      });
      setConfigState(initialState);
      // Assuming basePrice might come from config in the future, e.g. categoryConfig.basePrice
      setCalculatedPrice(calculatePrice(initialState /*, categoryConfig.basePrice */));
    }
  }, [categoryConfig]);

   const handleConfigChange = (id: string, value: any) => {
     setConfigState((prev: any) => {
        const newState = { ...prev, [id]: value };
        setCalculatedPrice(calculatePrice(newState /*, categoryConfig?.basePrice */));
        return newState;
     });
   };

    const handlePreviewPurchase = () => {
        const configString = encodeURIComponent(JSON.stringify(configState));
        const price = calculatedPrice !== null ? calculatedPrice.toFixed(2) : '0.00';
        router.push(`/preview?category=${category}&config=${configString}&price=${price}`);
   }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <Skeleton className="h-8 w-3/4 mx-auto" /> {/* Title Skeleton */}
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-8">
            <div className="space-y-6">
              {[1, 2, 3].map((n) => ( // Assuming 3 options to skeleton load
                <div key={n} className="text-center space-y-2">
                  <Skeleton className="h-6 w-1/2 mx-auto" /> {/* Label Skeleton */}
                  <Skeleton className="h-10 w-3/4 mx-auto" /> {/* Input Skeleton */}
                  {n === 1 && ( // Example: Skeleton for radio options with images
                    <div className="mt-2 grid gap-4 justify-center grid-cols-2 max-w-md mx-auto">
                      <Skeleton className="h-32 w-full rounded-md" />
                      <Skeleton className="h-32 w-full rounded-md" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-6 border-t pt-6 mt-4">
              <div className="text-center space-y-2">
                <Skeleton className="h-4 w-1/3 mx-auto" /> {/* Price Label Skeleton */}
                <Skeleton className="h-10 w-1/2 mx-auto" /> {/* Price Skeleton */}
              </div>
              <Skeleton className="h-12 w-full max-w-xs mx-auto" /> {/* Button Skeleton */}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !categoryConfig) {
     // Toast is already shown by useFirestoreDocument's onError.
     // We can show a fallback UI here or rely on the toast.
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
            <CardHeader>
                <CardTitle className="text-2xl text-destructive text-center">Configuration Unavailable</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center">
                    We encountered an issue loading the configuration options for porches.
                    Please try refreshing the page or contact support if the problem persists.
                </p>
                {error && <p className="text-center text-sm text-muted-foreground mt-2">Error: {error.message}</p>}
            </CardContent>
            <CardFooter>
                <Button onClick={() => router.refresh()} className="mx-auto">Refresh Page</Button>
            </CardFooter>
        </Card>
      </div>
    );
  }
  // Removed the !categoryConfig check here as isError should cover it if data is truly missing after load.
  // If useFirestoreDocument resolves with null/undefined successfully, then notFound() might be appropriate.
  // For now, assuming an error state is more likely if data isn't there.

  return (
    <div>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">{categoryConfig.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-8">
               <div className="space-y-6">
                 {categoryConfig.options.map((option) => (
                  <div key={option.id} className="text-center">
                    <Label htmlFor={option.id} className="text-base font-medium block mb-2">{option.label}</Label>
                    {option.type === 'select' && (
                      <Select
                        value={configState[option.id] ?? option.defaultValue ?? ''}
                        onValueChange={(value) => handleConfigChange(option.id, value)}
                      >
                        <SelectTrigger id={option.id} className="mt-2 bg-background/70 max-w-sm mx-auto justify-center">
                          <SelectValue placeholder={`Select ${option.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {option.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="justify-center">{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                     {option.type === 'radio' && (
                        <RadioGroup
                            value={configState[option.id] ?? option.defaultValue ?? ''}
                            onValueChange={(value) => handleConfigChange(option.id, value)}
                            className={cn(
                                "mt-2 grid gap-4 justify-center",
                                "grid-cols-2 max-w-md mx-auto" // Ensure this matches skeleton if specific
                             )}
                         >
                           {option.options?.map((opt) => (
                             <Label key={opt.value} htmlFor={`${option.id}-${opt.value}`} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover/70 p-4 hover:bg-accent/50 hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <RadioGroupItem value={opt.value} id={`${option.id}-${opt.value}`} className="sr-only" />
                                 {opt.image && (
                                    <div className="mb-2 relative w-full aspect-[4/3] rounded overflow-hidden">
                                        <Image
                                            // Using a more robust placeholder or actual image URL from Firestore if available
                                            src={opt.image.startsWith('/') ? opt.image : `https://picsum.photos/seed/${opt.dataAiHint?.replace(/\s+/g, '-') || opt.value}/200/150`}
                                            alt={opt.label}
                                            layout="fill"
                                            objectFit="cover"
                                            data-ai-hint={opt.dataAiHint || opt.label}
                                        />
                                    </div>
                                 )}
                                 <span className="text-sm font-medium mt-auto">{opt.label}</span>
                             </Label>
                           ))}
                         </RadioGroup>
                     )}
                  </div>
                ))}
               </div>
               <div className="space-y-6 border-t border-border/50 pt-6 mt-4">
                 <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Estimated Price (excl. VAT & Delivery)</p>
                    <p className="text-3xl font-bold">
                       {calculatedPrice !== null ? `£${calculatedPrice.toFixed(2)}` : 'Calculating...'}
                    </p>
                 </div>
                  <Button size="lg" className="w-full max-w-xs mx-auto block" onClick={handlePreviewPurchase} disabled={calculatedPrice === null || calculatedPrice <= 0}>
                      Preview Purchase <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
               </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
