"use client"; // Needed for form/state

import { useState } from 'react';
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

// --- Configuration Interfaces & Data (Replace with actual data/logic) ---

interface ConfigOption {
  id: string;
  label: string;
  type: 'select' | 'slider' | 'radio' | 'checkbox' | 'dimensions' | 'area';
  options?: { value: string; label: string; image?: string }[]; // For select/radio
  min?: number; // For slider/numeric inputs
  max?: number; // For slider/numeric inputs
  step?: number; // For slider/numeric inputs
  defaultValue?: any;
  unit?: string; // For dimensions/area
  fixedValue?: string | number; // For non-editable display like flooring thickness
}

interface CategoryConfig {
  title: string;
  options: ConfigOption[];
  image?: string; // Main category image for config page
  dataAiHint?: string;
}

const configurations: { [key: string]: CategoryConfig } = {
  garages: {
    title: "Configure Your Garage",
    image: "/images/config/garage-base.jpg",
    dataAiHint: "oak frame garage structure schematic",
    options: [
      { id: 'sizeType', label: 'Size Type', type: 'select', options: [{ value: 'small', label: 'Small (e.g., 5m x 6m)' }, { value: 'medium', label: 'Medium (e.g., 6m x 6m)' }, { value: 'large', label: 'Large (e.g., 6m x 9m)' }], defaultValue: 'medium' },
      { id: 'trussType', label: 'Truss Type', type: 'radio', options: [{ value: 'curved', label: 'Curved', image: '/images/config/truss-curved.jpg' }, { value: 'straight', label: 'Straight', image: '/images/config/truss-straight.jpg' }], defaultValue: 'curved' },
      { id: 'bays', label: 'Number of Bays', type: 'slider', min: 1, max: 4, step: 1, defaultValue: [2] },
      { id: 'catSlide', label: 'Include Cat Slide Roof?', type: 'checkbox', defaultValue: false },
      { id: 'oakType', label: 'Oak Type', type: 'select', options: [{ value: 'reclaimed', label: 'Reclaimed Oak' }, { value: 'kilned', label: 'Kilned Dried Oak' }], defaultValue: 'reclaimed' },
    ]
  },
  gazebos: {
    title: "Configure Your Gazebo",
     image: "/images/config/gazebo-base.jpg",
     dataAiHint: "oak frame gazebo structure diagram",
    options: [
       { id: 'legType', label: 'Leg Type', type: 'select', options: [{ value: 'full', label: 'Full Height Legs' }, { value: 'wall', label: 'Wall Mount (Half Legs)' }], defaultValue: 'full' },
      { id: 'sizeType', label: 'Size Type', type: 'select', options: [{ value: '3x3', label: '3m x 3m' }, { value: '4x3', label: '4m x 3m' }, { value: '4x4', label: '4m x 4m' }], defaultValue: '3x3' },
      { id: 'trussType', label: 'Truss Type', type: 'radio', options: [{ value: 'curved', label: 'Curved', image: '/images/config/truss-curved.jpg' }, { value: 'straight', label: 'Straight', image: '/images/config/truss-straight.jpg' }], defaultValue: 'curved' },
       { id: 'oakType', label: 'Oak Type', type: 'select', options: [{ value: 'reclaimed', label: 'Reclaimed Oak' }, { value: 'kilned', label: 'Kilned Dried Oak' }], defaultValue: 'kilned' },
    ]
  },
   porches: {
    title: "Configure Your Porch",
     image: "/images/config/porch-base.jpg",
     dataAiHint: "oak frame porch structure plan",
    options: [
      { id: 'trussType', label: 'Truss Type', type: 'radio', options: [{ value: 'curved', label: 'Curved', image: '/images/config/truss-curved.jpg' }, { value: 'straight', label: 'Straight', image: '/images/config/truss-straight.jpg' }], defaultValue: 'curved' },
       { id: 'legType', label: 'Leg Type', type: 'select', options: [{ value: 'floor', label: 'Legs to Floor' }, { value: 'wall', label: 'Legs to Wall' }], defaultValue: 'floor' },
      { id: 'sizeType', label: 'Size Type', type: 'select', options: [{ value: 'narrow', label: 'Narrow (e.g., 1.5m Wide)' }, { value: 'standard', label: 'Standard (e.g., 2m Wide)' }, { value: 'wide', label: 'Wide (e.g., 2.5m Wide)' }], defaultValue: 'standard' },
       { id: 'oakType', label: 'Oak Type', type: 'select', options: [{ value: 'reclaimed', label: 'Reclaimed Oak' }, { value: 'kilned', label: 'Kilned Dried Oak' }], defaultValue: 'reclaimed' },
    ]
  },
   'oak-beams': {
      title: "Configure Your Oak Beams",
      image: "/images/config/beams-measure.jpg",
      dataAiHint: "measuring tape oak beam",
      options: [
        { id: 'oakType', label: 'Oak Type', type: 'select', options: [{ value: 'reclaimed', label: 'Reclaimed Oak' }, { value: 'kilned', label: 'Kilned Dried Oak' }, { value: 'green', label: 'Green Oak' }], defaultValue: 'green' },
        { id: 'dimensions', label: 'Dimensions (cm)', type: 'dimensions', unit: 'cm', defaultValue: { length: 200, width: 15, thickness: 15 } },
      ]
   },
    'oak-flooring': {
        title: "Configure Your Oak Flooring",
        image: "/images/config/flooring-measure.jpg",
        dataAiHint: "room measurement floor plan",
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
    case 'garages': basePrice = 8000 + (config.bays?.[0] || 1) * 1500 + (config.oakType === 'reclaimed' ? 500 : 0) + (config.catSlide ? 300 : 0); break;
    case 'gazebos': basePrice = 3000 + (config.sizeType === '4x4' ? 500 : 0) + (config.oakType === 'reclaimed' ? 200 : 0); break;
    case 'porches': basePrice = 2000 + (config.sizeType === 'wide' ? 400 : 0) + (config.legType === 'floor' ? 150 : 0); break;
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
  const category = params.category as string;
  const categoryConfig = configurations[category];

  const [configState, setConfigState] = useState<any>(() => {
    const initialState: any = {};
    categoryConfig?.options.forEach(opt => {
      initialState[opt.id] = opt.defaultValue;
    });
    return initialState;
  });
   const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
   const [previewImage, setPreviewImage] = useState<string | null>(categoryConfig?.image || null);


   const handleConfigChange = (id: string, value: any) => {
     setConfigState((prev: any) => {
        const newState = { ...prev, [id]: value };
        // Update price dynamically
        setCalculatedPrice(calculatePrice(category, newState));

        // Update preview image for radio buttons with images
        if (id === 'trussType') {
            const selectedOption = categoryConfig?.options.find(opt => opt.id === id)?.options?.find(o => o.value === value);
            if(selectedOption?.image) {
                setPreviewImage(selectedOption.image);
            } else {
                 setPreviewImage(categoryConfig?.image || null); // Revert to default if no specific image
            }
        }

        return newState;
     });
   };

    // Calculate initial price on load
   useState(() => {
      setCalculatedPrice(calculatePrice(category, configState));
   });


  if (!categoryConfig) {
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
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">{categoryConfig.title}</CardTitle>
           <Link href={`/products/${category}`} className="text-sm text-primary hover:underline">&larr; Back to {category.replace('-', ' ')}</Link>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Configuration Options */}
           <div className="space-y-6 order-2 md:order-1">
             {categoryConfig.options.map((option) => (
              <div key={option.id}>
                <Label htmlFor={option.id} className="text-base font-medium">{option.label}</Label>
                {option.type === 'select' && (
                  <Select
                    value={configState[option.id]}
                    onValueChange={(value) => handleConfigChange(option.id, value)}
                  >
                    <SelectTrigger id={option.id} className="mt-2">
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
                        className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4"
                     >
                       {option.options?.map((opt) => (
                         <Label key={opt.value} htmlFor={`${option.id}-${opt.value}`} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <RadioGroupItem value={opt.value} id={`${option.id}-${opt.value}`} className="sr-only" />
                             {opt.image && (
                                <div className="relative h-24 w-full mb-2 rounded-md overflow-hidden">
                                <Image src={`https://picsum.photos/seed/${opt.value}-${option.id}/200/150`} alt={opt.label} layout="fill" objectFit="contain" data-ai-hint={`${category} ${opt.label} truss schematic`} />
                                </div>
                            )}
                             <span className="text-sm font-medium">{opt.label}</span>
                         </Label>
                       ))}
                     </RadioGroup>
                 )}
                {option.type === 'slider' && (
                  <div className="mt-2 space-y-2">
                     <Slider
                        id={option.id}
                        min={option.min}
                        max={option.max}
                        step={option.step}
                        value={configState[option.id]}
                        onValueChange={(value) => handleConfigChange(option.id, value)}
                        className="py-2"
                      />
                      <div className="text-right text-sm text-muted-foreground">
                        {configState[option.id]?.[0]} {option.unit || ''}{configState[option.id]?.[0] > 1 ? 's' : ''}
                      </div>
                  </div>
                )}
                {option.type === 'checkbox' && (
                   <div className="flex items-center space-x-2 mt-2">
                     <Checkbox
                        id={option.id}
                        checked={configState[option.id]}
                        onCheckedChange={(checked) => handleConfigChange(option.id, checked)}
                      />
                      <Label htmlFor={option.id} className="font-normal">Yes</Label>
                   </div>
                )}
                 {option.type === 'dimensions' && (
                     <div className="mt-2 grid grid-cols-3 gap-4">
                         <div>
                           <Label htmlFor={`${option.id}-length`}>Length ({option.unit})</Label>
                           <Input id={`${option.id}-length`} type="number" min="1" step="any"
                                  value={configState[option.id]?.length || ''}
                                  onChange={(e) => handleDimensionChange(e.target.value, 'length')}
                                  className="mt-1"/>
                         </div>
                         <div>
                            <Label htmlFor={`${option.id}-width`}>Width ({option.unit})</Label>
                            <Input id={`${option.id}-width`} type="number" min="1" step="any"
                                   value={configState[option.id]?.width || ''}
                                   onChange={(e) => handleDimensionChange(e.target.value, 'width')}
                                   className="mt-1"/>
                         </div>
                          <div>
                            <Label htmlFor={`${option.id}-thickness`}>Thickness ({option.unit})</Label>
                            <Input id={`${option.id}-thickness`} type="number" min="1" step="any"
                                   value={configState[option.id]?.thickness || ''}
                                   onChange={(e) => handleDimensionChange(e.target.value, 'thickness')}
                                   className="mt-1"/>
                         </div>
                     </div>
                 )}
                  {option.type === 'area' && (
                     <div className="mt-2 space-y-4">
                         {option.fixedValue && (
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-muted-foreground">{option.label}:</span>
                                 <span className="font-medium">{option.fixedValue}</span>
                             </div>
                         )}
                         {!option.fixedValue && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                    <div>
                                      <Label htmlFor={`${option.id}-area`}>Area ({option.unit})</Label>
                                      <Input id={`${option.id}-area`} type="number" min="0.1" step="any"
                                             placeholder={`Enter area directly`}
                                             value={configState[option.id]?.area || ''}
                                             onChange={(e) => handleAreaChange(e.target.value, 'area')}
                                             className="mt-1"/>
                                    </div>
                                    <div className="text-center text-sm text-muted-foreground pb-2">OR</div>
                                </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor={`${option.id}-length`}>Length (cm)</Label>
                                      <Input id={`${option.id}-length`} type="number" min="1" step="any"
                                             placeholder="Calculate area"
                                             value={configState[option.id]?.length || ''}
                                             onChange={(e) => handleAreaChange(e.target.value, 'length')}
                                             className="mt-1"/>
                                    </div>
                                    <div>
                                       <Label htmlFor={`${option.id}-width`}>Width (cm)</Label>
                                       <Input id={`${option.id}-width`} type="number" min="1" step="any"
                                              placeholder="Calculate area"
                                              value={configState[option.id]?.width || ''}
                                              onChange={(e) => handleAreaChange(e.target.value, 'width')}
                                              className="mt-1"/>
                                    </div>
                                 </div>
                            </>
                         )}
                     </div>
                 )}
              </div>
            ))}
           </div>

            {/* Preview & Price */}
           <div className="space-y-6 order-1 md:order-2 sticky top-20 self-start">
             <Card className="overflow-hidden">
               <CardContent className="p-0">
                  <div className="relative aspect-video bg-muted">
                     {previewImage ? (
                         <Image
                            src={`https://picsum.photos/seed/${category}-${JSON.stringify(configState).length}/600/400`} // Use key to force reload on change
                            key={previewImage + JSON.stringify(configState)} // Force re-render/fetch if image source changes based on config
                            alt={`${categoryConfig.title} Preview`}
                            layout="fill"
                            objectFit="contain"
                            className="p-4"
                             data-ai-hint={categoryConfig.dataAiHint || category}
                         />
                     ) : (
                         <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">Configuration Preview</p>
                         </div>
                     )}
                  </div>
               </CardContent>
             </Card>
             <Separator />
             <div className="text-right space-y-2">
                <p className="text-sm text-muted-foreground">Estimated Price (excl. VAT & Delivery)</p>
                <p className="text-3xl font-bold">
                   {calculatedPrice !== null ? `£${calculatedPrice.toFixed(2)}` : 'Calculating...'}
                </p>
             </div>
              <Button size="lg" className="w-full" onClick={handleAddToBasket} disabled={calculatedPrice === null || calculatedPrice <= 0}>
                  Add to Basket <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
