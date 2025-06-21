"use client"; // For state, form handling

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Edit, Loader2 } from 'lucide-react'; // Icons
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { useConfigurablePrices, CONFIGURABLE_PRICES_QUERY_KEY_PREFIX } from '@/hooks/products/useConfigurablePrices';
import { useCreateConfigurablePrice } from '@/hooks/products/useCreateConfigurablePrice';
import { useUpdateConfigurablePrice } from '@/hooks/products/useUpdateConfigurablePrice';
import { useDeleteConfigurablePrice } from '@/hooks/products/useDeleteConfigurablePrice';
import { type ConfigurablePrice, type CreateConfigurablePriceData, type UpdateConfigurablePriceData, type ConfigurablePriceCategory } from '@/services/domain/product-service';
import { Textarea } from "@/components/ui/textarea";


const categoryOptions: ConfigurablePriceCategory[] = ['Garages', 'Gazebos', 'Porches'];


export default function ConfigurablePricesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: pricesData, isLoading: isLoadingPrices, isError: isErrorPrices, error: errorPrices } = useConfigurablePrices();
  const { mutate: createPrice, isLoading: isCreating } = useCreateConfigurablePrice();
  const { mutate: updatePrice, isLoading: isUpdating } = useUpdateConfigurablePrice();
  const { mutate: deletePrice, isLoading: isDeleting } = useDeleteConfigurablePrice();
  const prices = pricesData || [];
  const [editingPrice, setEditingPrice] = useState<ConfigurablePrice | null>(null);
  const [formState, setFormState] = useState<Partial<CreateConfigurablePriceData | ConfigurablePrice>>({});
  const { toast } = useToast();

          const handleFormChange = (field: keyof (CreateConfigurablePriceData | ConfigurablePrice), value: any) => {
            setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePrice = (event: React.FormEvent) => {
    event.preventDefault();
    const priceValue = parseFloat(formState.price as any); // Already parsing
    if (!formState.category || !formState.configKey || !formState.configDescription || isNaN(priceValue) || priceValue <= 0) {
        toast({ variant: "destructive", title: "Validation Error", description: "Category, Config Key, Description, and a valid positive Price are required." });
        return;
    }

    if (editingPrice) {
        const updateData: UpdateConfigurablePriceData = {
            // category is not updatable as per UpdateConfigurablePriceSchema
            configKey: formState.configKey,
            configDescription: formState.configDescription,
            price: priceValue,
        };
        updatePrice({ id: editingPrice.id, data: updateData }, {
            onSuccess: () => closeDialog(),
        });
    } else {
        const createData: CreateConfigurablePriceData = {
            category: formState.category as ConfigurablePriceCategory, // Cast needed
            configKey: formState.configKey!,
            configDescription: formState.configDescription!,
            price: priceValue,
        };
        createPrice(createData, {
            onSuccess: () => closeDialog(),
        });
    }
  };


   const openAddDialog = () => {
    setEditingPrice(null);
    setFormState({}); // Reset form
    setIsDialogOpen(true);
  };

   const openEditDialog = (price: ConfigurablePrice) => {
    setEditingPrice(price);
    setFormState(price); // Pre-fill form with existing data
    setIsDialogOpen(true);
  };

  const handleDeletePrice = (id: string) => {
     if (window.confirm("Are you sure you want to delete this price configuration?")) {
        deletePrice(id);
     }
  };


  const closeDialog = () => {
     setIsDialogOpen(false);
     setEditingPrice(null);
     setFormState({});
  }

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
                 Define the price for a unique combination of product options. Ensure the combination is accurately described.
              </DialogDescription>
            </DialogHeader>
             {/* Added ID to the form */}
             <form onSubmit={handleSavePrice} id="addEditPriceForm" className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
                {/* Category Select */}
                 <div className="space-y-2">
                    <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                    <Select
                       value={formState.category}
                       onValueChange={(value) => handleFormChange('category', value as ConfigurablePriceCategory)}
                       // required // Select component doesn't use HTML5 required in the same way
                       disabled={!!editingPrice} // Cannot change category when editing
                    >
                       <SelectTrigger id="category">
                          <SelectValue placeholder="Select Category" />
                       </SelectTrigger>
                       <SelectContent>
                          {categoryOptions.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                       </SelectContent>
                    </Select>
                 </div>

                {/* Simplified Config Key and Description Inputs */}
                <div className="space-y-2">
                  <Label htmlFor="configKey">Config Key <span className="text-destructive">*</span></Label>
                  <Input id="configKey" value={formState.configKey ?? ""} onChange={(e) => handleFormChange("configKey", e.target.value)} placeholder="e.g., large-curved-2bay" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="configDescription">Config Description <span className="text-destructive">*</span></Label>
                  <Textarea id="configDescription" value={formState.configDescription ?? ""} onChange={(e) => handleFormChange("configDescription", e.target.value)} placeholder="e.g., Large Garage, Curved Truss, 2 Bay" required />
                </div>
                {/* Price Input */}
                 <div className="space-y-2">
                    <Label htmlFor="price">Price (£) <span className="text-destructive">*</span></Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0.01" // Price must be positive as per schema
                      placeholder="e.g., 8500.00"
                      value={formState.price ?? ''}
                      onChange={(e) => handleFormChange('price', e.target.value)}
                      required
                    />
                 </div>

             </form>
             <DialogFooter>
               <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
               </DialogClose>
               {/* Submit button triggers the form's onSubmit */}
                <Button type="submit" form="addEditPriceForm" disabled={isCreating || isUpdating}>
                    {(isCreating || isUpdating) ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Saving...</> : (editingPrice ? 'Save Changes' : 'Add Price')}
                </Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {/* TODO: Add filtering/sorting controls if needed */}
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
            {isLoadingPrices ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></TableCell></TableRow>
            ) : isErrorPrices ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center text-red-500">Error loading prices: {errorPrices?.message}</TableCell></TableRow>
            ) : prices.length > 0 ? (
              prices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell>{price.category}</TableCell>
                  <TableCell>
                     <span title={price.configKey} className="cursor-help">{price.configDescription}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{price.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                     <Button variant="ghost" size="icon" className="h-8 w-8 mr-1" onClick={() => openEditDialog(price)} disabled={isCreating || isUpdating || isDeleting}>
                        <Edit className="h-4 w-4"/>
                         <span className="sr-only">Edit</span>
                     </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeletePrice(price.id)} disabled={isCreating || isUpdating || isDeleting}>
                         <Trash2 className="h-4 w-4"/>
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
