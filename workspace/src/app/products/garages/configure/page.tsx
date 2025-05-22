
"use client"; // Needed for form/state

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
// import { Input } from '@/components/ui/input'; // Unused
// import { Separator } from '@/components/ui/separator'; // Unused
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight } from 'lucide-react';
// import Link from 'next/link'; // Unused
import { cn } from '@/lib/utils';
import type { CategoryConfig, RadioConfigOption, SelectConfigOption, SliderConfigOption, CheckboxConfigOption } from '@/types/configurator';


// --- Configuration Interfaces & Data ---

interface GarageConfigState {
  bays: number[];
  beamSize: string;
  trussType: 'curved' | 'straight';
  baySize: 'standard' | 'large';
  catSlide: boolean; // Applies to all bays based on a single checkbox
  // Individual bay cat slides removed for now to match UI. Re-add if needed.
  // catSlidePerBay: boolean[];
}

type GarageConfigValue = string | number[] | boolean;


// Specific configuration for Garages
const garageConfig: CategoryConfig = {
    title: "Configure Your Garage",
    options: [
      { id: 'oakType', label: 'Oak Type', type: 'select', options: [{ value: 'reclaimed', label: 'Reclaimed Oak' }, { value: 'kilned', label: 'Kilned Dried Oak' }], defaultValue: 'reclaimed' } as SelectConfigOption<'oakType', GarageConfigState>,
      { id: 'bays', label: 'Number of Bays (Added from Left)', type: 'slider', min: 1, max: 4, step: 1, defaultValue: [2] } as SliderConfigOption<'bays', GarageConfigState>,
      { id: 'beamSize', label: 'Structural Beam Sizes', type: 'select', options: [ { value: '6x6', label: '6 inch x 6 inch' }, { value: '7x7', label: '7 inch x 7 inch' }, { value: '8x8', label: '8 inch x 8 inch' } ], defaultValue: '6x6' } as SelectConfigOption<'beamSize', GarageConfigState>,
      { id: 'trussType', label: 'Truss Type', type: 'radio', options: [{ value: 'curved', label: 'Curved', image: '/images/config/truss-curved.jpg', dataAiHint: 'curved oak truss' }, { value: 'straight', label: 'Straight', image: '/images/config/truss-straight.jpg', dataAiHint: 'straight oak truss' }], defaultValue: 'curved' } as RadioConfigOption<'trussType', GarageConfigState>,
      { id: 'baySize', label: 'Size Per Bay', type: 'select', options: [{ value: 'standard', label: 'Standard (e.g., 3m wide)' }, { value: 'large', label: 'Large (e.g., 3.5m wide)' }], defaultValue: 'standard' } as SelectConfigOption<'baySize', GarageConfigState>,
      { id: 'catSlide', label: 'Include Cat Slide Roof? (Applies to all bays)', type: 'checkbox', defaultValue: false } as CheckboxConfigOption<'catSlide', GarageConfigState>,
    ]
};


// --- Helper Functions (Replace with actual pricing logic) ---

const calculatePrice = (config: GarageConfigState): number => {
  let basePrice = 0;
  const bays = config.bays?.[0] || 1;
  const catSlideCost = config.catSlide ? (150 * bays) : 0;
  const baySizeMultiplier = config.baySize === 'large' ? 1.1 : 1.0;
  const oakMultiplier = config.oakType === 'reclaimed' ? 1.15 : 1.0;
  let beamSizeCost = 0;
  switch (config.beamSize) {
    case '7x7': beamSizeCost = 200 * bays; break;
    case '8x8': beamSizeCost = 450 * bays; break;
    default: beamSizeCost = 0;
  }
  basePrice = (8000 + bays * 1500 + catSlideCost + beamSizeCost) * baySizeMultiplier * oakMultiplier;
  return Math.max(0, basePrice);
};

// --- Component ---

export default function ConfigureGaragePage() {
  const category = 'garages';
  const router = useRouter();

  const [configState, setConfigState] = useState<GarageConfigState>(() => {
    const initialState = {} as GarageConfigState;
    garageConfig.options.forEach(opt => {
      const key = opt.id as keyof GarageConfigState;
      initialState[key] = opt.defaultValue as GarageConfigState[typeof key];
    });
    return initialState;
  });

   const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

   useEffect(() => {
      setCalculatedPrice(calculatePrice(configState));
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [configState]);


   const handleConfigChange = (id: keyof GarageConfigState, value: GarageConfigValue) => {
     setConfigState((prev) => ({ ...prev, [id]: value }));
   };


   const handlePreviewPurchase = () => {
        const configString = encodeURIComponent(JSON.stringify(configState));
        const price = calculatedPrice !== null ? calculatedPrice.toFixed(2) : '0.00';
        router.push(`/preview?category=${category}&config=${configString}&price=${price}`);
   }


  return (
    <div>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">{garageConfig.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-8">
               <div className="space-y-6">
                 {garageConfig.options.map((option) => {
                    const optionKey = option.id as keyof GarageConfigState;
                    const currentValue = configState[optionKey];

                    return (
                      <div key={option.id} className="text-center">
                        <Label htmlFor={option.id} className="text-base font-medium block mb-2">{option.label}</Label>
                        {option.type === 'select' && (
                          <Select
                            value={currentValue as string}
                            onValueChange={(value) => handleConfigChange(optionKey, value)}
                          >
                            <SelectTrigger id={option.id} className="mt-2 bg-background/70 max-w-sm mx-auto justify-center">
                              <SelectValue placeholder={`Select ${option.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {(option as SelectConfigOption<keyof GarageConfigState, GarageConfigState>).options?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="justify-center">{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                         {option.type === 'radio' && (
                            <RadioGroup
                                value={currentValue as string}
                                onValueChange={(value) => handleConfigChange(optionKey, value as 'curved' | 'straight')}
                                className={cn(
                                    "mt-2 grid gap-4 justify-center",
                                    option.id === 'trussType' ? "grid-cols-2 max-w-md mx-auto" : "grid-cols-1 sm:grid-cols-2"
                                 )}
                             >
                               {(option as RadioConfigOption<keyof GarageConfigState, GarageConfigState>).options?.map((opt) => (
                                 <Label key={opt.value} htmlFor={`${option.id}-${opt.value}`} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover/70 p-4 hover:bg-accent/50 hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <RadioGroupItem value={opt.value} id={`${option.id}-${opt.value}`} className="sr-only" />
                                     {opt.image && (
                                        <div className="mb-2 relative w-full aspect-[4/3] rounded overflow-hidden">
                                            <Image
                                                src={opt.image.startsWith('/') ? opt.image : `https://placehold.co/200x150.png`}
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
                        {option.type === 'slider' && optionKey === 'bays' && (
                          <div className="mt-2 space-y-2 max-w-sm mx-auto">
                             <Slider
                                id={option.id}
                                min={(option as SliderConfigOption<keyof GarageConfigState, GarageConfigState>).min}
                                max={(option as SliderConfigOption<keyof GarageConfigState, GarageConfigState>).max}
                                step={(option as SliderConfigOption<keyof GarageConfigState, GarageConfigState>).step}
                                value={currentValue as number[]}
                                onValueChange={(value: number[]) => handleConfigChange(optionKey, value)}
                                className="py-2"
                              />
                              <div className="text-center text-sm text-muted-foreground">
                                {(currentValue as number[])?.[0]} {(option as SliderConfigOption<keyof GarageConfigState, GarageConfigState>).unit || ''}{(currentValue as number[])?.[0] > 1 ? 's' : ''}
                              </div>
                          </div>
                        )}
                        {option.type === 'checkbox' && optionKey === 'catSlide' && (
                           <div className="flex items-center justify-center space-x-2 mt-2">
                             <Checkbox
                                id={option.id}
                                checked={currentValue as boolean}
                                onCheckedChange={(checked) => handleConfigChange(optionKey, checked === 'indeterminate' ? false : checked)}
                              />
                              <Label htmlFor={option.id} className="font-normal">Yes</Label>
                           </div>
                        )}
                      </div>
                    );
                })}
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

    