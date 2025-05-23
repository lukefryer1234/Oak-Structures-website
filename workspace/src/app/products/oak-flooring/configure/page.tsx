
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { ArrowRight, PlusCircle, Trash2, ShoppingCart } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import type { CategoryConfig, SelectConfigOption, AreaConfigOption, FlooringArea } from '@/types/configurator';

// --- Config State Interface ---
interface OakFlooringConfigState {
  oakType: 'reclaimed' | 'kilned';
  area: FlooringArea;
}

// --- Config Data ---
const oakFlooringConfig: CategoryConfig = {
  title: "Configure Your Oak Flooring",
  options: [
    { id: 'oakType', label: 'Oak Type', type: 'select', options: [{ value: 'reclaimed', label: 'Reclaimed Oak' }, { value: 'kilned', label: 'Kilned Dried Oak' }], defaultValue: 'kilned' } as SelectConfigOption<'oakType', OakFlooringConfigState>,
    { id: 'area', label: 'Area Required', type: 'area', unit: 'm²', defaultValue: { area: 10, length: '', width: '' } } as AreaConfigOption<'area', OakFlooringConfigState>,
  ]
};

// --- Unit Prices (Fetch from admin settings in real app) ---
const unitPrices = {
  reclaimed: 90, // price per m²
  kilned: 75,    // price per m²
};

// --- Helper Functions ---
const parseNonNegativeFloat = (value: string | number | undefined): number => {
  if (value === undefined || value === null) return 0;
  const num = parseFloat(String(value));
  return isNaN(num) || num < 0 ? 0 : num;
};

const calculateAreaAndPrice = (config: OakFlooringConfigState): { area: number; price: number } => {
  const areaData = config.area || { area: 0, length: '', width: '' };
  let areaM2 = parseNonNegativeFloat(areaData.area);

  if (areaM2 <= 0) { // If direct area is not valid or not provided, try calculating from L/W
    const lengthCm = parseNonNegativeFloat(areaData.length);
    const widthCm = parseNonNegativeFloat(areaData.width);
    if (lengthCm > 0 && widthCm > 0) {
      areaM2 = (lengthCm / 100) * (widthCm / 100); // Convert cm to m for area calculation
    }
  }

  const selectedOakType = config.oakType || 'kilned'; // Default to 'kilned' if undefined
  const floorUnitPrice = unitPrices[selectedOakType as keyof typeof unitPrices] || unitPrices.kilned;
  const price = areaM2 * floorUnitPrice;
  return { area: Math.max(0, areaM2), price: Math.max(0, price) };
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);
};

interface FlooringListItem {
  id: string;
  oakType: 'reclaimed' | 'kilned';
  area: number;
  description: string;
  price: number;
}

interface BasketItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  href: string;
  category: string;
}

export default function ConfigureOakFlooringPage() {
  const category = 'oak-flooring';
  const router = useRouter();
  const { toast } = useToast();

  const [configState, setConfigState] = useState<OakFlooringConfigState>(() => {
    const oakTypeOption = oakFlooringConfig.options.find(opt => opt.id === 'oakType') as SelectConfigOption<'oakType', OakFlooringConfigState> | undefined;
    const areaOption = oakFlooringConfig.options.find(opt => opt.id === 'area') as AreaConfigOption<'area', OakFlooringConfigState> | undefined;

    return {
      oakType: oakTypeOption?.defaultValue || 'kilned',
      area: areaOption?.defaultValue || { area: 10, length: '', width: '' },
    };
  });

  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [cuttingList, setCuttingList] = useState<FlooringListItem[]>([]);

  useEffect(() => {
    const { price } = calculateAreaAndPrice(configState);
    setCalculatedPrice(price);
  }, [configState]);

  const handleOakTypeChange = (value: 'reclaimed' | 'kilned') => {
    setConfigState(prev => ({ ...prev, oakType: value }));
  };

  const handleAreaChange = (value: string, type: 'area' | 'length' | 'width') => {
    setConfigState(prev => {
      const currentArea = prev.area || { area: '', length: '', width: '' };
      const newAreaState: FlooringArea = { ...currentArea, [type]: value };

      if (type === 'length' || type === 'width') {
        newAreaState.area = ''; // Clear direct area if L/W change
      } else if (type === 'area') {
        newAreaState.length = ''; // Clear L/W if direct area changes
        newAreaState.width = '';
      }
      return { ...prev, area: newAreaState };
    });
  };

  const validateCurrentFlooring = (): { isValid: boolean; flooring?: Omit<FlooringListItem, 'id'>, basketItem?: Omit<BasketItem, 'id' | 'quantity' | 'href'> } => {
    const { area, price } = calculateAreaAndPrice(configState);

    if (area <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Area",
        description: "Please enter a valid area (either directly or via length and width).",
      });
      return { isValid: false };
    }
    if (!configState.oakType) {
      toast({
        variant: "destructive",
        title: "Missing Oak Type",
        description: "Please select an oak type.",
      });
      return { isValid: false };
    }
    if (price <= 0) {
      toast({
        variant: "destructive",
        title: "Calculation Error",
        description: "Cannot add item with zero or negative price. Check area.",
      });
      return { isValid: false };
    }

    const description = `${configState.oakType.charAt(0).toUpperCase() + configState.oakType.slice(1)} Oak Flooring: ${area.toFixed(2)}m²`;
    const productName = `Oak Flooring (${configState.oakType.charAt(0).toUpperCase() + configState.oakType.slice(1)})`;

    return {
      isValid: true,
      flooring: {
        oakType: configState.oakType,
        area,
        description,
        price,
      },
      basketItem: {
        name: productName,
        description,
        price,
        category,
      }
    };
  };

  const handleAddToCuttingList = () => {
    const { isValid, flooring } = validateCurrentFlooring();
    if (!isValid || !flooring) return;

    const newItem: FlooringListItem = {
      id: `floor-${Date.now()}`,
      ...flooring,
    };
    setCuttingList(prev => [...prev, newItem]);
    toast({ title: "Flooring Added to List", description: newItem.description });
  };

  const handleAddToBasket = () => {
    const { isValid, basketItem } = validateCurrentFlooring();
    if (!isValid || !basketItem) return;

    const newBasketItem: BasketItem = {
      id: `floor-${Date.now()}`,
      ...basketItem,
      quantity: 1,
      href: `/products/${category}/configure`,
    };
    console.log("Adding single flooring item to basket (placeholder):", newBasketItem);
    toast({
      title: "Flooring Added to Basket",
      description: newBasketItem.description,
      action: (
        <Button variant="outline" size="sm" asChild>
          <a href="/basket">View Basket</a>
        </Button>
      ),
    });
  };

  const handleRemoveFromList = (id: string) => {
    setCuttingList(prev => prev.filter(item => item.id !== id));
    toast({ title: "Flooring Removed", description: "Item removed from the cutting list." });
  };

  const cuttingListTotal = cuttingList.reduce((sum, item) => sum + item.price, 0);

  const handleProceedToCheckout = () => {
    if (cuttingList.length === 0) {
      toast({ variant: "destructive", title: "Empty List", description: "Please add at least one flooring area to the cutting list." });
      return;
    }
    console.log("Adding cutting list to basket (placeholder):", cuttingList);
    toast({ title: "Cutting List Added to Basket", description: `Added ${cuttingList.length} flooring area(s) to your basket.` });
    setCuttingList([]);
    router.push('/basket');
  };

  const currentOakTypeOption = oakFlooringConfig.options.find(opt => opt.id === 'oakType') as SelectConfigOption<'oakType', OakFlooringConfigState>;
  const currentAreaOption = oakFlooringConfig.options.find(opt => opt.id === 'area') as AreaConfigOption<'area', OakFlooringConfigState>;

  return (
    <div>
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{oakFlooringConfig.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-8">
            <div className="space-y-6">
              {/* Oak Type Select */}
              <div className="text-center">
                <Label htmlFor={currentOakTypeOption.id} className="text-base font-medium block mb-2">{currentOakTypeOption.label}</Label>
                <Select
                  value={configState.oakType}
                  onValueChange={handleOakTypeChange}
                >
                  <SelectTrigger id={currentOakTypeOption.id} className="mt-2 bg-background/70 max-w-sm mx-auto justify-center">
                    <SelectValue placeholder={`Select ${currentOakTypeOption.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {currentOakTypeOption.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="justify-center">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Area Input */}
              <div className="text-center">
                <Label htmlFor={currentAreaOption.id} className="text-base font-medium block mb-2">{currentAreaOption.label}</Label>
                <div className="mt-2 space-y-4 max-w-md mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div className="text-center">
                      <Label htmlFor={`${currentAreaOption.id}-area`}>Area ({currentAreaOption.unit})</Label>
                      <Input id={`${currentAreaOption.id}-area`} type="number" min="0.1" step="any"
                        placeholder={`Enter area directly`}
                        value={String(configState.area.area)}
                        onChange={(e) => handleAreaChange(e.target.value, 'area')}
                        className="mt-1 bg-background/70 text-center" />
                    </div>
                    <div className="text-center text-sm text-muted-foreground pb-2">OR</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-center">
                      <Label htmlFor={`${currentAreaOption.id}-length`}>Length (cm)</Label>
                      <Input id={`${currentAreaOption.id}-length`} type="number" min="1" step="any"
                        placeholder="Calculate area"
                        value={String(configState.area.length)}
                        onChange={(e) => handleAreaChange(e.target.value, 'length')}
                        className="mt-1 bg-background/70 text-center" />
                    </div>
                    <div className="text-center">
                      <Label htmlFor={`${currentAreaOption.id}-width`}>Width (cm)</Label>
                      <Input id={`${currentAreaOption.id}-width`} type="number" min="1" step="any"
                        placeholder="Calculate area"
                        value={String(configState.area.width)}
                        onChange={(e) => handleAreaChange(e.target.value, 'width')}
                        className="mt-1 bg-background/70 text-center" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 border-t border-border/50 pt-6 mt-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Estimated Price for this Area (excl. VAT & Delivery)</p>
                <p className="text-3xl font-bold">
                  {calculatedPrice !== null ? formatPrice(calculatedPrice) : 'Calculating...'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button size="lg" className="w-full sm:w-auto" onClick={handleAddToCuttingList} disabled={calculatedPrice <= 0}>
                  <PlusCircle className="mr-2 h-5 w-5" /> Add to Cutting List
                </Button>
                <Button size="lg" variant="secondary" className="w-full sm:w-auto" onClick={handleAddToBasket} disabled={calculatedPrice <= 0}>
                  <ShoppingCart className="mr-2 h-5 w-5" /> Add Direct to Basket
                </Button>
              </div>
            </div>

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
