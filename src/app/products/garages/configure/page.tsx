"use client"; // Needed for form/state

// Add dynamic export configuration to prevent static generation
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { notFound, useRouter } from 'next/navigation'; // Added useRouter
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ShoppingCart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Import cn utility
import { useFirestoreDocument } from '@/hooks/firebase/useFirestoreDocument';
import { productService, type ConfigState, type BasketItem } from '@/services/domain/product-service';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

// --- Configuration Interfaces & Data (Replace with actual data/logic) ---

interface ConfigOption {
  id: string;
  label: string;
  type: 'select' | 'slider' | 'radio' | 'checkbox' | 'dimensions' | 'area'; // Removed 'preview' type
  options?: { value: string; label: string; image?: string, dataAiHint?: string }[]; // For select/radio, added dataAiHint
  min?: number; // For slider/numeric inputs
  max?: number; // For slider/numeric inputs
  step?: number; // For slider/numeric inputs
  defaultValue?: any;
  unit?: string; // For dimensions/area
  fixedValue?: string | number; // For non-editable display like flooring thickness
  perBay?: boolean; // True if the option applies individually to each bay
  dataAiHint?: string; // Added for preview placeholder
}


interface CategoryConfig {
  title: string;
  options: ConfigOption[];
  image?: string; // Main category image for config page
  dataAiHint?: string;
}

// --- Fallback Configuration and Pricing ---
const fallbackGarageConfig: CategoryConfig = {
  title: "Configure Your Garage (Using Fallback Data)",
  options: [
    { id: 'bays', label: 'Number of Bays (Added from Left)', type: 'slider', min: 1, max: 4, step: 1, defaultValue: [2] },
    { id: 'beamSize', label: 'Structural Beam Sizes', type: 'select', options: [ { value: '6x6', label: '6 inch x 6 inch' }, { value: '7x7', label: '7 inch x 7 inch' }, { value: '8x8', label: '8 inch x 8 inch' } ], defaultValue: '6x6' },
    { id: 'trussType', label: 'Truss Type', type: 'radio', options: [{ value: 'curved', label: 'Curved', image: '/images/config/truss-curved.jpg', dataAiHint: 'curved oak truss' }, { value: 'straight', label: 'Straight', image: '/images/config/truss-straight.jpg', dataAiHint: 'straight oak truss' }], defaultValue: 'curved' },
    { id: 'baySize', label: 'Size Per Bay', type: 'select', options: [{ value: 'standard', label: 'Standard (e.g., 3m wide)' }, { value: 'large', label: 'Large (e.g., 3.5m wide)' }], defaultValue: 'standard' },
    { id: 'catSlide', label: 'Include Cat Slide Roof? (Applies to all bays)', type: 'checkbox', defaultValue: false },
  ]
};

const fallbackCalculatePrice = (config: ConfigState): number => {
  let basePrice = 8000; // Base price for a single bay garage
  const bays = config.bays?.[0] || 1;
  basePrice += (bays - 1) * 1500;
  if (config.catSlide) {
    basePrice += 150 * bays;
  }
  let beamSizeCost = 0;
  switch (config.beamSize) {
    case '7x7': beamSizeCost = 200; break; // Note: original fallback had bays multiplier here, removing for consistency with service version
    case '8x8': beamSizeCost = 450; break;
  }
  basePrice += beamSizeCost;
  if (config.baySize === 'large') {
    basePrice += 300 * bays;
  }
  return Math.max(0, basePrice);
};

// --- Component ---

export default function ConfigureGaragePage() {
  const category = 'garages'; // Hardcoded for this specific page
  const router = useRouter(); // Initialize router
  const { user } = useAuth();
  const { toast } = useToast();
  const [pageUiState, setPageUiState] = useState<{ usingFallback: boolean; error: string | null; isAddingToBasket: boolean }>({
    usingFallback: false,
    error: null,
    isAddingToBasket: false,
  });
  const { data: firestoreData, isLoading: isLoadingConfig, error: firestoreError } = useFirestoreDocument<CategoryConfig>('product_configurators/garages');
  const [activeConfig, setActiveConfig] = useState<CategoryConfig | null>(null);
  const [configState, setConfigState] = useState<ConfigState>({});
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoadingConfig) {
      if (firestoreError || !firestoreData) {
        console.warn("Firestore config error or no data, using fallback for garages.", firestoreError);
        setActiveConfig(fallbackGarageConfig);
        setPageUiState(prev => ({ ...prev, usingFallback: true, error: firestoreError ? "Failed to load custom configuration, using default options." : null }));
      } else {
        setActiveConfig(firestoreData);
        setPageUiState(prev => ({ ...prev, usingFallback: false, error: null }));
      }
    }
  }, [firestoreData, isLoadingConfig, firestoreError]);

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
        productService.calculateProductPrice('garages-configurable', configState)
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
     setConfigState((prev: any) => {
        const newState = { ...prev, [id]: value };
        // Price recalculation is handled by the useEffect above
        return newState;
     });
   };

  const handlePreviewPurchase = async () => {
    if (!activeConfig || Object.keys(configState).length === 0) {
        toast({ title: "Configuration not loaded", description: "Please wait for configuration to load or try again.", variant: "destructive"});
        return;
    }
    try {
      const configString = encodeURIComponent(JSON.stringify(configState));
      const price = calculatedPrice !== null ? calculatedPrice.toFixed(2) : '0.00';
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
    setPageUiState(prev => ({ ...prev, isAddingToBasket: true, error: null }));
    try {
      const productName = activeConfig.title;
      const itemDetails: Omit<BasketItem, 'id' | 'addedAt'> = { // Ensure BasketItem is imported or defined
        productId: `${category}-${JSON.stringify(configState)}`,
        productName: productName,
        configuration: configState,
        price: calculatedPrice,
        quantity: 1,
        // imageUrl: activeConfig.image || undefined // Optional: use main category image or a specific one
      };
      const result = await productService.addToBasket(user.uid, itemDetails);
      if (result) {
        toast({
          title: "Added to Basket",
          description: `${productName} has been added to your basket.`,
        });
        router.push('/basket');
      } else {
        toast({ title: "Error", description: "Failed to add item to basket. Please try again.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error('Error adding to basket:', error);
      toast({ title: "Error Adding to Basket", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setPageUiState(prev => ({ ...prev, isAddingToBasket: false }));
    }
  };

  if (isLoadingConfig && !activeConfig) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Configuration...</p>
      </div>
    );
  }

  // If after attempting to load/fallback, activeConfig is still null, then it's a true issue.
  if (!activeConfig) {
     return (
        <div className="container mx-auto px-4 py-12 text-center text-red-500">
           <p>Critical error: Configuration could not be determined. Please contact support.</p>
        </div>
     );
  }

  return (
    // Removed relative isolate and background image handling
    <div>
        <div className="container mx-auto px-4 py-12">
           {/* Adjusted card appearance */}
          <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
            <CardHeader className="text-center"> {/* Center align header content */}
              <CardTitle className="text-3xl">{activeConfig.title}</CardTitle>
              {pageUiState.usingFallback && (<p className="text-sm text-orange-500">(Default options shown due to a problem loading custom settings)</p>)}
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-8">
                {pageUiState.error && !pageUiState.usingFallback && (<div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md text-center">{pageUiState.error}</div>)}
                {/* Configuration Options */}
               <div className="space-y-6">
                 {activeConfig.options.map((option) => (
                  <div key={option.id} className="text-center"> {/* Center align each option block */}
                    {/* Added text-center to center the label */}
                    <Label htmlFor={option.id} className="text-base font-medium block mb-2">{option.label}</Label>
                    {option.type === 'select' && (
                      <Select
                        value={configState[option.id]}
                        onValueChange={(value) => handleConfigChange(option.id, value)}
                      >
                         {/* Adjusted background and centered */}
                         {/* Added justify-center */}
                        <SelectTrigger id={option.id} className="mt-2 bg-background/70 max-w-sm mx-auto justify-center">
                          <SelectValue placeholder={`Select ${option.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {option.options?.map((opt) => (
                            // Added justify-center to SelectItem
                            <SelectItem key={opt.value} value={opt.value} className="justify-center">{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                     {option.type === 'radio' && (
                        <RadioGroup
                            value={configState[option.id]}
                            onValueChange={(value) => handleConfigChange(option.id, value)}
                             // Make trussType options side-by-side
                            className={cn(
                                "mt-2 grid gap-4 justify-center", // Center the group
                                option.id === 'trussType' ? "grid-cols-2 max-w-md mx-auto" : "grid-cols-1 sm:grid-cols-2" // Use grid-cols-2 for trussType
                             )}
                         >
                           {option.options?.map((opt) => (
                              // Adjusted background and added cursor pointer
                             <Label key={opt.value} htmlFor={`${option.id}-${opt.value}`} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover/70 p-4 hover:bg-accent/50 hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <RadioGroupItem value={opt.value} id={`${option.id}-${opt.value}`} className="sr-only" />
                                 {/* Add image rendering for radio options */}
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
                    {option.type === 'slider' && (
                       // Centered slider
                      <div className="mt-2 space-y-2 max-w-sm mx-auto">
                         <Slider
                            id={option.id}
                            min={option.min || 1}
                            max={option.max || 10}
                            step={option.step || 1}
                            value={configState[option.id]}
                            onValueChange={(value) => handleConfigChange(option.id, value)}
                            className="py-2"
                          />
                          <div className="text-center text-sm text-muted-foreground">
                            {configState[option.id]?.[0]} {option.unit || ''}{configState[option.id]?.[0] > 1 ? 's' : ''}
                          </div>
                      </div>
                    )}
                    {/* Standard checkbox rendering (not per bay) */}
                    {option.type === 'checkbox' && (
                       <div className="flex items-center justify-center space-x-2 mt-2">
                         <Checkbox
                            id={option.id}
                            checked={configState[option.id]}
                            onCheckedChange={(checked) => handleConfigChange(option.id, checked)}
                          />
                           {/* Added normal weight */}
                          <Label htmlFor={option.id} className="font-normal">Yes</Label>
                       </div>
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
                     disabled={calculatedPrice === null || calculatedPrice <= 0 || pageUiState.isAddingToBasket || !activeConfig}
                   >
                     Preview Purchase <ArrowRight className="ml-2 h-5 w-5" />
                   </Button>
                   <Button
                     size="lg"
                     variant="secondary"
                     className="flex-1 max-w-xs mx-auto sm:mx-0"
                     onClick={handleAddToBasket}
                     disabled={calculatedPrice === null || calculatedPrice <= 0 || pageUiState.isAddingToBasket || !activeConfig}
                   >
                     {pageUiState.isAddingToBasket ? (
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
