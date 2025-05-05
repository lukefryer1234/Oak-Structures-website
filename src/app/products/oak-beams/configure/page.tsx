
"use client"; // Needed for form/state

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Configuration Interfaces & Data ---

interface ConfigOption {
  id: string;
  label: string;
  type: 'select' | 'dimensions'; // Simplified for Beams
  options?: { value: string; label: string; }[];
  defaultValue?: any;
  unit?: string;
}

interface CategoryConfig {
  title: string;
  options: ConfigOption[];
}

// Specific configuration for Oak Beams
const oakBeamsConfig: CategoryConfig = {
      title: "Configure Your Oak Beams",
      options: [
        { id: 'oakType', label: 'Oak Type', type: 'select', options: [{ value: 'reclaimed', label: 'Reclaimed Oak' }, { value: 'kilned', label: 'Kilned Dried Oak' }, { value: 'green', label: 'Green Oak' }], defaultValue: 'green' },
        { id: 'dimensions', label: 'Dimensions (cm)', type: 'dimensions', unit: 'cm', defaultValue: { length: 200, width: 15, thickness: 15 } },
      ]
};

// --- Helper Functions ---

const calculatePrice = (config: any): number => {
  const dims = config.dimensions || { length: 0, width: 0, thickness: 0 };
  const lengthM = parseFloat(dims.length) / 100 || 0;
  const widthM = parseFloat(dims.width) / 100 || 0;
  const thicknessM = parseFloat(dims.thickness) / 100 || 0;
  const volumeM3 = lengthM * widthM * thicknessM;

  let unitPrice = 800; // Default to Green Oak price
  if (config.oakType === 'reclaimed') {
    unitPrice = 1200;
  } else if (config.oakType === 'kilned') {
    unitPrice = 1000;
  }

  const basePrice = volumeM3 * unitPrice;
  return Math.max(0, basePrice);
};

// --- Component ---

export default function ConfigureOakBeamsPage() {
  const category = 'oak-beams';
  const categoryConfig = oakBeamsConfig;

  const [configState, setConfigState] = useState<any>(() => {
    const initialState: any = {};
    categoryConfig.options.forEach(opt => {
      initialState[opt.id] = opt.defaultValue;
    });
    return initialState;
  });

   const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

   useEffect(() => {
      setCalculatedPrice(calculatePrice(configState));
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []); // Run only once

    const handleConfigChange = (id: string, value: any) => {
     setConfigState((prev: any) => {
        const newState = { ...prev, [id]: value };
        setCalculatedPrice(calculatePrice(newState));
        return newState;
     });
   };

    const handleDimensionChange = (value: string, type: 'length' | 'width' | 'thickness') => {
     setConfigState((prev: any) => {
        const newDimState = { ...(prev.dimensions || {}), [type]: value }; // Handle potential undefined dimensions
        const newState = { ...prev, dimensions: newDimState };
        setCalculatedPrice(calculatePrice(newState));
        return newState;
     });
   }


   const handleAddToBasket = () => {
      alert(`Added ${categoryConfig.title} to basket with config: ${JSON.stringify(configState)} for £${calculatedPrice?.toFixed(2)}`);
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
                        <SelectTrigger id={option.id} className="mt-2 bg-background/70 max-w-sm mx-auto">
                          <SelectValue placeholder={`Select ${option.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {option.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {option.type === 'dimensions' && (
                         <div className="mt-2 grid grid-cols-3 gap-4 max-w-md mx-auto">
                             <div className="text-center">
                               <Label htmlFor={`${option.id}-length`}>Length ({option.unit})</Label>
                               <Input id={`${option.id}-length`} type="number" min="1" step="any"
                                      value={configState[option.id]?.length || ''}
                                      onChange={(e) => handleDimensionChange(e.target.value, 'length')}
                                      className="mt-1 bg-background/70 text-center"/>
                             </div>
                             <div className="text-center">
                                <Label htmlFor={`${option.id}-width`}>Width ({option.unit})</Label>
                                <Input id={`${option.id}-width`} type="number" min="1" step="any"
                                       value={configState[option.id]?.width || ''}
                                       onChange={(e) => handleDimensionChange(e.target.value, 'width')}
                                       className="mt-1 bg-background/70 text-center"/>
                             </div>
                              <div className="text-center">
                                <Label htmlFor={`${option.id}-thickness`}>Thickness ({option.unit})</Label>
                                <Input id={`${option.id}-thickness`} type="number" min="1" step="any"
                                       value={configState[option.id]?.thickness || ''}
                                       onChange={(e) => handleDimensionChange(e.target.value, 'thickness')}
                                       className="mt-1 bg-background/70 text-center"/>
                             </div>
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
                  <Button size="lg" className="w-full max-w-xs mx-auto block" onClick={handleAddToBasket} disabled={calculatedPrice === null || calculatedPrice <= 0}>
                      Add to Basket <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
               </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

    