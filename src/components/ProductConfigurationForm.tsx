"use client";

import type { Product, SelectedConfiguration, ProductOption } from "@/types";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingCart, Eye, ArrowLeft, Plus, ArrowRight, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ProductConfigurationFormProps {
  product: Product;
}

const CM_TO_INCH = 2.54;

const formatToFeetAndInches = (cm: number): string => {
  if (typeof cm !== 'number' || isNaN(cm)) return "N/A";
  const totalInches = cm / CM_TO_INCH;
  const feet = Math.floor(totalInches / 12);
  const inches = parseFloat((totalInches % 12).toFixed(2));
  return `${feet} ft ${inches} in`;
};

// Helper function to render a single option
const renderOption = (
  option: ProductOption,
  currentValue: string | number | boolean | undefined,
  handleOptionChange: (optionId: string, newValue: string | number | boolean, unit?: 'cm' | 'inches') => void,
  product: Product,
  isSpecialLayout: boolean,
  unitSystem: 'cm' | 'inches' = 'cm'
) => {
  const controlContainerClasses = isSpecialLayout ? "mx-auto max-w-xs" : "";
  const inputClasses = isSpecialLayout ? "bg-background/70" : "bg-input/50";

  let optionDisplayName = option.name.replace(/\s*\(cm\)\s*$/, ''); 
  let displayValue = currentValue;
  let unitLabel = unitSystem === 'inches' ? 'in' : 'cm'; // Use 'in' for inches

  if (product.id === 'oak-beams' && (option.id === 'lengthCm' || option.id === 'widthCm' || option.id === 'thicknessCm')) {
    if (unitSystem === 'inches' && typeof currentValue === 'number') {
      displayValue = parseFloat((currentValue / CM_TO_INCH).toFixed(2));
    }
  }

  const labelSizeClass = isSpecialLayout ? "text-lg" : "text-md";
  const radioLabelSizeClass = isSpecialLayout ? "text-base" : "text-sm";
  const sliderValueSizeClass = isSpecialLayout ? "text-base" : "text-sm";
  const checkboxLabelSizeClass = isSpecialLayout ? "text-base" : "text-sm";

  return (
    <div key={option.id} className={cn(isSpecialLayout ? "text-center mb-3" : "mb-3")}>
      <Label htmlFor={option.id} className={cn(`font-semibold text-foreground block mb-1 ${labelSizeClass}`, isSpecialLayout ? "" : "text-left")}>
        {optionDisplayName}
      </Label>
      {option.description && <p className={cn("text-sm text-muted-foreground -mt-1 mb-2", isSpecialLayout ? "" : "text-left")}>{option.description}</p>}

      {option.type === 'select' && option.values && (
        <div className={controlContainerClasses}>
          <Select
            value={currentValue as string}
            onValueChange={(value) => handleOptionChange(option.id, value)}
          >
            <SelectTrigger id={option.id} className={cn("w-full", inputClasses, isSpecialLayout ? "text-center" : "")}>
              <SelectValue placeholder={`Select ${option.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {option.values.map(val => (
                <SelectItem key={val.value} value={val.value}>
                  {val.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {option.type === 'radio' && option.values && (
        <RadioGroup
          value={currentValue as string}
          onValueChange={(value) => handleOptionChange(option.id, value)}
          className={cn("flex flex-wrap gap-4 pt-1", isSpecialLayout ? "justify-center" : "")}
        >
          {option.values.map(val => (
            <Label
              key={val.value}
              htmlFor={`${option.id}-${val.value}`}
              className={cn(
                `relative flex flex-col items-center justify-end border-2 rounded-lg hover:border-primary/70 cursor-pointer transition-all overflow-hidden`, 
                isSpecialLayout ? "w-32 h-32" : "w-24 h-24", 
                currentValue === val.value ? 'border-primary ring-2 ring-primary/50' : 'border-border'
              )}
            >
              <RadioGroupItem value={val.value} id={`${option.id}-${val.value}`} className="sr-only" />
              {val.imageUrl && (
                <Image
                  src={val.imageUrl}
                  alt={val.label}
                  layout="fill" 
                  objectFit="cover" 
                  className="absolute inset-0" 
                />
              )}
              <span className={cn(
                `relative z-10 w-full p-1 text-center text-white bg-black bg-opacity-50 ${radioLabelSizeClass}`, 
                isSpecialLayout ? "text-sm" : "text-xs" 
              )}>{val.label}</span>
            </Label>
          ))}
        </RadioGroup>
      )}

      {option.type === 'slider' && ( 
        <div className={cn("space-y-2 pt-1", controlContainerClasses)}>
          <Slider
            id={option.id}
            min={option.min}
            max={option.max}
            step={option.step}
            value={[currentValue as number]}
            onValueChange={(newVal) => handleOptionChange(option.id, newVal[0])}
            className="w-full"
          />
          <div className={cn(`text-muted-foreground ${sliderValueSizeClass}`, isSpecialLayout ? "text-center" : "text-left")}>
            {currentValue as number} {option.unit || ''} 
          </div>
        </div>
      )}

      {option.type === 'number_input' && (
         <div className={controlContainerClasses}>
            <Input
                id={option.id}
                type="number"
                value={displayValue as number} 
                onChange={(e) => {
                    let numericValue = parseFloat(e.target.value) || 0;
                    handleOptionChange(option.id, numericValue, unitSystem); 
                }}
                min={product.id === 'oak-beams' && unitSystem === 'inches' && typeof option.min === 'number' ? parseFloat((option.min / CM_TO_INCH).toFixed(2)) : option.min || 0}
                max={product.id === 'oak-beams' && unitSystem === 'inches' && typeof option.max === 'number' ? parseFloat((option.max / CM_TO_INCH).toFixed(2)) : option.max || undefined}
                step={product.id === 'oak-beams' && unitSystem === 'inches' ? 0.125 : option.step || 1} 
                className={cn("w-full", inputClasses, isSpecialLayout ? "text-center" : "")}
            />
            {product.id === 'oak-beams' && (option.id === 'lengthCm' || option.id === 'widthCm' || option.id === 'thicknessCm') && (
              <p className="text-xs text-muted-foreground mt-1">
                {unitSystem === 'inches' && option.id === 'lengthCm' ? formatToFeetAndInches(currentValue as number) : unitLabel}
              </p>
            )}
         </div>
      )}

      {option.type === 'checkbox' && (
        <div className={cn("flex items-center space-x-2 pt-1", isSpecialLayout ? "justify-center" : "")}>
          <Checkbox
            id={option.id}
            checked={currentValue as boolean}
            onCheckedChange={(checked) => handleOptionChange(option.id, !!checked)}
          />
          <Label htmlFor={option.id} className={`font-normal cursor-pointer ${checkboxLabelSizeClass}`}>
            {option.checkboxLabel || 'Yes'}
          </Label>
        </div>
      )}
    </div>
  );
};

interface CuttingListItemType {
  id: string;
  productName: string;
  configuration: SelectedConfiguration[];
  quantityInList: number;
  unitPrice: number;
  linePrice: number;
  unitSystemAtAdd: 'cm' | 'inches'; 
}

export function ProductConfigurationForm({ product }: ProductConfigurationFormProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [unitSystem, setUnitSystem] = useState<'cm' | 'inches'>('cm');

  const initializeConfiguration = (): SelectedConfiguration[] => {
    return product.options.map(opt => {
      let value: string | number | boolean = opt.defaultValue!;
      let label = ''; 
      let priceModifier = opt.priceModifier || 0;

      if (opt.type === 'select' || opt.type === 'radio') {
        const selectedValueObj = opt.values?.find(v => v.value === value) || opt.values?.[0];
        if (selectedValueObj) {
          label = selectedValueObj.label;
          priceModifier = selectedValueObj.priceModifier || 0;
          value = selectedValueObj.value;
        } else if (opt.values?.[0]) {
            label = opt.values[0].label;
            value = opt.values[0].value;
            priceModifier = opt.values[0].priceModifier || 0;
        }
      } else if (opt.type === 'slider' || opt.type === 'number_input') {
        value = Number(opt.defaultValue);
        if (!(product.id === 'oak-beams' && (opt.id === 'lengthCm' || opt.id === 'widthCm' || opt.id === 'thicknessCm'))) {
            label = `${value} ${opt.unit || ''}`.trim();
        } else {
            label = String(value); 
        }
      } else if (opt.type === 'checkbox') {
        value = Boolean(opt.defaultValue);
        label = opt.checkboxLabel || 'Enabled';
        if (value === true) {
            priceModifier = opt.priceModifier || 0;
        } else {
            priceModifier = 0;
        }
      }
      return {
        optionId: opt.id,
        optionName: opt.name, 
        value: value, 
        label: label, 
        priceModifier: priceModifier,
      };
    });
  };

  const [configuration, setConfiguration] = useState<SelectedConfiguration[]>(initializeConfiguration());
  const [quantity, setQuantity] = useState(1); 
  const [currentPrice, setCurrentPrice] = useState(0);
  const [cuttingListItems, setCuttingListItems] = useState<CuttingListItemType[]>([]);
  const [cuttingListTotal, setCuttingListTotal] = useState(0);

  const getOptionValue = useCallback((optionId: string): string | number | boolean | undefined => {
    return configuration.find(c => c.optionId === optionId)?.value;
  }, [configuration]);

  const calculatePrice = useCallback(() => {
    let calculatedTotal = product.basePrice;

    if (product.id === 'garages' && product.garagePricingParams) {
      const params = product.garagePricingParams;
      const numBays = getOptionValue('numBays') as number || 1;
      const beamSize = getOptionValue('beamSize') as string || '6x6';
      const trussType = getOptionValue('trussType') as string || 'curved';
      const baySize = getOptionValue('baySize') as string || 'standard'; 
      const catSlide = getOptionValue('catSlide') as boolean || false;
      let price = product.basePrice;
      price += (numBays -1) * params.bayPrice;
      price += (params.beamSizePrices[beamSize] || 0) * numBays;
      price += params.trussPrices[trussType] || 0;
      if (catSlide) price += params.catSlidePricePerBay * numBays;
      calculatedTotal = price * (params.baySizeMultipliers[baySize] || 1.0);
    } else if (product.id === 'oak-beams') {
        const lengthCm = configuration.find(c=>c.optionId === 'lengthCm')?.value as number || 0;
        const widthCm = configuration.find(c=>c.optionId === 'widthCm')?.value as number || 0;
        const thicknessCm = configuration.find(c=>c.optionId === 'thicknessCm')?.value as number || 0;
        
        const volumeCm3 = lengthCm * widthCm * thicknessCm;
        let price = volumeCm3 * 0.0008; 
        const oakTypeConfig = configuration.find(c => c.optionId === 'oakType');
        if (oakTypeConfig) {
            const selectedOakType = product.options.find(o => o.id === 'oakType')?.values?.find(v => v.value === oakTypeConfig.value);
            price += selectedOakType?.priceModifier || 0;
        }
        calculatedTotal = price;
    } else if (product.id === 'oak-flooring') {
        let areaOrLength = getOptionValue('area') as number || 1;
        calculatedTotal = areaOrLength * product.basePrice;
        configuration.forEach(opt => {
            const productOption = product.options.find(po => po.id === opt.optionId);
            if (productOption && productOption.type !== 'slider' && productOption.id !== 'area') {
                 if (productOption.type === 'checkbox' && opt.value === true) {
                    calculatedTotal += productOption.priceModifier || 0;
                 } else if (productOption.type !== 'checkbox') {
                    const selectedValueObj = productOption.values?.find(v => v.value === opt.value);
                    if (selectedValueObj) {
                        if (product.id === 'oak-flooring' && (productOption.id === 'grade' || productOption.id === 'width')) {
                           calculatedTotal += (selectedValueObj.priceModifier || 0) * areaOrLength;
                        } else {
                           calculatedTotal += selectedValueObj.priceModifier || 0;
                        }
                    }
                 }
            }
        });
    } else {
      let optionsPrice = configuration.reduce((sum, opt) => {
          const productOption = product.options.find(po => po.id === opt.optionId);
          if (!productOption) return sum;
          if (product.id === 'gazebos' && opt.optionId === 'numBays') return sum;
          if (productOption.type === 'checkbox') {
              return sum + (opt.value === true ? (productOption.priceModifier || 0) : 0);
          }
          return sum + (productOption.type !== 'slider' && productOption.type !== 'number_input' ? (opt.priceModifier || 0) : 0);
      }, 0);
      calculatedTotal = product.basePrice + optionsPrice;
      if (product.id === 'gazebos') {
        const numBays = getOptionValue('numBays') as number || 1;
        if (numBays > 1) {
          calculatedTotal += (numBays - 1) * 4500;
        }
      }
    }
    setCurrentPrice(calculatedTotal);
  }, [configuration, product, getOptionValue]);

  useEffect(() => {
    calculatePrice();
  }, [configuration, calculatePrice, unitSystem]);

  useEffect(() => {
    const total = cuttingListItems.reduce((sum, item) => sum + item.linePrice, 0);
    setCuttingListTotal(total);
  }, [cuttingListItems]);

  const handleOptionChange = (optionId: string, newValue: string | number | boolean, inputUnit?: 'cm' | 'inches') => {
    const productOption = product.options.find(opt => opt.id === optionId);
    if (!productOption) return;

    let actualValueToStore = newValue;
    if (product.id === 'oak-beams' && (optionId === 'lengthCm' || optionId === 'widthCm' || optionId === 'thicknessCm') && inputUnit === 'inches' && typeof newValue === 'number') {
        actualValueToStore = parseFloat((newValue * CM_TO_INCH).toFixed(2));
    }

    let newLabel = ''; 
    let newPriceModifier = 0;
    if (productOption.type === 'select' || productOption.type === 'radio') {
      const valueObj = productOption.values?.find(v => v.value === (actualValueToStore as string));
      if (valueObj) {
        newLabel = valueObj.label;
        newPriceModifier = valueObj.priceModifier || 0;
      }
    } else if (productOption.type === 'slider' || productOption.type === 'number_input') {
      const numericValue = Number(actualValueToStore);
      if (!(product.id === 'oak-beams' && (optionId === 'lengthCm' || optionId === 'widthCm' || optionId === 'thicknessCm'))) {
          newLabel = `${numericValue} ${productOption.unit || ''}`.trim();
      } else {
          newLabel = String(numericValue); 
      }
    } else if (productOption.type === 'checkbox') {
      newLabel = actualValueToStore ? (productOption.checkboxLabel || 'Yes') : ('No');
      newPriceModifier = actualValueToStore ? (productOption.priceModifier || 0) : 0;
    }

    setConfiguration(prevConfig =>
      prevConfig.map(opt =>
        opt.optionId === optionId
          ? { ...opt, value: actualValueToStore, label: newLabel, priceModifier: newPriceModifier }
          : opt
      )
    );
  };

  const handleAddToCart = (message?: string) => {
    addToCart(product, quantity, configuration);
    toast({
      title: message || "Added to Cart!",
      description: `${product.name} (x${quantity}) has been added to your basket.`,
      duration: 3000,
    });
  };

  const handleAddToCuttingList = () => {
    const cuttingListItemId = Date.now().toString() + Math.random().toString(36).substring(2, 15);
    const lengthCm = configuration.find(c=>c.optionId === 'lengthCm')?.value as number || 0;
    const widthCm = configuration.find(c=>c.optionId === 'widthCm')?.value as number || 0;
    const thicknessCm = configuration.find(c=>c.optionId === 'thicknessCm')?.value as number || 0;
    const volumeCm3 = lengthCm * widthCm * thicknessCm;
    let itemUnitPrice = volumeCm3 * 0.0008;
    const oakTypeConfig = configuration.find(c => c.optionId === 'oakType');
    if (oakTypeConfig) {
        const selectedOakType = product.options.find(o => o.id === 'oakType')?.values?.find(v => v.value === oakTypeConfig.value);
        itemUnitPrice += selectedOakType?.priceModifier || 0;
    }
    const lineItemPrice = itemUnitPrice * quantity;

    setCuttingListItems(prev => [
      ...prev,
      {
        id: cuttingListItemId,
        productName: product.name,
        configuration: JSON.parse(JSON.stringify(configuration.map(opt => ({...opt, value: opt.value })))),
        quantityInList: quantity, 
        unitPrice: itemUnitPrice,
        linePrice: lineItemPrice,
        unitSystemAtAdd: unitSystem 
      }
    ]);
    toast({ title: "Added to Cutting List", description: `${product.name} (x${quantity}) added.` });
  };

  const updateCuttingListItemQuantity = (itemId: string, change: number) => {
    setCuttingListItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantityInList + change);
          return {
            ...item,
            quantityInList: newQuantity,
            linePrice: item.unitPrice * newQuantity,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveCuttingListItem = (itemId: string) => {
    setCuttingListItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast({ title: "Item Removed", description: "The beam has been removed from your cutting list.", duration: 2000 });
  };

  const totalPrice = currentPrice * quantity; 
  const formattedTotalPrice = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(totalPrice);
  const formattedCuttingListTotal = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(cuttingListTotal);

  const isOakBeamsLayout = product.id === 'oak-beams';
  const isPorchesLayout = product.id === 'porches';
  const useCenteredOptionsLayout = isPorchesLayout || (!isOakBeamsLayout && !isPorchesLayout);
  const cardWidthClass = (isPorchesLayout || product.id === 'oak-beams' || product.id === 'garages' || product.id === 'gazebos' || product.id === 'oak-flooring') 
    ? "max-w-xl mx-auto" 
    : "md:max-w-md lg:max-w-lg mx-auto";

  return (
    <Card className={cn("w-full shadow-lg rounded-lg border-2 bg-card", cardWidthClass)}>
      <CardHeader className="text-center pt-4 pb-3">
        <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
          Configure Your New {product.name}
        </CardTitle>
        <Separator className="mt-3 bg-border/50" />
      </CardHeader>

      {isOakBeamsLayout && (
        <CardContent className="space-y-4 px-4 md:px-8 pt-4">
          <div className="flex items-center space-x-2 justify-end mb-3">
            <Label htmlFor="unit-switch" className="text-sm font-medium">Show in Inches</Label>
            <Switch
              id="unit-switch"
              checked={unitSystem === 'inches'}
              onCheckedChange={(checked) => setUnitSystem(checked ? 'inches' : 'cm')}
            />
          </div>
          {product.options.filter(opt => opt.id === 'oakType').map(option => {
            const currentValue = configuration.find(c => c.optionId === option.id)?.value;
            return renderOption(option, currentValue, handleOptionChange, product, false, unitSystem);
          })}
          <div className="text-center">
            <Label className="text-md font-semibold text-foreground block mb-1">Dimensions</Label>
            <div className="grid grid-cols-3 gap-3 mx-auto max-w-md">
              {['lengthCm', 'widthCm', 'thicknessCm'].map(dimId => {
                const option = product.options.find(opt => opt.id === dimId);
                if (!option) return null;
                 return renderOption(option, getOptionValue(option.id), handleOptionChange, product, true, unitSystem);
              })}
            </div>
          </div>
          <div className="text-center pt-2">
            <Label htmlFor={`quantity-${product.id}`} className="text-lg font-semibold text-foreground block mb-2">
              Quantity
            </Label>
            <div className="flex items-center justify-center space-x-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
                <ChevronDown className="h-5 w-5" />
              </Button>
              <span className="w-10 text-center text-foreground font-medium tabular-nums text-lg">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">
                <ChevronUp className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-end px-2">
            <div>
              <p className="text-lg font-semibold text-foreground">Total</p>
              <p className="text-xs text-foreground">(excl. VAT & Delivery)</p>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {formattedTotalPrice}
            </p>
          </div>
          
          <div className="mt-4">
            <Button 
              onClick={handleAddToCuttingList} 
              variant="default" 
              size="lg" 
              className="w-full bg-slate-600 hover:bg-slate-700 text-white"
            >
              <Plus className="mr-2 h-5 w-5" /> Add to Cutting List
            </Button>
          </div>

          <Separator className="my-6" />
          <div>
            <h3 className="text-xl font-semibold text-center mb-4">Cutting List</h3>
            {cuttingListItems.length === 0 ? (
              <p className="text-center text-muted-foreground">Your cutting list is empty.</p>
            ) : (
              <div className="space-y-2">
                {cuttingListItems.map((item, index) => {
                  const displayConfiguration = item.configuration.map(opt => {
                    let value = opt.value;
                    const originalProductOption = product.options.find(po => po.id === opt.optionId);
                    let unitSuffix = '';

                    if (originalProductOption && (opt.optionId === 'lengthCm' || opt.optionId === 'widthCm' || opt.optionId === 'thicknessCm')) {
                        if (item.unitSystemAtAdd === 'inches' && typeof opt.value === 'number') {
                            if (opt.optionId === 'lengthCm') {
                                return `${originalProductOption.name.replace(/\s*\(cm\)\s*$/, '')}: ${formatToFeetAndInches(opt.value as number)}`;
                            }
                            value = parseFloat((opt.value / CM_TO_INCH).toFixed(2));
                            unitSuffix = 'in'; // Changed from 'inches' to 'in'
                        } else if (typeof opt.value === 'number') {
                             unitSuffix = 'cm';
                        }
                    } else if (originalProductOption && typeof opt.value === 'number' && originalProductOption.unit) {
                        unitSuffix = originalProductOption.unit;
                    }
                    
                    return `${opt.optionName.replace(/\s*\(cm\)\s*$/, '')}: ${value}${unitSuffix ? ' ' + unitSuffix : ''}`;
                  }).join(' / ');

                  return (
                    <div key={item.id} className="p-3 border rounded-md bg-muted/30 flex flex-col sm:flex-row justify-between sm:items-center">
                      <div className="flex-grow mb-2 sm:mb-0">
                        <span className="font-medium text-foreground">Beam {index + 1}: </span>
                        <span className="text-sm text-muted-foreground">{displayConfiguration}</span>
                      </div>
                      <div className="flex items-center space-x-1 sm:ml-4"> {/* Reduced space-x-2 to space-x-1 */}
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateCuttingListItemQuantity(item.id, -1)} disabled={item.quantityInList <= 1}>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground w-5 text-center">{item.quantityInList}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateCuttingListItemQuantity(item.id, 1)}>
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-semibold text-foreground whitespace-nowrap ml-1"> {/* Reduced ml-2 to ml-1 */}
                          {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(item.linePrice)}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive/80" onClick={() => handleRemoveCuttingListItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <Separator className="my-3" />
                <div className="flex justify-end items-center mt-3 pr-3">
                  <p className="text-lg font-semibold text-foreground mr-2">Cutting List Total:</p>
                  <p className="text-xl font-bold text-foreground">{formattedCuttingListTotal}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}

      {!isOakBeamsLayout && (
        <CardContent className="space-y-3 p-4 md:p-6 pt-4">
          {product.options.map(option => {
            const currentValue = configuration.find(c => c.optionId === option.id)?.value;
            return renderOption(option, currentValue, handleOptionChange, product, useCenteredOptionsLayout, unitSystem);
          })}
          <Separator className="my-3" />
          <div className="flex justify-between items-end px-2">
            <div>
              <p className="text-lg font-semibold text-foreground">Total</p>
              <p className="text-xs text-foreground">(excl. VAT & Delivery)</p>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {formattedTotalPrice}
            </p>
          </div>
        </CardContent>
      )}

      <CardFooter className={cn(
          "flex flex-col sm:flex-row justify-center gap-3 pt-6 pb-8", 
          {'sm:flex-row': !isOakBeamsLayout }, 
          {'gap-4 pt-2': product.id === 'garages' || product.id === 'gazebos'}, 
          {'gap-3 pt-6': isPorchesLayout || product.id === 'oak-flooring' || isOakBeamsLayout} 
      )}>
        {isOakBeamsLayout ? (
          <div className="w-full max-w-md mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => router.back()} variant="outline" size="lg" className="w-full sm:w-auto flex-1">
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button onClick={()=> handleAddToCart("Oak Beam added to cart")} size="lg" className="w-full sm:w-auto flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
               <Button
                size="lg"
                className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={() => {
                  handleAddToCart("Item added to cart. Proceeding to checkout...");
                  router.push('/checkout');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.326 4.111c.404-.196.606.096.48.492l-2.05 6.993c-.11.375.068.66.45.66h2.727c2.56 0 4.259-1.215 4.527-3.708.215-1.96-.859-3.016-2.739-3.016h-2.063c-.233 0-.39-.114-.31-.325l.836-2.096c.08-.21.242-.35.46-.35h2.563c.382 0 .58-.275.47-.643L11.251.53C11.141.176 10.94 0 10.557 0H4.493c-.383 0-.581.276-.471.643l1.746 4.389c.11.276-.068.562-.45.562H3.165c-2.31 0-3.621 1.5-3.165 4.027.382 2.13 1.968 3.334 4.027 3.334h1.478c.55 0 .836.383.709.909l-1.715 5.503c-.128.41.053.709.442.709h4.027l.096-.3c.128-.41.347-.677.693-.677h.958c2.822 0 5.138-1.58 5.626-4.6.382-2.406-.766-3.85-2.806-3.85h-2.096c-.347 0-.548-.259-.45-.612l1.698-5.765z"/>
                </svg>
                Pay Now
              </Button>
            </div>
            {/* "Add to Cutting List" button is now part of CardContent for OakBeamsLayout */}
          </div>
        ) : (product.id === 'garages' || product.id === 'gazebos' || product.id === 'porches' || product.id === 'oak-flooring') ? (
          <>
            <Button onClick={() => router.back()} variant="outline" size="lg" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-5 w-5" /> Back
            </Button>
            <Button onClick={()=> handleAddToCart()} size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
             <Button
              size="lg"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              onClick={() => {
                handleAddToCart("Item added to cart. Proceeding to checkout...");
                router.push('/checkout');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.326 4.111c.404-.196.606.096.48.492l-2.05 6.993c-.11.375.068.66.45.66h2.727c2.56 0 4.259-1.215 4.527-3.708.215-1.96-.859-3.016-2.739-3.016h-2.063c-.233 0-.39-.114-.31-.325l.836-2.096c.08-.21.242-.35.46-.35h2.563c.382 0 .58-.275.47-.643L11.251.53C11.141.176 10.94 0 10.557 0H4.493c-.383 0-.581.276-.471.643l1.746 4.389c.11.276-.068.562-.45.562H3.165c-2.31 0-3.621 1.5-3.165 4.027.382 2.13 1.968 3.334 4.027 3.334h1.478c.55 0 .836.383.709.909l-1.715 5.503c-.128.41.053.709.442.709h4.027l.096-.3c.128-.41.347-.677.693-.677h.958c2.822 0 5.138-1.58 5.626-4.6.382-2.406-.766-3.85-2.806-3.85h-2.096c-.347 0-.548-.259-.45-.612l1.698-5.765z"/>
              </svg>
              Pay Now
            </Button>
          </>
        ) : null}
      </CardFooter>
    </Card>
  );
}
