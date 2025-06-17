
"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Remove local interface definitions, they will be imported
// interface GarageConfigValue { ... }
// interface GarageConfigOption { ... }
// interface GarageConfigData { ... }
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
// Import interfaces and calculatePrice function from the new file
import {
  GarageConfigData,
  // GarageConfigOption, // Not directly used in page.tsx props/state, but part of GarageConfigData
  // GarageConfigValue, // Not directly used in page.tsx props/state
  calculatePrice as calculatePurePrice // Alias to avoid conflict if needed, or use directly
} from './garagePricing';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, MinusIcon, PlusIcon } from 'lucide-react'; // ArrowRight might be unused now
import { cn } from '@/lib/utils';
import { useFirestoreDocument } from '@/hooks/firebase/useFirestoreDocument';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useBasket } from '@/context/basket-context';
import { AddToBasketPayload } from '@/context/basket-types';

// --- Firestore Data Structure Definition (Comment) ---
// This comment is now primarily in garagePricing.ts for direct reference by the logic.
// A summary could be kept here if desired, but for DRY principle, main definition is with the logic.
// --- End Firestore Data Structure Definition ---


// --- Component ---
export default function ConfigureGaragePage() {
  const category = 'garages'; // This might become dynamic if page handles multiple categories
  const router = useRouter();
  const { toast } = useToast(); // Already here
  const { addItem, isItemInBasket } = useBasket(); // Use the basket hook

  const {
    data: garageConfigData,
    isLoading,
    isError,
    error
  } = useFirestoreDocument<GarageConfigData>(
    'product_configurations',
    'garages_default_config',
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      onSuccess: (data) => console.log("Garage configuration loaded:", data),
      onError: (err) => {
        console.error("Error loading garage configuration:", err);
        toast({
          title: "Error Loading Configuration",
          description: err.message || "Could not load garage configuration. Please try again.",
          variant: "destructive",
        });
      },
    }
  );

  const [configState, setConfigState] = useState<any>({});
  const [overallQuantity, setOverallQuantity] = useState<number>(1);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  // Use the imported pure calculatePurePrice function within useCallback
  const calculatePriceCallback = useCallback((currentConfig: any, quantity: number, configData?: GarageConfigData): number | null => {
    return calculatePurePrice(currentConfig, quantity, configData);
  }, []); // calculatePurePrice is stable, so dependencies array is empty for this useCallback

  useEffect(() => {
    if (garageConfigData) {
      const initialState: any = {};
      garageConfigData.options.forEach(opt => {
        initialState[opt.id] = opt.defaultValue;
      });
      setConfigState(initialState);
      setCalculatedPrice(calculatePriceCallback(initialState, overallQuantity, garageConfigData));
    }
  }, [garageConfigData, overallQuantity, calculatePriceCallback]);

  const handleConfigChange = (id: string, value: any) => {
    setConfigState((prev: any) => {
      const newState = { ...prev, [id]: value };
      setCalculatedPrice(calculatePriceCallback(newState, overallQuantity, garageConfigData));
      return newState;
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    const quantity = Math.max(1, newQuantity); // Ensure quantity is at least 1
    setOverallQuantity(quantity);
    setCalculatedPrice(calculatePriceCallback(configState, quantity, garageConfigData));
  };

  // Placeholder for configuration summary generation
  function generateGarageConfigurationSummary(config: any, configDataRef: GarageConfigData | undefined): string {
    if (!configDataRef) return "Custom Garage";
    let summaryParts: string[] = [];
    summaryParts.push(`${config.bays?.[0] || 1} Bay(s)`);

    const beamSizeOption = configDataRef.options.find(o => o.id === 'beamSize');
    if (beamSizeOption && config.beamSize && beamSizeOption.values?.[config.beamSize]) {
      summaryParts.push(beamSizeOption.values[config.beamSize].label);
    }

    const trussTypeOption = configDataRef.options.find(o => o.id === 'trussType');
    if (trussTypeOption && config.trussType && trussTypeOption.values?.[config.trussType]) {
      summaryParts.push(trussTypeOption.values[config.trussType].label + " Truss");
    }

    const baySizeOption = configDataRef.options.find(o => o.id === 'baySize');
    if (baySizeOption && config.baySize && baySizeOption.values?.[config.baySize]) {
        summaryParts.push(`Bay Size: ${baySizeOption.values[config.baySize].label}`);
    }

    if (config.catSlide) {
      summaryParts.push("Cat Slide Roof");
    }
    return summaryParts.join(', ');
  }

  const handleAddToBasket = () => {
    if (!garageConfigData || calculatedPrice === null) {
      toast({
        title: "Error",
        description: "Configuration or price not available. Cannot add to basket.",
        variant: "destructive",
      });
      return;
    }

    const unitPrice = calculatedPrice / overallQuantity;
    if (isNaN(unitPrice) || unitPrice <= 0) {
        toast({
            title: "Price Error",
            description: "Invalid unit price. Cannot add to basket.",
            variant: "destructive",
          });
        return;
    }

    const payload: AddToBasketPayload = {
      productId: "GARAGE_CONFIGURABLE", // Static ID for configurable garage type
      productName: garageConfigData.title || "Custom Oak Garage",
      category: "garages",
      configuration: { ...configState },
      configurationSummary: generateGarageConfigurationSummary(configState, garageConfigData),
      quantity: overallQuantity,
      unitPrice: unitPrice,
      imageSrc: garageConfigData.image || '/images/garage-category.jpg', // Default image
    };
    addItem(payload);
    // The toast notification is now handled by the addItem function in BasketContext
  };

  const handlePayNow = () => {
    if (!garageConfigData || calculatedPrice === null) {
      toast({
        title: "Error",
        description: "Configuration or price not available.",
        variant: "destructive",
      });
      return;
    }
    const unitPrice = calculatedPrice / overallQuantity;
     if (isNaN(unitPrice) || unitPrice <= 0) {
        toast({
            title: "Price Error",
            description: "Invalid unit price. Cannot proceed to pay.",
            variant: "destructive",
          });
        return;
    }
    // First, add the current configuration to the basket
    const payload: AddToBasketPayload = {
      productId: "GARAGE_CONFIGURABLE",
      productName: garageConfigData.title || "Custom Oak Garage",
      category: "garages",
      configuration: { ...configState },
      configurationSummary: generateGarageConfigurationSummary(configState, garageConfigData),
      quantity: overallQuantity,
      unitPrice: unitPrice,
      imageSrc: garageConfigData.image || '/images/garage-category.jpg',
    };
    addItem(payload); // Add to basket first

    // Then, simulate proceeding to payment (e.g., redirect to checkout page)
    console.log("Proceeding to Pay Now with item added to basket:", payload);
    toast({
      title: "Added to Basket & Proceeding (Simulated)",
      description: `Redirecting to checkout with ${overallQuantity} "${garageConfigData.title || 'Garage'}"(s). Total: £${calculatedPrice?.toFixed(2)}`,
    });
    // router.push('/checkout'); // Example redirect
  };

  const itemAlreadyInBasket = garageConfigData ? isItemInBasket("GARAGE_CONFIGURABLE", { ...configState }) : undefined;
  // Loading and error states, rendering logic remains largely the same as before,
  // just ensuring that calculatePriceCallback is used.
  // The actual JSX for rendering options, quantity, price, and buttons
  // would be here, identical to the previous version of the component.
  // For brevity, I'm not repeating that large JSX block if it's unchanged
  // other than using calculatePriceCallback.

  if (isLoading) {
    // Skeleton rendering (same as before)
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <Skeleton className="h-8 w-3/4 mx-auto" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-8">
            <div className="space-y-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="text-center space-y-2">
                  <Skeleton className="h-6 w-1/2 mx-auto" />
                  <Skeleton className="h-10 w-3/4 mx-auto" />
                  {n === 2 && (
                    <div className="mt-2 grid gap-4 justify-center grid-cols-2 max-w-md mx-auto">
                      <Skeleton className="h-32 w-full rounded-md" />
                      <Skeleton className="h-32 w-full rounded-md" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-4 border-t border-border/50 pt-6 mt-4">
                <Skeleton className="h-6 w-1/3 mx-auto" />
                <Skeleton className="h-10 w-1/2 mx-auto" />
            </div>
            <div className="space-y-6 border-t border-border/50 pt-6 mt-4">
              <div className="text-center space-y-2">
                <Skeleton className="h-4 w-1/3 mx-auto" />
                <Skeleton className="h-10 w-1/2 mx-auto" />
              </div>
              <div className="flex justify-center gap-4">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-12 w-1/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !garageConfigData) {
    // Error UI (same as before)
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Card className="max-w-3xl mx-auto bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle className="text-2xl text-destructive-foreground text-center">Configuration Unavailable</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-destructive-foreground/90">
                    We encountered an issue loading the garage configuration options.
                    Please try refreshing the page or contact support.
                </p>
                {error && <p className="text-center text-xs text-destructive-foreground/70 mt-2">Error: {error.message}</p>}
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto bg-card/90 backdrop-blur-sm border border-border/70 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-semibold tracking-tight">{garageConfigData.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-10">
            <div className="space-y-8">
              {garageConfigData.options.map((option) => (
                <div key={option.id} className="text-center">
                  <Label htmlFor={option.id} className="text-lg font-medium block mb-3">{option.label}</Label>
                  {option.type === 'select' && option.values && (
                    <Select
                      value={configState[option.id] ?? option.defaultValue ?? ''}
                      onValueChange={(value) => handleConfigChange(option.id, value)}
                    >
                      <SelectTrigger id={option.id} className="mt-1 bg-background/80 max-w-md mx-auto justify-center text-base py-3">
                        <SelectValue placeholder={`Select ${option.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(option.values).map(([valueKey, optDetails]) => (
                          <SelectItem key={valueKey} value={valueKey} className="justify-center text-base py-2">{optDetails.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {option.type === 'radio' && option.values && (
                    <RadioGroup
                      value={configState[option.id] ?? option.defaultValue ?? ''}
                      onValueChange={(value) => handleConfigChange(option.id, value)}
                      className={cn(
                        "mt-1 grid gap-4 justify-center",
                        Object.keys(option.values).length <= 3 ? `grid-cols-${Object.keys(option.values).length}` : "grid-cols-2",
                        "max-w-lg mx-auto"
                      )}
                    >
                      {Object.entries(option.values).map(([valueKey, optDetails]) => (
                        <Label key={valueKey} htmlFor={`${option.id}-${valueKey}`} className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover/80 p-4 hover:bg-accent/60 hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10 cursor-pointer transition-all duration-150 ease-in-out shadow-sm hover:shadow-md">
                          <RadioGroupItem value={valueKey} id={`${option.id}-${valueKey}`} className="sr-only" />
                          {optDetails.image && (
                            <div className="mb-3 relative w-full aspect-[16/10] rounded-md overflow-hidden shadow">
                              <Image
                                src={optDetails.image.startsWith('/') ? optDetails.image : `https://picsum.photos/seed/${optDetails.dataAiHint?.replace(/\s+/g, '-') || valueKey}/320/200`}
                                alt={optDetails.label}
                                layout="fill"
                                objectFit="cover"
                                className="hover:scale-105 transition-transform duration-300"
                                data-ai-hint={optDetails.dataAiHint || optDetails.label}
                              />
                            </div>
                          )}
                          <span className="text-base font-medium mt-auto">{optDetails.label}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  )}
                  {option.type === 'slider' && (
                    <div className="mt-1 space-y-3 max-w-md mx-auto">
                      <Slider
                        id={option.id}
                        min={option.min || 1}
                        max={option.max || 10}
                        step={option.step || 1}
                        value={configState[option.id] !== undefined ? (Array.isArray(configState[option.id]) ? configState[option.id] : [configState[option.id]]) : (Array.isArray(option.defaultValue) ? option.defaultValue : [option.defaultValue])}
                        onValueChange={(value) => handleConfigChange(option.id, value)}
                        className="py-2"
                      />
                      <div className="text-center text-base text-muted-foreground">
                        {configState[option.id]?.[0] ?? option.defaultValue?.[0]} {option.unit || ''}{(configState[option.id]?.[0] ?? option.defaultValue?.[0]) > 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                  {option.type === 'checkbox' && (
                    <div className="flex items-center justify-center space-x-3 mt-1">
                      <Checkbox
                        id={option.id}
                        checked={configState[option.id] ?? option.defaultValue ?? false}
                        onCheckedChange={(checked) => handleConfigChange(option.id, checked)}
                        className="h-5 w-5"
                      />
                      <Label htmlFor={option.id} className="font-normal text-base">Yes</Label>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-6 border-t border-border/50 pt-8 mt-6">
              <div className="text-center">
                <Label htmlFor="overallQuantity" className="text-lg font-medium block mb-3">Quantity of Garages</Label>
                <div className="flex items-center justify-center max-w-xs mx-auto">
                  <Button variant="outline" size="icon" onClick={() => handleQuantityChange(overallQuantity - 1)} disabled={overallQuantity <= 1}>
                    <MinusIcon className="h-5 w-5" />
                  </Button>
                  <Input
                    id="overallQuantity"
                    type="number"
                    value={overallQuantity}
                    onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) handleQuantityChange(val);
                    }}
                    min="1"
                    className="w-20 text-center mx-2 text-lg font-semibold h-11"
                  />
                  <Button variant="outline" size="icon" onClick={() => handleQuantityChange(overallQuantity + 1)}>
                    <PlusIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-8 border-t border-border/50 pt-8 mt-0">
              <div className="text-center space-y-2">
                <p className="text-base text-muted-foreground">Estimated Total Price (excl. VAT & Delivery)</p>
                <p className="text-4xl font-bold tracking-tight">
                  {calculatedPrice !== null ? `£${calculatedPrice.toFixed(2)}` : 'Calculating...'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                <Button
                  size="xl"
                  className="flex-1 py-7 text-lg"
                  onClick={handleAddToBasket}
                  disabled={calculatedPrice === null || calculatedPrice <= 0 || isLoading || isError}
                >
                  {itemAlreadyInBasket ? "Update in Basket" : "Add to Basket"}
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  className="flex-1 py-7 text-lg"
                  onClick={handlePayNow}
                  disabled={calculatedPrice === null || calculatedPrice <= 0 || isLoading || isError}
                >
                  Pay Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
