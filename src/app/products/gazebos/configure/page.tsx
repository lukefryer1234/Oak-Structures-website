
"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input'; // Added Input
import { Checkbox } from '@/components/ui/checkbox'; // Added Checkbox, though not in seed, good for consistency
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MinusIcon, PlusIcon } from 'lucide-react'; // Added icons for quantity
import { cn } from '@/lib/utils';
import { useFirestoreDocument } from '@/hooks/firebase/useFirestoreDocument';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useBasket } from '@/context/basket-context';
import { AddToBasketPayload } from '@/context/basket-types';
// Import interfaces and pricing function from the new file
import {
  GazeboConfigData,
  // GazeboConfigOption, // Not directly used in page.tsx props/state
  // GazeboConfigValue,  // Not directly used in page.tsx props/state
  calculateGazeboPrice as calculatePureGazeboPrice
} from './gazeboPricing';

// --- Component ---
export default function ConfigureGazeboPage() {
  const category = 'gazebos';
  const router = useRouter();
  const { toast } = useToast();
  const { addItem, isItemInBasket } = useBasket();

  const {
    data: gazeboConfigData,
    isLoading,
    isError,
    error
  } = useFirestoreDocument<GazeboConfigData>(
    'product_configurations',
    'gazebos_default_config',
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      onSuccess: (data) => console.log("Gazebo configuration loaded:", data),
      onError: (err) => {
        console.error("Error loading gazebo configuration:", err);
        toast({
          title: "Error Loading Configuration",
          description: err.message || "Could not load gazebo configuration. Please try again.",
          variant: "destructive",
        });
      },
    }
  );

  const [configState, setConfigState] = useState<any>({});
  const [overallQuantity, setOverallQuantity] = useState<number>(1);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  // Use the imported pure calculatePureGazeboPrice function within useCallback
  const calculatePriceCallback = useCallback((currentConfig: any, quantity: number, configData?: GazeboConfigData): number | null => {
    return calculatePureGazeboPrice(currentConfig, quantity, configData);
  }, []); // calculatePureGazeboPrice is stable, so dependencies array is empty

  useEffect(() => {
    if (gazeboConfigData) {
      const initialState: any = {};
      gazeboConfigData.options.forEach(opt => {
        initialState[opt.id] = opt.defaultValue;
      });
      setConfigState(initialState);
      setCalculatedPrice(calculatePriceCallback(initialState, overallQuantity, gazeboConfigData));
    }
  }, [gazeboConfigData, overallQuantity, calculatePriceCallback]);

  const handleConfigChange = (id: string, value: any) => {
    setConfigState((prev: any) => {
      const newState = { ...prev, [id]: value };
      setCalculatedPrice(calculatePriceCallback(newState, overallQuantity, gazeboConfigData));
      return newState;
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    const quantity = Math.max(1, newQuantity);
    setOverallQuantity(quantity);
    setCalculatedPrice(calculatePriceCallback(configState, quantity, gazeboConfigData));
  };

  function generateGazeboConfigurationSummary(config: any, configDataRef: GazeboConfigData | undefined): string {
    if (!configDataRef) return "Custom Gazebo";
    let summaryParts: string[] = [];
    configDataRef.options.forEach(option => {
        const selectedValue = config[option.id];
        if (selectedValue !== undefined) {
            if (option.type === 'checkbox') {
                if (selectedValue) summaryParts.push(option.label);
            } else if (option.values && option.values[selectedValue]) {
                summaryParts.push(option.values[selectedValue].label);
            }
        }
    });
    return summaryParts.join(', ') || "Standard Configuration";
  }

  const handleAddToBasket = () => {
    if (!gazeboConfigData || calculatedPrice === null) {
      toast({ title: "Error", description: "Configuration or price not available.", variant: "destructive" });
      return;
    }
    const unitPrice = calculatedPrice / overallQuantity;
     if (isNaN(unitPrice) || unitPrice <= 0) {
        toast({ title: "Price Error", description: "Invalid unit price.", variant: "destructive"});
        return;
    }
    const payload: AddToBasketPayload = {
      productId: "GAZEBO_CONFIGURABLE",
      productName: gazeboConfigData.title || "Custom Oak Gazebo",
      category: "gazebos",
      configuration: { ...configState },
      configurationSummary: generateGazeboConfigurationSummary(configState, gazeboConfigData),
      quantity: overallQuantity,
      unitPrice: unitPrice,
      imageSrc: gazeboConfigData.image || '/images/gazebo-category.jpg',
    };
    addItem(payload);
  };

  const handlePayNow = () => {
    if (!gazeboConfigData || calculatedPrice === null) {
      toast({ title: "Error", description: "Configuration or price not available.", variant: "destructive" });
      return;
    }
    const unitPrice = calculatedPrice / overallQuantity;
    if (isNaN(unitPrice) || unitPrice <= 0) {
        toast({ title: "Price Error", description: "Invalid unit price.", variant: "destructive"});
        return;
    }
    const payload: AddToBasketPayload = {
      productId: "GAZEBO_CONFIGURABLE",
      productName: gazeboConfigData.title || "Custom Oak Gazebo",
      category: "gazebos",
      configuration: { ...configState },
      configurationSummary: generateGazeboConfigurationSummary(configState, gazeboConfigData),
      quantity: overallQuantity,
      unitPrice: unitPrice,
      imageSrc: gazeboConfigData.image || '/images/gazebo-category.jpg',
    };
    addItem(payload);
    console.log("Proceeding to Pay Now with item added to basket:", payload);
    toast({
      title: "Added to Basket & Proceeding (Simulated)",
      description: `Redirecting to checkout with ${overallQuantity} "${gazeboConfigData.title || 'Gazebo'}"(s). Total: £${calculatedPrice?.toFixed(2)}`,
    });
    // router.push('/checkout');
  };

  const itemAlreadyInBasket = gazeboConfigData ? isItemInBasket("GAZEBO_CONFIGURABLE", { ...configState }) : undefined;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-8 pt-4">
            <div className="space-y-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="text-center space-y-2">
                  <Skeleton className="h-6 w-1/2 mx-auto" />
                  <Skeleton className="h-10 w-3/4 mx-auto" />
                  {n === 1 && (
                    <div className="mt-2 grid gap-4 justify-center grid-cols-2 max-w-md mx-auto">
                      <Skeleton className="h-32 w-full rounded-md" />
                      <Skeleton className="h-32 w-full rounded-md" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-4 border-t pt-6 mt-4">
                <Skeleton className="h-6 w-1/3 mx-auto" />
                <Skeleton className="h-10 w-1/2 mx-auto" />
            </div>
            <div className="space-y-6 border-t pt-6 mt-4">
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

  if (isError || !gazeboConfigData) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Card className="max-w-3xl mx-auto bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle className="text-2xl text-destructive-foreground text-center">Configuration Unavailable</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-destructive-foreground/90">
                    We encountered an issue loading configuration options.
                    Please try refreshing or contact support.
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
            <CardTitle className="text-3xl font-semibold tracking-tight">{gazeboConfigData.title}</CardTitle>
            {gazeboConfigData.description && (
                <p className="text-muted-foreground mt-2 text-lg">{gazeboConfigData.description}</p>
            )}
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-10 pt-8">
            <div className="space-y-8">
              {gazeboConfigData.options.map((option) => (
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
                  {option.type === 'checkbox' && ( // Added checkbox rendering
                    <div className="flex items-center justify-center space-x-3 mt-1">
                      <Checkbox
                        id={option.id}
                        checked={configState[option.id] ?? option.defaultValue ?? false}
                        onCheckedChange={(checked) => handleConfigChange(option.id, checked as boolean)}
                        className="h-5 w-5"
                      />
                      <Label htmlFor={option.id} className="font-normal text-base">Yes</Label>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-6 border-t pt-8 mt-6">
              <div className="text-center">
                <Label htmlFor="overallQuantity" className="text-lg font-medium block mb-3">Quantity</Label>
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

            <div className="space-y-8 border-t pt-8 mt-0">
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
