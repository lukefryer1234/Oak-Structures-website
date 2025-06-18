"use client"; // Needed for form/state

// Add dynamic export configuration to prevent static generation
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { notFound, useRouter } from 'next/navigation';
import { ArrowRight, PlusCircle, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { useFirestoreDocument } from '@/hooks/firebase/useFirestoreDocument';
import { productService, type ConfigState, type BasketItem as ProductServiceBasketItem } from '@/services/domain/product-service';
import { useAuth } from '@/context/auth-context';

// --- Interfaces ---

interface ConfigOption {
  id: string;
  label: string;
  type: 'select' | 'area';
  options?: { value: string; label: string; }[];
  defaultValue?: any;
  unit?: string;
}

interface CategoryConfig {
  title: string;
  options: ConfigOption[];
}

interface FlooringListItem {
    id: string;
    oakType: string;
    area: number;
    description: string;
    price: number;
}

// --- Fallback Configuration and Pricing ---
const fallbackOakFlooringConfig: CategoryConfig = {
        title: "Configure Your Oak Flooring (Using Fallback Data)",
        options: [
         { id: 'oakType', label: 'Oak Type', type: 'select', options: [{ value: 'reclaimed', label: 'Reclaimed Oak' }, { value: 'kilned', label: 'Kilned Dried Oak' }], defaultValue: 'kilned' },
         { id: 'area', label: 'Area Required', type: 'area', unit: 'm²', defaultValue: { area: 10, length: '', width: '' } },
        ]
    };

// --- Unit Prices (Fetch from admin settings in real app) ---
const unitPrices = {
    reclaimed: 90,
    kilned: 75,
};


const fallbackCalculateAreaAndPrice = (config: ConfigState): { area: number; price: number } => {
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

  const floorUnitPrice = config.oakType === 'reclaimed' ? unitPrices.reclaimed : unitPrices.kilned;
  const price = areaM2 * floorUnitPrice;
  return { area: Math.max(0, areaM2), price: Math.max(0, price) };
};

// Helper function to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);
}

// --- Component ---

export default function ConfigureOakFlooringPage() {
  const category = 'oak-flooring';
  const router = useRouter(); // Initialize router
  const { toast } = useToast();
  const { user } = useAuth();
  const [pageUiState, setPageUiState] = useState<{ usingFallback: boolean; error: string | null; isAddingToBasket: boolean; isProcessingList: boolean; }>({
    usingFallback: false,
    error: null,
    isAddingToBasket: false,
    isProcessingList: false,
  });
  const { data: firestoreData, isLoading: isLoadingConfig, error: firestoreError } = useFirestoreDocument<CategoryConfig>('product_configurators/oak-flooring');
  const [activeConfig, setActiveConfig] = useState<CategoryConfig | null>(null);
  const [configState, setConfigState] = useState<ConfigState>({});
  // State for the current calculated price
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  // State for the cutting list
  const [cuttingList, setCuttingList] = useState<FlooringListItem[]>([]);

  useEffect(() => {
    if (!isLoadingConfig) {
      if (firestoreError || !firestoreData) {
        console.warn("Firestore config error or no data, using fallback for oak flooring.", firestoreError);
        setActiveConfig(fallbackOakFlooringConfig);
        setPageUiState(prev => ({ ...prev, usingFallback: true, error: firestoreError ? "Failed to load custom configuration, using default options." : null }));
      } else {
        setActiveConfig(firestoreData);
        setPageUiState(prev => ({ ...prev, usingFallback: false, error: null }));
      }
    }
  }, [firestoreData, isLoadingConfig, firestoreError]);

  useEffect(() => {
    if (activeConfig) {
      const initialState: ConfigState = {};
      activeConfig.options.forEach(opt => {
        initialState[opt.id] = opt.defaultValue;
      });
      setConfigState(initialState);
    }
  }, [activeConfig]);

  useEffect(() => {
    if (activeConfig && Object.keys(configState).length > 0 && configState.area) { // Ensure area exists in configState
      let price = 0;
      let area = 0;
      if (pageUiState.usingFallback) {
        const result = fallbackCalculateAreaAndPrice(configState);
        price = result.price;
        area = result.area; // Though area is part of configState, this confirms calculation source
      } else {
        // For service, we pass the full config. The service should handle area calculation internally if needed.
        productService.calculateProductPrice('oak-flooring-configurable', configState)
          .then(servicePrice => setCalculatedPrice(servicePrice))
          .catch(err => {
            console.error("Error calculating price with service:", err);
            setPageUiState(prev => ({ ...prev, error: "Error calculating price. Using fallback."}));
            const fallbackResult = fallbackCalculateAreaAndPrice(configState);
            setCalculatedPrice(fallbackResult.price);
          });
        return; // Async path, return early
      }
      setCalculatedPrice(price);
    }
  }, [configState, activeConfig, category, pageUiState.usingFallback]);

   // Handle changes in configuration options (select)
   const handleConfigChange = (id: string, value: any) => {
     setConfigState((prev: any) => ({ ...prev, [id]: value }));
   };

   // Handle changes in area inputs
   const handleAreaChange = (value: string, type: 'area' | 'length' | 'width') => {
     setConfigState((prev: any) => {
        const currentArea = prev.area || {};
        const newAreaState = { ...currentArea, [type]: value };

         // If length/width changed, clear direct area input
         if (type === 'length' || type === 'width') {
            newAreaState.area = '';
         }
         // If direct area changed, clear length/width
         if(type === 'area') {
             newAreaState.length = '';
             newAreaState.width = '';
         }

        return { ...prev, area: newAreaState };
     });
   }

   const validateCurrentFlooring = (): { isValid: boolean; flooring?: Omit<FlooringListItem, 'id'>, basketItemData?: Omit<ProductServiceBasketItem, 'id' | 'addedAt' | 'quantity'> } => {
       if (!activeConfig || Object.keys(configState).length === 0) {
           toast({ title: "Configuration Error", description: "Configuration not loaded.", variant: "destructive" });
           return { isValid: false };
       }
       const { area, price } = pageUiState.usingFallback
           ? fallbackCalculateAreaAndPrice(configState)
           : { area: parseFloat(configState.area?.area || (configState.area?.length && configState.area?.width ? (parseFloat(configState.area.length)/100 * parseFloat(configState.area.width)/100) : 0)), price: calculatedPrice || 0 };

       if (area <= 0) {
           toast({ variant: "destructive", title: "Invalid Area", description: "Please enter a valid area." });
           return { isValid: false };
       }
       if (!configState.oakType) {
           toast({ variant: "destructive", title: "Missing Oak Type", description: "Please select an oak type." });
           return { isValid: false };
       }
       if (price <= 0) { // calculatedPrice might be null initially
           toast({ variant: "destructive", title: "Calculation Error", description: "Price is zero or invalid. Check area." });
           return { isValid: false };
       }

       const description = `${configState.oakType.charAt(0).toUpperCase() + configState.oakType.slice(1)} Oak Flooring: ${area.toFixed(2)}m²`;
       const productName = activeConfig.title.includes("Fallback") ? fallbackOakFlooringConfig.title : activeConfig.title; // Use correct title

       return {
           isValid: true,
           flooring: { oakType: configState.oakType, area, description, price },
           basketItemData: {
               productId: `${category}-${JSON.stringify(configState)}`,
               productName,
               configuration: configState,
               price,
               // quantity will be set by caller
               // imageUrl can be set here if available from activeConfig.image
           }
       };
   };

   // Handle adding the current configuration to the cutting list
   const handleAddToCuttingList = () => {
      const { isValid, flooring } = validateCurrentFlooring();
      if (!isValid || !flooring) return;

      const newItem: FlooringListItem = {
          id: `floor-${Date.now()}`, // Simple unique ID
          ...flooring,
      };

      setCuttingList(prev => [...prev, newItem]);

      toast({
          title: "Flooring Added to List",
          description: newItem.description,
      });
   };

    const handleAddToBasket = async () => {
        if (!user) {
            toast({ title: "Login Required", description: "Please login to add items.", variant: "destructive" });
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        const { isValid, basketItemData } = validateCurrentFlooring();
        if (!isValid || !basketItemData) return;

        setPageUiState(prev => ({ ...prev, isAddingToBasket: true }));
        try {
            const description = await productService.generateConfigurationDescription(basketItemData.productName, basketItemData.configuration);
            const finalItemData = { ...basketItemData, description, quantity: 1 }; // Assuming quantity 1 for direct add

            await productService.addToBasket(user.uid, finalItemData as Omit<ProductServiceBasketItem, 'id' | 'addedAt'>);
            toast({ title: "Added to Basket", description, action: <Button variant="outline" size="sm" asChild><a href="/basket">View Basket</a></Button> });
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Could not add to basket.", variant: "destructive" });
        } finally {
            setPageUiState(prev => ({ ...prev, isAddingToBasket: false }));
        }
    };

    const handleProceedToCheckout = async () => {
        if (!user) {
            toast({ title: "Login Required", description: "Please login to proceed.", variant: "destructive" });
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        if (cuttingList.length === 0) {
            toast({ variant: "destructive", title: "Empty List", description: "Please add items to the cutting list." });
            return;
        }
        setPageUiState(prev => ({ ...prev, isProcessingList: true }));
        try {
            for (const item of cuttingList) {
                const itemDescription = await productService.generateConfigurationDescription(item.oakType + " Oak Flooring", { area: item.area, oakType: item.oakType });
                const basketItemData: Omit<ProductServiceBasketItem, 'id' | 'addedAt'> = {
                    productId: `${category}-area-${item.id}`,
                    productName: `${item.oakType.charAt(0).toUpperCase() + item.oakType.slice(1)} Oak Flooring`,
                    configuration: { area: item.area, oakType: item.oakType }, // Simple config for this item
                    price: item.price,
                    quantity: 1, // Each list item is one "unit" of specified area
                };
                await productService.addToBasket(user.uid, basketItemData);
            }
            toast({ title: "Cutting List Added", description: `Added ${cuttingList.length} flooring area(s) to basket.` });
            setCuttingList([]);
            router.push('/basket');
        } catch (error: any) {
            toast({ title: "Error Processing List", description: error.message || "Could not add all items.", variant: "destructive" });
        } finally {
            setPageUiState(prev => ({ ...prev, isProcessingList: false }));
        }
    };

  if (isLoadingConfig && !activeConfig) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Configuration...</p>
      </div>
    );
  }

  if (!activeConfig) {
     return (
        <div className="container mx-auto px-4 py-12 text-center text-red-500">
           <p>Critical error: Configuration could not be determined. Please contact support.</p>
        </div>
     );
  }

  return (
    <div>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">{activeConfig.title}</CardTitle>
              {pageUiState.usingFallback && (<p className="text-sm text-orange-500">(Default options shown due to a problem loading custom settings)</p>)}
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-8">
               {pageUiState.error && !pageUiState.usingFallback && (<div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md text-center">{pageUiState.error}</div>)}
               {/* --- Configuration Section --- */}
               <div className="space-y-6">
                 {activeConfig.options.map((option) => (
                   // Only render options that are not the removed 'thickness'
                   option.id !== 'thickness' && (
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
                         {option.type === 'area' && ( // No fixedValue check needed now
                             <div className="mt-2 space-y-4 max-w-md mx-auto">
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
                             </div>
                         )}
                      </div>
                    )
                 ))}
                  {/* Price & Add Buttons */}
                  <div className="space-y-6 border-t border-border/50 pt-6 mt-4">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Estimated Price for this Area (excl. VAT & Delivery)</p>
                        <p className="text-3xl font-bold">
                           {calculatedPrice !== null ? formatPrice(calculatedPrice) : 'Calculating...'}
                        </p>
                    </div>
                     {/* Buttons container */}
                     <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Button size="lg" className="w-full sm:w-auto" onClick={handleAddToCuttingList} disabled={calculatedPrice <= 0 || pageUiState.isAddingToBasket || pageUiState.isProcessingList}>
                            <PlusCircle className="mr-2 h-5 w-5" /> Add to Cutting List
                        </Button>
                         <Button size="lg" variant="secondary" className="w-full sm:w-auto" onClick={handleAddToBasket} disabled={calculatedPrice <= 0 || pageUiState.isAddingToBasket || pageUiState.isProcessingList}>
                             {pageUiState.isAddingToBasket ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : <><ShoppingCart className="mr-2 h-5 w-5" /> Add Direct to Basket</>}
                         </Button>
                    </div>
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
                         <Button size="lg" className="ml-auto block" onClick={handleProceedToCheckout} disabled={pageUiState.isProcessingList || pageUiState.isAddingToBasket}>
                            {pageUiState.isProcessingList ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : <>Add List to Basket & Proceed <ArrowRight className="ml-2 h-5 w-5" /></>}
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
