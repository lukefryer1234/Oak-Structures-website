
"use client"; // Needed for form/state

// Add dynamic export configuration to prevent static generation
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Configuration Interfaces & Data ---

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
}

// Specific configuration for Porches
const porchConfig: CategoryConfig = {
    title: "Configure Your Porch",
    options: [
      { id: 'trussType', label: 'Truss Type', type: 'radio', options: [{ value: 'curved', label: 'Curved', image: '/images/config/truss-curved.jpg', dataAiHint: 'curved oak truss' }, { value: 'straight', label: 'Straight', image: '/images/config/truss-straight.jpg', dataAiHint: 'straight oak truss' }], defaultValue: 'curved' },
      { id: 'legType', label: 'Leg Type', type: 'select', options: [{ value: 'floor', label: 'Legs to Floor' }, { value: 'wall', label: 'Legs to Wall' }], defaultValue: 'floor' },
      { id: 'sizeType', label: 'Size Type', type: 'select', options: [{ value: 'narrow', label: 'Narrow (e.g., 1.5m Wide)' }, { value: 'standard', label: 'Standard (e.g., 2m Wide)' }, { value: 'wide', label: 'Wide (e.g., 2.5m Wide)' }], defaultValue: 'standard' },
    ]
};

// Data fetching function for React Query
const fetchPorchConfig = async (): Promise<CategoryConfig> => {
  // In a real application, this would fetch from Firestore or an API
  // For now, we return the hardcoded config
  return new Promise((resolve) => {
    setTimeout(() => resolve(porchConfig), 500); // Simulate API call
  });
};

// --- Helper Functions ---

const calculatePrice = (config: any): number => {
  let basePrice = 2000; // Base price for Porch
  if (config.sizeType === 'wide') basePrice += 400;
  if (config.sizeType === 'narrow') basePrice -= 200;
  if (config.legType === 'floor') basePrice += 150;
  // if (config.oakType === 'reclaimed') basePrice += 200; // Removed oak type condition
  // Add other pricing adjustments based on config.trussType if needed
  return Math.max(0, basePrice);
};

// --- Component ---

export default function ConfigurePorchPage() {
  const category = 'porches';
  const router = useRouter(); // Initialize router

  const { data: categoryConfig, isLoading, isError, error } = useQuery<CategoryConfig, Error>({
    queryKey: ['porchConfig'],
    queryFn: fetchPorchConfig,
    staleTime: Infinity, // Configuration data is static for now
    refetchOnWindowFocus: false,
  });

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
        setCalculatedPrice(calculatePrice(newState));
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
    notFound();
  }

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
                        value={configState[option.id]}
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
                            value={configState[option.id]}
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
