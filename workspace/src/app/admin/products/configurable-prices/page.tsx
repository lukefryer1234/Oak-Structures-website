
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// --- Types ---

type ProductCategory = 'Garages' | 'Gazebos' | 'Porches';

interface ConfigurablePrice {
  id: string;
  category: ProductCategory;
  configKey: string;
  configDescription: string;
  price: number;
}

interface ConfigurableAttributeChoice {
  value: string;
  label: string;
}

interface ConfigurableAttribute {
  id: keyof ConfigurablePriceSelections; // e.g., 'size', 'trussType'
  label: string; // e.g., 'Size', 'Truss Type'
  choices: ConfigurableAttributeChoice[];
}

// Specific selection types for formState
interface ConfigurablePriceSelections {
  // Garage options
  g_size?: string;
  g_trussType?: string;
  g_bays?: string; // Storing as string from select, parse if needed
  g_catSlide?: 'yes' | 'no';
  g_oakType?: string;

  // Gazebo options
  gz_legType?: string;
  gz_sizeType?: string;
  gz_trussType?: string;

  // Porch options
  p_trussType?: string;
  p_legType?: string;
  p_sizeType?: string;
}

interface PriceFormState {
  category?: ProductCategory;
  price?: number | string; // string from input, number after parse
  currentConfigSelections: Partial<ConfigurablePriceSelections>;
  // Generated fields
  configKey?: string;
  configDescription?: string;
}


// Placeholder data - Fetch from backend
const initialPrices: ConfigurablePrice[] = [
  { id: 'p1', category: 'Garages', configKey: 'g_bays-2_g_catSlide-no_g_oakType-reclaimed_g_size-medium_g_trussType-curved', configDescription: 'Garages: Bays 2, Cat Slide No, Oak Type Reclaimed, Size Medium, Truss Type Curved', price: 8500 },
  { id: 'p2', category: 'Garages', configKey: 'g_bays-3_g_catSlide-yes_g_oakType-kilned_g_size-large_g_trussType-straight', configDescription: 'Garages: Bays 3, Cat Slide Yes, Oak Type Kilned, Size Large, Truss Type Straight', price: 12000 },
  { id: 'p3', category: 'Gazebos', configKey: 'gz_legType-full_gz_sizeType-4x4_gz_trussType-curved', configDescription: 'Gazebos: Leg Type Full, Size Type 4x4, Truss Type Curved', price: 3500 },
  { id: 'p4', category: 'Porches', configKey: 'p_legType-floor_p_sizeType-standard_p_trussType-curved', configDescription: 'Porches: Leg Type Floor, Size Type Standard, Truss Type Curved', price: 2150 },
];

const categoryOptions: ProductCategory[] = ['Garages', 'Gazebos', 'Porches'];

const garageOptionDefinitions: ConfigurableAttribute[] = [
  { id: 'g_size', label: 'Size', choices: [{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }] },
  { id: 'g_trussType', label: 'Truss Type', choices: [{ value: 'curved', label: 'Curved' }, { value: 'straight', label: 'Straight' }] },
  { id: 'g_bays', label: 'Number of Bays', choices: [{ value: '1', label: '1 Bay' }, { value: '2', label: '2 Bays' }, { value: '3', label: '3 Bays' }, { value: '4', label: '4 Bays' }] },
  { id: 'g_catSlide', label: 'Cat Slide', choices: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'g_oakType', label: 'Oak Type', choices: [{ value: 'reclaimed', label: 'Reclaimed Oak' }, { value: 'kilned', label: 'Kilned Dried Oak' }] },
];
const gazeboOptionDefinitions: ConfigurableAttribute[] = [
  { id: 'gz_legType', label: 'Leg Type', choices: [{ value: 'full', label: 'Full Height Legs' }, { value: 'wall', label: 'Wall Mount (Half Legs)' }] },
  { id: 'gz_sizeType', label: 'Size', choices: [{ value: '3x3', label: '3m x 3m' }, { value: '4x3', label: '4m x 3m' }, { value: '4x4', label: '4m x 4m' }] },
  { id: 'gz_trussType', label: 'Truss Type', choices: [{ value: 'curved', label: 'Curved' }, { value: 'straight', label: 'Straight' }] },
];
const porchOptionDefinitions: ConfigurableAttribute[] = [
  { id: 'p_trussType', label: 'Truss Type', choices: [{ value: 'curved', label: 'Curved' }, { value: 'straight', label: 'Straight' }] },
  { id: 'p_legType', label: 'Leg Type', choices: [{ value: 'floor', label: 'Legs to Floor' }, { value: 'wall', label: 'Legs to Wall' }] },
  { id: 'p_sizeType', label: 'Size', choices: [{ value: 'narrow', label: 'Narrow (1.5m Wide)' }, { value: 'standard', label: 'Standard (2m Wide)' }, { value: 'wide', label: 'Wide (2.5m Wide)' }] },
];

const allOptionDefinitions: Record<ProductCategory, ConfigurableAttribute[]> = {
  Garages: garageOptionDefinitions,
  Gazebos: gazeboOptionDefinitions,
  Porches: porchOptionDefinitions,
};


export default function ConfigurablePricesPage() {
  const [prices, setPrices] = useState<ConfigurablePrice[]>(initialPrices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<ConfigurablePrice | null>(null);
  const [formState, setFormState] = useState<PriceFormState>({ currentConfigSelections: {} });
  const { toast } = useToast();

  const generateConfigKeyAndDescription = (currentSelections: Partial<ConfigurablePriceSelections>, category?: ProductCategory): { configKey: string, configDescription: string } => {
    if (!category) return { configKey: '', configDescription: 'Select a category first.' };

    const activeDefinitions = allOptionDefinitions[category];
    const descriptionParts: string[] = [];
    const keyParts: string[] = [];

    activeDefinitions.forEach(def => {
      const selectedValue = currentSelections[def.id];
      if (selectedValue) {
        const selectedChoice = def.choices.find(c => c.value === selectedValue);
        descriptionParts.push(`${def.label}: ${selectedChoice?.label || selectedValue}`);
        keyParts.push(`${def.id}-${selectedValue}`);
      }
    });

    keyParts.sort(); // Ensure canonical key
    const configKey = keyParts.length > 0 ? `${category.toLowerCase()}_${keyParts.join('_')}` : category.toLowerCase();
    const configDescription = descriptionParts.length > 0 ? `${category}: ${descriptionParts.join(', ')}` : category;
    
    return { configKey, configDescription };
  };
  
  useEffect(() => {
    if (!editingPrice) { // Only regenerate for new items or when options change
      const { configKey, configDescription } = generateConfigKeyAndDescription(formState.currentConfigSelections, formState.category);
      setFormState(prev => ({ ...prev, configKey, configDescription }));
    }
  }, [formState.currentConfigSelections, formState.category, editingPrice]);


  const handleFormInputChange = (field: keyof PriceFormState, value: ProductCategory | string | number) => {
    if (field === 'category') {
      // When category changes, reset selections for the previous category and clear generated key/desc
      setFormState(prev => ({
        ...prev,
        [field]: value as ProductCategory,
        currentConfigSelections: {}, // Reset selections
        configKey: '',
        configDescription: '',
      }));
    } else if (field === 'price') {
      setFormState(prev => ({ ...prev, price: value as string | number }));
    }
  };

  const handleSelectionChange = (optionId: keyof ConfigurablePriceSelections, value: string) => {
    setFormState(prev => ({
      ...prev,
      currentConfigSelections: {
        ...prev.currentConfigSelections,
        [optionId]: value,
      }
    }));
  };

  const handleSavePrice = (event: React.FormEvent) => {
    event.preventDefault();
    const priceValue = parseFloat(formState.price as string);

    if (!formState.category) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please select a category." });
      return;
    }
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please enter a valid positive price." });
      return;
    }

    let priceEntryData: Omit<ConfigurablePrice, 'id'>;

    if (editingPrice) { // Editing existing price
      priceEntryData = {
        category: editingPrice.category,
        configKey: editingPrice.configKey,
        configDescription: editingPrice.configDescription,
        price: priceValue,
      };
    } else { // Adding new price
      if (!formState.configKey || !formState.configDescription || Object.keys(formState.currentConfigSelections).length === 0) {
        toast({ variant: "destructive", title: "Validation Error", description: "Please select configuration options to generate a description and key." });
        return;
      }
      priceEntryData = {
        category: formState.category!,
        configKey: formState.configKey!,
        configDescription: formState.configDescription!,
        price: priceValue,
      };
    }
    
    const newOrUpdatedPriceEntry: ConfigurablePrice = {
      id: editingPrice?.id ?? `p${Date.now()}`,
      ...priceEntryData
    };

    if (editingPrice) {
      setPrices(prev => prev.map(p => p.id === editingPrice.id ? newOrUpdatedPriceEntry : p));
      toast({ title: "Success", description: "Price configuration updated." });
      console.log("Updated Price:", newOrUpdatedPriceEntry);
    } else {
      setPrices(prev => [...prev, newOrUpdatedPriceEntry]);
      toast({ title: "Success", description: "New price configuration added." });
      console.log("Added Price:", newOrUpdatedPriceEntry);
    }
    closeDialog();
  };

  const openAddDialog = () => {
    setEditingPrice(null);
    setFormState({ category: undefined, price: '', currentConfigSelections: {}, configKey: '', configDescription: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (priceToEdit: ConfigurablePrice) => {
    setEditingPrice(priceToEdit);
    setFormState({
      category: priceToEdit.category,
      price: priceToEdit.price,
      currentConfigSelections: {}, // Selections not pre-filled for edit, description shown instead
      configKey: priceToEdit.configKey,
      configDescription: priceToEdit.configDescription,
    });
    setIsDialogOpen(true);
  };

  const handleDeletePrice = (id: string) => {
    if (window.confirm("Are you sure you want to delete this price configuration?")) {
      setPrices(prev => prev.filter(p => p.id !== id));
      toast({ title: "Deleted", description: "Price configuration removed." });
      console.log("Deleted Price ID:", id);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPrice(null);
    setFormState({ currentConfigSelections: {} });
  };

  const renderCategoryOptions = () => {
    if (!formState.category || editingPrice) return null; // Don't render if no category or if editing

    const currentDefinitions = allOptionDefinitions[formState.category];
    if (!currentDefinitions) return null;

    return currentDefinitions.map(attr => (
      <div key={attr.id} className="space-y-2">
        <Label htmlFor={attr.id}>{attr.label} <span className="text-destructive">*</span></Label>
        <Select
          value={formState.currentConfigSelections[attr.id] || ''}
          onValueChange={(value) => handleSelectionChange(attr.id, value)}
          required
        >
          <SelectTrigger id={attr.id}>
            <SelectValue placeholder={`Select ${attr.label}`} />
          </SelectTrigger>
          <SelectContent>
            {attr.choices.map(choice => <SelectItem key={choice.value} value={choice.value}>{choice.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    ));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Configurable Product Prices</CardTitle>
          <CardDescription>
            Set prices for specific combinations of Garage, Gazebo, and Porch options.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Price Config
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingPrice ? 'Edit' : 'Add'} Price Configuration</DialogTitle>
              <DialogDescription>
                {editingPrice 
                  ? "Modify the price for this existing configuration." 
                  : "Define the price for a unique combination of product options."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSavePrice} id="addEditPriceForm" className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                <Select
                  value={formState.category}
                  onValueChange={(value) => handleFormInputChange('category', value as ProductCategory)}
                  required
                  disabled={!!editingPrice} // Disable category change when editing
                >
                  <SelectTrigger id="category" className={editingPrice ? "bg-muted/50" : ""}>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {!editingPrice && renderCategoryOptions()}
              
              {editingPrice && formState.configDescription && (
                <div className="space-y-2 mt-4 p-3 bg-muted/50 rounded-md border">
                    <Label>Configuration Description (Editing)</Label>
                    <p className="text-sm">{formState.configDescription}</p>
                    <p className="text-xs text-muted-foreground mt-1">Key: {formState.configKey || '-'}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="price">Price (£) <span className="text-destructive">*</span></Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g., 8500.00"
                  value={formState.price ?? ''}
                  onChange={(e) => handleFormInputChange('price', e.target.value)}
                  required
                />
              </div>

              {!editingPrice && (
                <div className="space-y-2 mt-4 p-3 bg-muted/50 rounded-md border">
                  <Label>Generated Description:</Label>
                  <p className="text-sm">{formState.configDescription || 'Configure options above...'}</p>
                  <p className="text-xs text-muted-foreground mt-1">Key: {formState.configKey || 'Will be generated...'}</p>
                </div>
              )}
            </form>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              </DialogClose>
              <Button type="submit" form="addEditPriceForm">
                {editingPrice ? 'Save Changes' : 'Add Price'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Configuration Description</TableHead>
              <TableHead className="text-right">Price (£)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices.length > 0 ? (
              prices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell>{price.category}</TableCell>
                  <TableCell>
                    <span title={price.configKey} className="cursor-help">{price.configDescription}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{price.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 mr-1" onClick={() => openEditDialog(price)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeletePrice(price.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No configurable prices set up yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
