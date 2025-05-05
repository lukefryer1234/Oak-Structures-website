
"use client"; // Needed for form/state

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { notFound, useRouter } from 'next/navigation'; // Added useRouter
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Configuration Interfaces & Data ---

interface ConfigOption {
  id: string;
  label: string;
  type: 'select' | 'area'; // Simplified for Flooring
  options?: { value: string; label: string; }[];
  defaultValue?: any;
  unit?: string;
  fixedValue?: string | number;
}

interface CategoryConfig {
  title: string;
  options: ConfigOption[];
}

// Specific configuration for Oak Flooring
const oakFlooringConfig: CategoryConfig = {
        title: "Configure Your Oak Flooring",
        options: [
         { id: 'oakType', label: 'Oak Type', type: 'select', options: [{ value: 'reclaimed', label: 'Reclaimed Oak' }, { value: 'kilned', label: 'Kilned Dried Oak' }], defaultValue: 'kilned' },
         { id: 'thickness', label: 'Thickness', type: 'area', fixedValue: '20mm' }, // Display only
         { id: 'area', label: 'Area Required', type: 'area', unit: 'm²', defaultValue: { area: 10, length: '', width: '' } }, // Allows direct area or length*width
        ]
    };

// --- Helper Functions ---

const calculatePrice = (config: any): number => {
  const areaData = config.area || { area: 0, length: '', width: '' };
  let areaM2 = parseFloat(areaData.area);

  if (isNaN(areaM2) || areaM2 <= 0) {
    const lengthM = parseFloat(areaData.length) / 100; // Assume cm input for L/W calc
    const widthM = parseFloat(areaData.width) / 100;
    if (!isNaN(lengthM) && !isNaN(widthM) && lengthM > 0 && widthM > 0) {
      areaM2 = lengthM * widthM;
    } else {
      areaM2 = 0; // Default to 0 if invalid
    }
  }

  const floorUnitPrice = config.oakType === 'reclaimed' ? 90 : 75;
  const basePrice = areaM2 * floorUnitPrice;
  return Math.max(0, basePrice);
};

// --- Component ---

export default function ConfigureOakFlooringPage() {
  const category = 'oak-flooring';
  const categoryConfig = oakFlooringConfig;
  const router = useRouter(); // Initialize router

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

   const handleAreaChange = (value: string, type: 'area' | 'length' | 'width') => {
     setConfigState((prev: any) => {
        const newAreaState = { ...(prev.area || {}), [type]: value }; // Handle potential undefined area

         // If length/width changed, clear direct area input
         if (type === 'length' || type === 'width') {
            newAreaState.area = '';
         }
         // If direct area changed, clear length/width
         if(type === 'area') {
             newAreaState.length = '';
             newAreaState.width = '';
         }

        const newState = { ...prev, area: newAreaState };
        setCalculatedPrice(calculatePrice(newState));
        return newState;
     });
   }

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
                     {option.type === 'area' && (
                         <div className="mt-2 space-y-4 max-w-md mx-auto">
                             {option.fixedValue && (
                                 <div className="flex justify-between items-center text-sm px-4">
                                     <span className="text-muted-foreground">{option.label}:</span>
                                     <span className="font-medium">{option.fixedValue}</span>
                                 </div>
                             )}
                             {!option.fixedValue && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                        <div className="text-center">
                                          <Label htmlFor={`${option.id}-area`}>Area ({option.unit})</Label>
                                          <Input id={`${option.id}-area`} type="number" min="0.1" step="any"
                                                 placeholder={`Enter area directly`}
                                                 value={configState[option.id]?.area || ''}
                                                 onChange={(e) => handleAreaChange(e.target.value, 'area')}
                                                 className="mt-1 bg-background/70 text-center"/>
                                        </div>
                                        <div className="text-center text-sm text-muted-foreground pb-2">OR</div>
                                    </div>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="text-center">
                                          <Label htmlFor={`${option.id}-length`}>Length (cm)</Label>
                                          <Input id={`${option.id}-length`} type="number" min="1" step="any"
                                                 placeholder="Calculate area"
                                                 value={configState[option.id]?.length || ''}
                                                 onChange={(e) => handleAreaChange(e.target.value, 'length')}
                                                 className="mt-1 bg-background/70 text-center"/>
                                        </div>
                                        <div className="text-center">
                                           <Label htmlFor={`${option.id}-width`}>Width (cm)</Label>
                                           <Input id={`${option.id}-width`} type="number" min="1" step="any"
                                                  placeholder="Calculate area"
                                                  value={configState[option.id]?.width || ''}
                                                  onChange={(e) => handleAreaChange(e.target.value, 'width')}
                                                  className="mt-1 bg-background/70 text-center"/>
                                        </div>
                                     </div>
                                </>
                             )}
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
