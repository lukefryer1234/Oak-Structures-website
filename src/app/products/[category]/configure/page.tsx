
"use client"; // Needed for form/state

import { useState, useEffect } from 'react'; // Added useEffect
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Import cn utility

// --- Configuration Interfaces & Data (Replace with actual data/logic) ---

interface ConfigOption {
  id: string;
  label: string;
  type: 'select' | 'slider' | 'radio' | 'checkbox' | 'dimensions' | 'area' | 'preview'; // Added 'preview' type
  options?: { value: string; label: string; image?: string }[]; // For select/radio
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

// Ensure keys match the slugs used in the links (e.g., 'oak-beams')
const configurations: { [key: string]: CategoryConfig } = {
  garages: {
    title: "Configure Your Garage",
    options: [
      // Reordered options, removed oakType
      { id: 'bays', label: 'Number of Bays (Added from Left)', type: 'slider', min: 1, max: 4, step: 1, defaultValue: [2] },
      { id: 'preview', label: 'Preview', type: 'preview', dataAiHint: 'garage oak structure'}, // Placeholder for preview
      { id: 'trussType', label: 'Truss Type', type: 'radio', options: [{ value: 'curved', label: 'Curved', image: '/images/config/truss-curved.jpg', dataAiHint: 'curved oak truss' }, { value: 'straight', label: 'Straight', image: '/images/config/truss-straight.jpg', dataAiHint: 'straight oak truss' }], defaultValue: 'curved' },
      { id: 'sizeType', label: 'Size Type (Overall Dimensions)', type: 'select', options: [{ value: 'small', label: 'Small (e.g., 5m x 6m)' }, { value: 'medium', label: 'Medium (e.g., 6m x 6m)' }, { value: 'large', label: 'Large (e.g., 6m x 9m)' }], defaultValue: 'medium' },
      { id: 'catSlide', label: 'Include Cat Slide Roof? (Applies to all bays)', type: 'checkbox', defaultValue: false }, // Changed to apply to all
    ]
  },
  gazebos: {
    title: "Configure Your Gazebo",
    options: [
       { id: 'legType', label: 'Leg Type', type: 'select', options: [{ value: 'full', label: 'Full Height Legs' }, { value: 'wall', label: 'Wall Mount (Half Legs)' }], defaultValue: 'full' },
      { id: 'sizeType', label: 'Size Type', type: 'select', options: [{ value: '3x3', label: '3m x 3m' }, { value: '4x3', label: '4m x 3m' }, { value: '4x4', label: '4m x 4m' }], defaultValue: '3x3' },
      { id: 'trussType', label: 'Truss Type', type: 'radio', options: [{ value: 'curved', label: 'Curved', image: '/images/config/truss-curved.jpg', dataAiHint: 'curved oak truss' }, { value: 'straight', label: 'Straight', image: '/images/config/truss-straight.jpg', dataAiHint: 'straight oak truss' }], defaultValue: 'curved' },
       { id: 'oakType', label: 'Oak Type', type: 'select', options: [{ value: 'reclaimed', label: 'Reclaimed Oak' }, { value: 'kilned', label: 'Kilned Dried Oak' }], defaultValue: 'kilned' },
    ]
  },
   porches: {
    title: "Configure Your Porch",
    options: [
      { id: 'trussType', label: 'Truss Type', type: 'radio', options: [{ value: 'curved', label: 'Curved', image: '/images/config/truss-curved.jpg', dataAiHint: 'curved oak truss' }, { value: 'straight', label: 'Straight', image: '/images/config/truss-straight.jpg', dataAiHint: 'straight oak truss' }], defaultValue: 'curved' },
       { id: 'legType', label: 'Leg Type', type: 'select', options: [{ value: 'floor', label: 'Legs to Floor' }, { value: 'wall', label: 'Legs to Wall' }], defaultValue: 'floor' },
      { id: 'sizeType', label: 'Size Type', type: 'select', options: [{ value: 'narrow', label: 'Narrow (e.g., 1.5m Wide)' }, { value: 'standard', label: 'Standard (e.g., 2m Wide)' }, { value: 'wide', label: 'Wide (e.g., 2.5m Wide)' }], defaultValue: 'standard' },
       { id: 'oakType', label: 'Oak Type', type: 'select', options: [{ value: 'reclaimed', label: 'Reclaimed Oak' }, { value: 'kilned', label: 'Kilned Dried Oak' }], defaultValue: 'reclaimed' },
    ]
  },
   'oak-beams': {
      title: "Configure Your Oak Beams",
      options: [
        { id: 'oakType', label: 'Oak Type', type: 'select', options: [{ value: 'reclaimed', label: 'Reclaimed Oak' }, { value: 'kilned', label: 'Kilned Dried Oak' }, { value: 'green', label: 'Green Oak' }], defaultValue: 'green' },
        { id: 'dimensions', label: 'Dimensions (cm)', type: 'dimensions', unit: 'cm', defaultValue: { length: 200, width: 15, thickness: 15 } },
      ]
   },
    'oak-flooring': {
        title: "Configure Your Oak Flooring",
        options: [
         { id: 'oakType', label: 'Oak Type', type: 'select', options: [{ value: 'reclaimed', label: 'Reclaimed Oak' }, { value: 'kilned', label: 'Kilned Dried Oak' }], defaultValue: 'kilned' },
         { id: 'thickness', label: 'Thickness', type: 'area', fixedValue: '20mm' }, // Display only
         { id: 'area', label: 'Area Required', type: 'area', unit: 'm²', defaultValue: { area: 10, length: '', width: '' } }, // Allows direct area or length*width
        ]
    }
};

// --- Helper Functions (Replace with actual pricing logic) ---

const calculatePrice = (category: string, config: any): number => {
   // --- THIS IS A VERY BASIC PLACEHOLDER ---
   // --- Replace with actual pricing logic based on category ---
  let basePrice = 0;
  switch (category) {
    case 'garages':
        const bays = config.bays?.[0] || 1;
        // Calculate catSlide cost based on single checkbox and number of bays
        const catSlideCost = config.catSlide ? (150 * bays) : 0; // Example: 150 per bay if selected
        // Removed oakType from pricing calculation
        basePrice = 8000 + bays * 1500 + catSlideCost;
        break;
    case 'gazebos': basePrice = 3000 + (config.sizeType === '4x4' ? 500 : 0) + (config.oakType === 'reclaimed' ? 200 : 0); break;
    case 'porches': basePrice = 2000 + (config.sizeType === 'wide' ? 400 : 0) + (config.legType === 'floor' ? 150 : 0) + (config.oakType === 'reclaimed' ? 200 : 0); break; // Added back oakType for porches
    case 'oak-beams':
        const dims = config.dimensions || { length: 0, width: 0, thickness: 0 };
        const volumeM3 = (dims.length / 100) * (dims.width / 100) * (dims.thickness / 100);
        const unitPrice = config.oakType === 'reclaimed' ? 1200 : (config.oakType === 'kilned' ? 1000 : 800);
        basePrice = volumeM3 * unitPrice;
        break;
     case 'oak-flooring':
         const areaData = config.area || { area: 0, length: '', width: '' };
         let areaM2 = parseFloat(areaData.area);
         if (isNaN(areaM2) || areaM2 <= 0) {
            const lengthM = parseFloat(areaData.length) / 100; // Assume cm input for L/W calc
            const widthM = parseFloat(areaData.width) / 100;
            if (!isNaN(lengthM) && !isNaN(widthM) && lengthM > 0 && widthM > 0) {
                areaM2 = lengthM * widthM;
            } else {
                 areaM2 = 0;
            }
         }
         const floorUnitPrice = config.oakType === 'reclaimed' ? 90 : 75;
         basePrice = areaM2 * floorUnitPrice;
         break;
    default: basePrice = 500; // Default fallback
  }
  return Math.max(0, basePrice); // Ensure price is not negative
};

// --- Component ---

export default function ConfigureProductPage() {
  const params = useParams();
  const category = params.category as string; // Get category from URL
  const categoryConfig = configurations[category];

  // Initialize state based on the found category config
  const [configState, setConfigState] = useState<any>(() => {
    if (!categoryConfig) return {}; // Return empty if config not found
    const initialState: any = {};
    categoryConfig.options.forEach(opt => {
      // Remove per-bay initialization logic
      initialState[opt.id] = opt.defaultValue;
    });
    return initialState;
  });

   const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

   // Remove useEffect related to per-bay state management as it's no longer needed

   // Recalculate initial price when config is available or changes
   useEffect(() => {
      if (categoryConfig) {
          setCalculatedPrice(calculatePrice(category, configState));
      }
   }, [category, categoryConfig, configState]);


   const handleConfigChange = (id: string, value: any) => {
     setConfigState((prev: any) => {
        const newState = { ...prev, [id]: value };
        // Update price dynamically
        setCalculatedPrice(calculatePrice(category, newState));
        return newState;
     });
   };


  if (!categoryConfig) {
    // If the category slug doesn't match any config, show 404
    notFound();
  }

   const handleAreaChange = (value: string, type: 'area' | 'length' | 'width') => {
     setConfigState((prev: any) => {
        const newAreaState = { ...prev.area, [type]: value };

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
        setCalculatedPrice(calculatePrice(category, newState));
        return newState;
     });
   }

    const handleDimensionChange = (value: string, type: 'length' | 'width' | 'thickness') => {
     setConfigState((prev: any) => {
        const newDimState = { ...prev.dimensions, [type]: value };
        const newState = { ...prev, dimensions: newDimState };
        setCalculatedPrice(calculatePrice(category, newState));
        return newState;
     });
   }


   const handleAddToBasket = () => {
      // TODO: Add logic to add configured item to basket state/API
      alert(`Added ${categoryConfig.title} to basket with config: ${JSON.stringify(configState)} for £${calculatedPrice?.toFixed(2)}`);
   }


  return (
    <div>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
            <CardHeader className="text-center"> {/* Center align header content */}
              <CardTitle className="text-3xl">{categoryConfig.title}</CardTitle>
               {/* Removed Back to Home link */}
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-8">
                {/* Configuration Options */}
               <div className="space-y-6">
                 {categoryConfig.options.map((option) => (
                  <div key={option.id} className="text-center"> {/* Center align each option block */}
                    {/* Added text-center to center the label */}
                    <Label htmlFor={option.id} className="text-base font-medium block mb-2">{option.label}</Label>
                     {option.type === 'preview' && (
                        <div className="mt-2 max-w-md mx-auto aspect-video bg-muted/50 rounded-md border border-border/50 flex items-center justify-center">
                           {/* Preview Image placeholder */}
                            <Image
                                src={`https://picsum.photos/seed/${option.dataAiHint?.replace(/\s+/g, '-')}/400/225`} // Use placeholder URL
                                alt="Configuration Preview"
                                width={400}
                                height={225}
                                className="rounded object-cover"
                                data-ai-hint={option.dataAiHint}
                             />
                        </div>
                     )}
                    {option.type === 'select' && (
                      <Select
                        value={configState[option.id]}
                        onValueChange={(value) => handleConfigChange(option.id, value)}
                      >
                        <SelectTrigger id={option.id} className="mt-2 bg-background/70 max-w-sm mx-auto"> {/* Center trigger */}
                          <SelectValue placeholder={`Select ${option.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {option.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
                      <div className="mt-2 space-y-2 max-w-sm mx-auto"> {/* Center slider */}
                         <Slider
                            id={option.id}
                            min={option.min}
                            max={option.max}
                            step={option.step}
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
                          <Label htmlFor={option.id} className="font-normal">Yes</Label>
                       </div>
                    )}
                     {option.type === 'dimensions' && (
                         <div className="mt-2 grid grid-cols-3 gap-4 max-w-md mx-auto"> {/* Center dimensions */}
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
                      {option.type === 'area' && (
                         <div className="mt-2 space-y-4 max-w-md mx-auto"> {/* Center area */}
                             {option.fixedValue && (
                                 <div className="flex justify-between items-center text-sm px-4"> {/* Add padding */}
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

                {/* Price & Add to Basket Section */}
               <div className="space-y-6 border-t border-border/50 pt-6 mt-4"> {/* Add margin top */}
                 <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Estimated Price (excl. VAT & Delivery)</p>
                    <p className="text-3xl font-bold">
                       {calculatedPrice !== null ? `£${calculatedPrice.toFixed(2)}` : 'Calculating...'}
                    </p>
                 </div>
                  <Button size="lg" className="w-full max-w-xs mx-auto block" onClick={handleAddToBasket} disabled={calculatedPrice === null || calculatedPrice <= 0}> {/* Center button */}
                      Add to Basket <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
               </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

