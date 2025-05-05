
"use client"; // Needed for form/state

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { notFound, useRouter } from 'next/navigation'; // Added useRouter
import { ArrowRight, PlusCircle, Trash2 } from 'lucide-react'; // Added icons
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Import Table components
import { Separator } from '@/components/ui/separator'; // Import Separator
import { useToast } from "@/hooks/use-toast"; // Import toast

// --- Interfaces ---

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

interface BeamListItem {
    id: string; // Unique ID for the list item
    oakType: string;
    dimensions: { length: number; width: number; thickness: number };
    volume: number;
    description: string;
    price: number;
}


// --- Config Data ---

const oakBeamsConfig: CategoryConfig = {
      title: "Configure Your Oak Beams",
      options: [
        { id: 'oakType', label: 'Oak Type', type: 'select', options: [{ value: 'reclaimed', label: 'Reclaimed Oak' }, { value: 'kilned', label: 'Kilned Dried Oak' }, { value: 'green', label: 'Green Oak' }], defaultValue: 'green' },
        { id: 'dimensions', label: 'Dimensions (cm)', type: 'dimensions', unit: 'cm', defaultValue: { length: 200, width: 15, thickness: 15 } },
      ]
};

// --- Unit Prices (Fetch from admin settings in real app) ---
const unitPrices = {
    reclaimed: 1200,
    kilned: 1000,
    green: 800,
};


// --- Helper Functions ---

const calculateVolumeAndPrice = (config: any): { volume: number; price: number } => {
  const dims = config.dimensions || { length: 0, width: 0, thickness: 0 };
  const lengthM = parseFloat(dims.length) / 100 || 0;
  const widthM = parseFloat(dims.width) / 100 || 0;
  const thicknessM = parseFloat(dims.thickness) / 100 || 0;
  const volumeM3 = lengthM * widthM * thicknessM;

  let unitPrice = unitPrices.green; // Default to Green Oak
  if (config.oakType === 'reclaimed') {
    unitPrice = unitPrices.reclaimed;
  } else if (config.oakType === 'kilned') {
    unitPrice = unitPrices.kilned;
  }

  const price = volumeM3 * unitPrice;
  return { volume: volumeM3, price: Math.max(0, price) };
};

// Helper function to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);
}

// Helper to format dimension values
const parseDimension = (value: any): number => {
    const num = parseFloat(value);
    return isNaN(num) || num <= 0 ? 0 : num;
}

// --- Component ---

export default function ConfigureOakBeamsPage() {
  const category = 'oak-beams';
  const categoryConfig = oakBeamsConfig;
  const router = useRouter(); // Initialize router
  const { toast } = useToast();

  // State for the current configuration input
  const [configState, setConfigState] = useState<any>(() => {
    const initialState: any = {};
    categoryConfig.options.forEach(opt => {
      initialState[opt.id] = opt.defaultValue;
    });
    return initialState;
  });

  // State for the current calculated price
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  // State for the cutting list
  const [cuttingList, setCuttingList] = useState<BeamListItem[]>([]);

  // Effect to calculate initial price and recalculate on config change
  useEffect(() => {
     const { price } = calculateVolumeAndPrice(configState);
     setCalculatedPrice(price);
  }, [configState]);

  // Handle changes in configuration options (select)
  const handleConfigChange = (id: string, value: any) => {
     setConfigState((prev: any) => ({ ...prev, [id]: value }));
  };

  // Handle changes in dimension inputs
  const handleDimensionChange = (value: string, type: 'length' | 'width' | 'thickness') => {
     setConfigState((prev: any) => {
        const currentDims = prev.dimensions || {};
        const newDims = { ...currentDims, [type]: value };
        return { ...prev, dimensions: newDims };
     });
  }

  // Handle adding the current configuration to the cutting list
  const handleAddToCuttingList = () => {
      const dims = {
          length: parseDimension(configState.dimensions?.length),
          width: parseDimension(configState.dimensions?.width),
          thickness: parseDimension(configState.dimensions?.thickness),
      };

      // Validation
      if (dims.length <= 0 || dims.width <= 0 || dims.thickness <= 0) {
            toast({
                variant: "destructive",
                title: "Invalid Dimensions",
                description: "Please enter valid positive numbers for length, width, and thickness.",
            });
            return;
      }
       if (!configState.oakType) {
            toast({
                 variant: "destructive",
                 title: "Missing Oak Type",
                 description: "Please select an oak type.",
            });
            return;
       }


      const { volume, price } = calculateVolumeAndPrice(configState);

      if (price <= 0) {
           toast({
                variant: "destructive",
                title: "Calculation Error",
                description: "Cannot add item with zero price. Check dimensions.",
           });
           return;
      }


      const newItem: BeamListItem = {
          id: `beam-${Date.now()}`, // Simple unique ID
          oakType: configState.oakType,
          dimensions: dims, // Store parsed dimensions
          volume: volume,
          description: `${configState.oakType.charAt(0).toUpperCase() + configState.oakType.slice(1)} Oak Beam: ${dims.length}cm L x ${dims.width}cm W x ${dims.thickness}cm T`,
          price: price,
      };

      setCuttingList(prev => [...prev, newItem]);

      toast({
          title: "Beam Added",
          description: newItem.description,
      });

      // Optional: Reset form fields after adding
      // setConfigState(initialState); // Need to define initialState based on defaults
  };

  // Handle removing an item from the cutting list
   const handleRemoveFromList = (id: string) => {
        setCuttingList(prev => prev.filter(item => item.id !== id));
        toast({
            title: "Beam Removed",
            description: "Item removed from the cutting list.",
        });
   }

   // Calculate total price of the cutting list
   const cuttingListTotal = cuttingList.reduce((sum, item) => sum + item.price, 0);

   // Handle proceeding to checkout (placeholder)
    const handleProceedToCheckout = () => {
        if (cuttingList.length === 0) {
            toast({
                variant: "destructive",
                title: "Empty List",
                description: "Please add at least one beam to the cutting list.",
            });
            return;
        }
        // TODO: Implement logic to add all items in cuttingList to the main shopping basket
        console.log("Proceeding to checkout with:", cuttingList);
        alert(`Proceeding to checkout with ${cuttingList.length} beam(s). (Placeholder - check console)`);
        // router.push('/basket'); // Navigate to basket after adding items
    };

  return (
    <div>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">{categoryConfig.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-8">
               {/* --- Configuration Section --- */}
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

                 {/* Price & Add Button */}
                  <div className="space-y-6 border-t border-border/50 pt-6 mt-4">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Estimated Price for this Beam (excl. VAT & Delivery)</p>
                        <p className="text-3xl font-bold">
                           {calculatedPrice !== null ? formatPrice(calculatedPrice) : 'Calculating...'}
                        </p>
                    </div>
                    <Button size="lg" className="w-full max-w-xs mx-auto block" onClick={handleAddToCuttingList} disabled={calculatedPrice <= 0}>
                        <PlusCircle className="mr-2 h-5 w-5" /> Add to Cutting List
                    </Button>
                </div>
               </div>

               {/* --- Cutting List Section --- */}
               {cuttingList.length > 0 && (
                  <div className="space-y-6 border-t border-border/50 pt-6 mt-8">
                    <h3 className="text-xl font-semibold text-center">Cutting List</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right w-[50px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cuttingList.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right font-medium">{formatPrice(item.price)}</TableCell>
                                    <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemoveFromList(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Remove</span>
                                    </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <Separator className="my-4 border-border/50" />
                     <div className="text-right space-y-2">
                        <p className="text-lg font-semibold">Cutting List Total: {formatPrice(cuttingListTotal)}</p>
                        <p className="text-xs text-muted-foreground">(Excl. VAT & Delivery)</p>
                         <Button size="lg" className="ml-auto block" onClick={handleProceedToCheckout}>
                            Add List to Basket & Proceed <ArrowRight className="ml-2 h-5 w-5" />
                         </Button>
                    </div>
                  </div>
               )}

            </CardContent>
          </Card>
        </div>
    </div>
  );
}

