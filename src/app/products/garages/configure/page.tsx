
"use client"; // Needed for form/state

// Add dynamic export configuration to prevent static generation
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Import cn utility

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

// Specific configuration for Garages
const garageConfig: CategoryConfig = {
    title: "Configure Your Garage",
    options: [
      { id: 'bays', label: 'Number of Bays (Added from Left)', type: 'slider', min: 1, max: 4, step: 1, defaultValue: [2] },
      { id: 'beamSize', label: 'Structural Beam Sizes', type: 'select', options: [ { value: '6x6', label: '6 inch x 6 inch' }, { value: '7x7', label: '7 inch x 7 inch' }, { value: '8x8', label: '8 inch x 8 inch' } ], defaultValue: '6x6' },
      { id: 'trussType', label: 'Truss Type', type: 'radio', options: [{ value: 'curved', label: 'Curved', image: '/images/config/truss-curved.jpg', dataAiHint: 'curved oak truss' }, { value: 'straight', label: 'Straight', image: '/images/config/truss-straight.jpg', dataAiHint: 'straight oak truss' }], defaultValue: 'curved' },
      { id: 'baySize', label: 'Size Per Bay', type: 'select', options: [{ value: 'standard', label: 'Standard (e.g., 3m wide)' }, { value: 'large', label: 'Large (e.g., 3.5m wide)' }], defaultValue: 'standard' },
      { id: 'catSlide', label: 'Include Cat Slide Roof? (Applies to all bays)', type: 'checkbox', defaultValue: false },
    ]
};

// Data fetching function for React Query
const fetchGarageConfig = async (): Promise<CategoryConfig> => {
  // In a real application, this would fetch from Firestore or an API
  // For now, we return the hardcoded config
  return new Promise((resolve) => {
    setTimeout(() => resolve(garageConfig), 500); // Simulate API call
  });
};

// --- Helper Functions (Replace with actual pricing logic) ---

const calculatePrice = (config: any): number => {
   // --- THIS IS A VERY BASIC PLACEHOLDER ---
   // --- Replace with actual pricing logic based on category ---
  let basePrice = 0;
  const bays = config.bays?.[0] || 1;
  // Calculate catSlide cost based on single checkbox and number of bays
  const catSlideCost = config.catSlide ? (150 * bays) : 0; // Example: 150 per bay if selected
  // Incorporate baySize into pricing (example logic)
  const baySizeMultiplier = config.baySize === 'large' ? 1.1 : 1.0;
  //const oakMultiplier = config.oakType === 'reclaimed' ? 1.15 : 1.0; // Removed oak multiplier
   // Incorporate beam size
   let beamSizeCost = 0;
   switch (config.beamSize) {
     case '7x7': beamSizeCost = 200 * bays; break;
     case '8x8': beamSizeCost = 450 * bays; break;
     default: beamSizeCost = 0; // 6x6 is base
   }

  basePrice = (8000 + bays * 1500 + catSlideCost + beamSizeCost) * baySizeMultiplier; // Removed oakMultiplier

  return Math.max(0, basePrice); // Ensure price is not negative
};

// --- Component ---

export default function ConfigureGaragePage() {
  const category = 'garages'; // Hardcoded for this specific page
  const router = useRouter(); // Initialize router

  const { data: categoryConfig, isLoading, isError, error } = useQuery<CategoryConfig, Error>({
    queryKey: ['garageConfig'],
    queryFn: fetchGarageConfig,
    staleTime: Infinity, // Configuration data is static for now
    refetchOnWindowFocus: false,
  });

  // Initialize state based on the fetched category config
  const [configState, setConfigState] = useState<any>({});
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  useEffect(() => {
    if (categoryConfig) {
      const initialState: any = {};
      categoryConfig.options.forEach(opt => {
        initialState[opt.id] = opt.defaultValue;
      });
      setConfigState(initialState);
      setCalculatedPrice(calculatePrice(initialState));
    }
  }, [categoryConfig]); // Re-run when categoryConfig is fetched or changes


   const handleConfigChange = (id: string, value: any) => {
     setConfigState((prev: any) => {
        const newState = { ...prev, [id]: value };
        // Update price dynamically
        setCalculatedPrice(calculatePrice(newState));
        return newState;
     });
   };


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading configuration...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-red-500">
        <p>Error loading configuration: {error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  if (!categoryConfig) {
    // This case should ideally be covered by isLoading/isError, but as a fallback
    notFound();
  }

   const handlePreviewPurchase = () => {
        const configString = encodeURIComponent(JSON.stringify(configState));
        const price = calculatedPrice !== null ? calculatedPrice.toFixed(2) : '0.00';
        router.push(`/preview?category=${category}&config=${configString}&price=${price}`);
   }


  return (
    // Removed relative isolate and background image handling
    <div>
        <div className="container mx-auto px-4 py-12">
           {/* Adjusted card appearance */}
          <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
            <CardHeader className="text-center"> {/* Center align header content */}
              <CardTitle className="text-3xl">{categoryConfig.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-8">
                {/* Configuration Options */}
               <div className="space-y-6">
                 {categoryConfig.options.map((option) => (
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
                                            src={`https://picsum.photos/seed/${opt.dataAiHint?.replace(/\s+/g, '-') || opt.value}/200/150`}
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

                {/* Price & Add to Basket Section */}
                 {/* Added margin top */}
               <div className="space-y-6 border-t border-border/50 pt-6 mt-4">
                 <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Estimated Price (excl. VAT & Delivery)</p>
                    <p className="text-3xl font-bold">
                       {calculatedPrice !== null ? `£${calculatedPrice.toFixed(2)}` : 'Calculating...'}
                    </p>
                 </div>
                   {/* Centered button */}
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
