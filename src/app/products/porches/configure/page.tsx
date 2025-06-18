"use client"; // Needed for form/state

// Add dynamic export configuration to prevent static generation
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useFirestoreDocument } from '@/hooks/firebase/useFirestoreDocument';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, ShoppingCart, Loader2 } from 'lucide-react'; // Added Loader2
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
// Ensuring all expected service functions are imported
import { productService, type ConfigState } from '@/services/domain/product-service';
import { toast } from '@/hooks/use-toast';

// Define CategoryConfig and ConfigOption types locally if not imported or if they differ from a central definition
// These should match the structure expected from Firestore or the fallback.
interface ConfigOption {
  id: string;
  label: string;
  type: 'select' | 'radio';
  options?: { value: string; label: string; image?: string, dataAiHint?: string }[];
  defaultValue?: any;
}

interface CategoryConfig {
  title: string;
  options: ConfigOption[];
  // Potentially add other category-specific fields if they exist in Firestore
}

// --- Fallback Configuration and Pricing ---
const fallbackPorchConfig: CategoryConfig = {
  title: "Configure Your Porch (Using Fallback Data)",
  options: [
    { id: 'trussType', label: 'Truss Type', type: 'radio', options: [{ value: 'curved', label: 'Curved', image: '/images/config/truss-curved.jpg', dataAiHint: 'curved oak truss' }, { value: 'straight', label: 'Straight', image: '/images/config/truss-straight.jpg', dataAiHint: 'straight oak truss' }], defaultValue: 'curved' },
    { id: 'legType', label: 'Leg Type', type: 'select', options: [{ value: 'floor', label: 'Legs to Floor' }, { value: 'wall', label: 'Legs to Wall' }], defaultValue: 'floor' },
    { id: 'sizeType', label: 'Size Type', type: 'select', options: [{ value: 'narrow', label: 'Narrow (e.g., 1.5m Wide)' }, { value: 'standard', label: 'Standard (e.g., 2m Wide)' }, { value: 'wide', label: 'Wide (e.g., 2.5m Wide)' }], defaultValue: 'standard' },
  ]
};

const fallbackCalculatePrice = (config: ConfigState): number => {
  let basePrice = 2000; // Base price for Porch
  if (config.sizeType === 'wide') basePrice += 400;
  if (config.sizeType === 'narrow') basePrice -= 200;
  if (config.legType === 'floor') basePrice += 150;
  return Math.max(0, basePrice);
};


// --- Component ---

export default function ConfigurePorchPage() {
  const category = 'porches';
  const router = useRouter();
  const { user } = useAuth();

  const [pageUiState, setPageUiState] = useState<{ addingToBasket: boolean; error: string | null; usingFallback: boolean }>({
    addingToBasket: false,
    error: null,
    usingFallback: false,
  });

  const { data: firestoreData, isLoading: isFetchingConfig, error: firestoreError } = useFirestoreDocument<CategoryConfig>(`product_configurators/porches`);

  const [configState, setConfigState] = useState<ConfigState>({});
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  // Determine the active configuration
  const [activeConfig, setActiveConfig] = useState<CategoryConfig | null>(null);

  useEffect(() => {
    if (!isFetchingConfig) {
      if (firestoreError || !firestoreData) {
        console.warn("Firestore config error or no data, using fallback for porches.", firestoreError);
        setActiveConfig(fallbackPorchConfig);
        setPageUiState(prev => ({ ...prev, usingFallback: true, error: firestoreError ? "Failed to load custom configuration, using default options." : null }));
      } else {
        setActiveConfig(firestoreData);
        setPageUiState(prev => ({ ...prev, usingFallback: false, error: null }));
      }
    }
  }, [firestoreData, isFetchingConfig, firestoreError]);

  useEffect(() => {
    if (activeConfig) {
      const initialState: ConfigState = {};
      activeConfig.options.forEach(opt => {
        initialState[opt.id] = opt.defaultValue;
      });
      setConfigState(initialState);
    }
  }, [activeConfig]);

  useEffect(() => {
    if (activeConfig && Object.keys(configState).length > 0) {
      if (pageUiState.usingFallback) {
        setCalculatedPrice(fallbackCalculatePrice(configState));
      } else {
        productService.calculateProductPrice(`${category}-configurable`, configState)
          .then(price => setCalculatedPrice(price))
          .catch(err => {
            console.error("Error calculating price with service:", err);
            setPageUiState(prev => ({ ...prev, error: "Error calculating price. Using fallback."}));
            setCalculatedPrice(fallbackCalculatePrice(configState));
          });
      }
    }
  }, [configState, activeConfig, category, pageUiState.usingFallback]);

   const handleConfigChange = (id: string, value: any) => {
     setConfigState(prev => ({ ...prev, [id]: value }));
   };

  const handlePreviewPurchase = async () => {
    if (!activeConfig || Object.keys(configState).length === 0) {
        toast({ title: "Configuration not loaded", description: "Please wait for configuration to load or try again.", variant: "destructive"});
        return;
    }
    try {
      const configString = encodeURIComponent(JSON.stringify(configState));
      const price = calculatedPrice !== null ? calculatedPrice.toFixed(2) : '0.00';
      // Use generateConfigurationDescription from productService
      const description = await productService.generateConfigurationDescription(activeConfig.title, configState);
      router.push(`/preview?category=${category}&config=${configString}&price=${price}&description=${encodeURIComponent(description)}`);
    } catch (error) {
        console.error("Error navigating to preview:", error);
        toast({ title: "Preview Error", description: "Could not generate preview.", variant: "destructive"});
    }
  };

  const handleAddToBasket = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or create an account to add items to your basket.",
        variant: "destructive"
      });
      router.push(`/login?redirect=${encodeURIComponent(`/products/${category}/configure`)}`);
      return;
    }
    if (!activeConfig || Object.keys(configState).length === 0 || calculatedPrice === null) {
        toast({ title: "Configuration Incomplete", description: "Please ensure configuration is loaded and price is calculated.", variant: "destructive"});
        return;
    }

    setPageUiState(prev => ({ ...prev, addingToBasket: true, error: null }));

    try {
      const productName = activeConfig.title;
      // Use addToBasket from productService
      const result = await productService.addToBasket(
        user.uid,
        {
            productId: `${category}-${JSON.stringify(configState)}`,
            productName: productName,
            configuration: configState,
            price: calculatedPrice,
            quantity: 1,
        }
      );

      if (result) {
        toast({
          title: "Added to Basket",
          description: `${productName} has been added to your basket.`,
        });
        router.push('/basket');
      } else {
        toast({
          title: "Error",
          description: "Failed to add item to basket. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error adding to basket:', error);
      toast({
        title: "Error Adding to Basket",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setPageUiState(prev => ({ ...prev, addingToBasket: false }));
    }
  };

  if (isFetchingConfig && !activeConfig) { // Show loader only if no activeConfig (neither from Firestore nor fallback assigned yet)
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Configuration...</p>
      </div>
    );
  }

  // If after attempting to load/fallback, activeConfig is still null, then it's a true issue.
  if (!activeConfig) {
     // This case should ideally be covered by the fallback logic setting activeConfig.
     // If it's still null here, it implies an issue with the fallback logic itself or initial state.
     return (
        <div className="container mx-auto px-4 py-12 text-center text-red-500">
           <p>Critical error: Configuration could not be determined. Please contact support.</p>
        </div>
     );
  }

  return (
    <div>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">{activeConfig.title}</CardTitle>
              {pageUiState.usingFallback && (
                <p className="text-sm text-orange-500">(Default options shown due to a problem loading custom settings)</p>
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-8">
               {pageUiState.error && !pageUiState.usingFallback && ( // Only show general page error if not using fallback (fallback has its own message)
                  <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md text-center">
                    {pageUiState.error}
                  </div>
                )}
               <div className="space-y-6">
                 {activeConfig.options.map((option) => (
                  <div key={option.id} className="text-center">
                    <Label htmlFor={option.id} className="text-base font-medium block mb-2">{option.label}</Label>
                    {option.type === 'select' && (
                      <Select
                        value={configState[option.id] || option.defaultValue}
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
                            value={configState[option.id] || option.defaultValue}
                            onValueChange={(value) => handleConfigChange(option.id, value)}
                            className={cn(
                                "mt-2 grid gap-4 justify-center",
                                "grid-cols-2 max-w-md mx-auto"
                             )}
                         >
                           {option.options?.map((opt) => (
                             <Label key={opt.value} htmlFor={`${option.id}-${opt.value}`} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover/70 p-4 hover:bg-accent/50 hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <RadioGroupItem value={opt.value} id={`${option.id}-${opt.value}`} className="sr-only" />
                                 {opt.image && (
                                    <div className="mb-2 relative w-full aspect-[4/3] rounded overflow-hidden">
                                        <Image
                                            src={opt.image}
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
                 <div className="flex flex-col sm:flex-row gap-3 justify-center">
                   <Button
                     size="lg"
                     className="flex-1 max-w-xs mx-auto sm:mx-0"
                     onClick={handlePreviewPurchase}
                     disabled={calculatedPrice === null || calculatedPrice <= 0 || pageUiState.addingToBasket}
                   >
                     Preview Purchase <ArrowRight className="ml-2 h-5 w-5" />
                   </Button>
                   <Button
                     size="lg"
                     variant="secondary"
                     className="flex-1 max-w-xs mx-auto sm:mx-0"
                     onClick={handleAddToBasket}
                     disabled={calculatedPrice === null || calculatedPrice <= 0 || pageUiState.addingToBasket}
                   >
                     {pageUiState.addingToBasket ? (
                       <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                     ) : (
                       <>Add to Basket <ShoppingCart className="ml-2 h-5 w-5" /></>
                     )}
                   </Button>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
