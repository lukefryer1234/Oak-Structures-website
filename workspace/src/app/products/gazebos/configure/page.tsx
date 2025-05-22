
"use client"; // Needed for form/state

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { CardDescription, CardFooter } from '@/components/ui/card'; // Unused
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRouter } from 'next/navigation';
// import { notFound } from 'next/navigation'; // Unused
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategoryConfig, RadioConfigOption, SelectConfigOption } from '@/types/configurator';

// --- Configuration Interfaces & Data ---
interface GazeboConfigState {
  legType: 'full' | 'wall';
  sizeType: '3x3' | '4x3' | '4x4';
  trussType: 'curved' | 'straight';
}

type GazeboConfigValue = 'full' | 'wall' | '3x3' | '4x3' | '4x4' | 'curved' | 'straight';


// Specific configuration for Gazebos - Removed Oak Type
const gazeboConfig: CategoryConfig = {
    title: "Configure Your Gazebo",
    options: [
       { id: 'legType', label: 'Leg Type', type: 'select', options: [{ value: 'full', label: 'Full Height Legs' }, { value: 'wall', label: 'Wall Mount (Half Legs)' }], defaultValue: 'full' } as SelectConfigOption<'legType', GazeboConfigState>,
       { id: 'sizeType', label: 'Size Type', type: 'select', options: [{ value: '3x3', label: '3m x 3m' }, { value: '4x3', label: '4m x 3m' }, { value: '4x4', label: '4m x 4m' }], defaultValue: '3x3' } as SelectConfigOption<'sizeType', GazeboConfigState>,
       { id: 'trussType', label: 'Truss Type', type: 'radio', options: [{ value: 'curved', label: 'Curved', image: '/images/config/truss-curved.jpg', dataAiHint: 'curved oak truss' }, { value: 'straight', label: 'Straight', image: '/images/config/truss-straight.jpg', dataAiHint: 'straight oak truss' }], defaultValue: 'curved' } as RadioConfigOption<'trussType', GazeboConfigState>,
    ]
};

// --- Helper Functions ---

const calculatePrice = (config: GazeboConfigState): number => {
  let basePrice = 3000;
  if (config.sizeType === '4x4') basePrice += 500;
  if (config.sizeType === '4x3') basePrice += 250;
  if (config.legType === 'wall') basePrice -= 100;
  return Math.max(0, basePrice);
};

// --- Component ---

export default function ConfigureGazeboPage() {
  const category = 'gazebos';
  const router = useRouter();

  const [configState, setConfigState] = useState<GazeboConfigState>(() => {
    const initialState = {} as GazeboConfigState;
    gazeboConfig.options.forEach(opt => {
      const key = opt.id as keyof GazeboConfigState;
      initialState[key] = opt.defaultValue as GazeboConfigState[typeof key];
    });
    return initialState;
  });

   const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

   useEffect(() => {
      setCalculatedPrice(calculatePrice(configState));
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [configState]);

   const handleConfigChange = (id: keyof GazeboConfigState, value: GazeboConfigValue) => {
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
              <CardTitle className="text-3xl">{gazeboConfig.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-8">
               <div className="space-y-6">
                 {gazeboConfig.options.map((option) => {
                    const optionKey = option.id as keyof GazeboConfigState;
                    const currentValue = configState[optionKey];
                    return (
                      <div key={option.id} className="text-center">
                        <Label htmlFor={option.id} className="text-base font-medium block mb-2">{option.label}</Label>
                        {option.type === 'select' && (
                          <Select
                            value={currentValue}
                            onValueChange={(value) => handleConfigChange(optionKey, value as GazeboConfigValue)}
                          >
                            <SelectTrigger id={option.id} className="mt-2 bg-background/70 max-w-sm mx-auto justify-center">
                              <SelectValue placeholder={`Select ${option.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {(option as SelectConfigOption<keyof GazeboConfigState, GazeboConfigState>).options?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="justify-center">{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                         {option.type === 'radio' && (
                            <RadioGroup
                                value={currentValue}
                                onValueChange={(value) => handleConfigChange(optionKey, value as GazeboConfigValue)}
                                className={cn(
                                    "mt-2 grid gap-4 justify-center",
                                    "grid-cols-2 max-w-md mx-auto"
                                 )}
                             >
                               {(option as RadioConfigOption<keyof GazeboConfigState, GazeboConfigState>).options?.map((opt) => (
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

    