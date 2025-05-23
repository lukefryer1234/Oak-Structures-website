
"use client"; // Needed for state, form handling

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Edit } from 'lucide-react'; // Icons
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


// --- Types and Placeholder Data ---

interface ConfigurablePrice {
  id: string; // Unique ID for the price entry
  category: 'Garages' | 'Gazebos' | 'Porches';
  configKey: string; // A string representing the unique combination of options
  configDescription: string; // Human-readable description of the configuration
  price: number; // Price for this specific configuration
}

// Placeholder data - Fetch from backend
const initialPrices: ConfigurablePrice[] = [
  { id: 'p1', category: 'Garages', configKey: 'medium-curved-2-nocat-reclaimed', configDescription: 'Med Garage, Curved Truss, 2 Bay, No Cat Slide, Reclaimed Oak', price: 8500 },
  { id: 'p2', category: 'Garages', configKey: 'large-straight-3-yescat-kilned', configDescription: 'Lrg Garage, Straight Truss, 3 Bay, Cat Slide, Kilned Oak', price: 12000 },
  { id: 'p3', category: 'Gazebos', configKey: '4x4-curved-full-kilned', configDescription: '4x4 Gazebo, Curved Truss, Full Legs, Kilned Oak', price: 3500 },
  { id: 'p4', category: 'Porches', configKey: 'standard-curved-floor-reclaimed', configDescription: 'Std Porch, Curved Truss, Legs to Floor, Reclaimed Oak', price: 2150 },
];

// Options for the form - In real app, these might come from product definitions
const categoryOptions = ['Garages', 'Gazebos', 'Porches'];
// Add more options for each category based on the actual configuration possibilities
const garageOptions = ['Size: Small/Medium/Large', 'Truss: Curved/Straight', 'Bays: 1-4', 'CatSlide: Yes/No', 'Oak: Reclaimed/Kilned'];
const gazeboOptions = ['Legs: Full/Wall', 'Size: 3x3/4x3/4x4', 'Truss: Curved/Straight', 'Oak: Reclaimed/Kilned'];
const porchOptions = ['Truss: Curved/Straight', 'Legs: Floor/Wall', 'Size: Narrow/Standard/Wide', 'Oak: Reclaimed/Kilned'];


export default function ConfigurablePricesPage() {
  const [prices, setPrices] = useState<ConfigurablePrice[]>(initialPrices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<ConfigurablePrice | null>(null);
  const [formState, setFormState] = useState<Partial<ConfigurablePrice>>({}); // For Add/Edit form
  const { toast } = useToast(); // Initialize useToast

          const handleFormChange = (field: keyof ConfigurablePrice, value: any) => {
            setFormState(prev => ({ ...prev, [field]: value }));
            // TODO: Add logic to generate configKey and configDescription based on selected options
            
            // Get current category value - using type assertion to tell TypeScript this is valid
            const currentCategory = field === "category" ? value : formState.category;
            
            // Only update config description and key for non-price fields
            if (field !== 'price') {
                // Example: Combine selected options into a description (highly simplified)
                // In a real app, this would involve iterating over actual option selections
                const description = `Config: ${currentCategory ?? ''} - Options...`; // Placeholder description
                const key = `key-${Date.now()}`; // Placeholder key generation
                setFormState(prev => ({ ...prev, configDescription: description, configKey: key }));
            }
  };

  const handleSavePrice = (event: React.FormEvent) => {
    event.preventDefault();
    const priceValue = parseFloat(formState.price as any);
    if (isNaN(priceValue) || priceValue <= 0 || !formState.category || !formState.configKey || !formState.configDescription) {
         toast({ // Use toast for validation message
             variant: "destructive",
             title: "Validation Error",
             description: "Please fill in all required fields (Category, Options, Price) and ensure the price is valid.",
         });
        return;
    }

    const newPriceEntry: ConfigurablePrice = {
        id: editingPrice?.id ?? `p${Date.now()}`, // Use existing ID if editing, else generate
        category: formState.category!,
        configKey: formState.configKey!,
        configDescription: formState.configDescription!,
        price: priceValue,
    };

    if (editingPrice) {
        // Update existing price
        setPrices(prev => prev.map(p => p.id === editingPrice.id ? newPriceEntry : p));
         toast({ title: "Success", description: "Price configuration updated." });
         // TODO: API call to update price
        console.log("Updated Price:", newPriceEntry);

    } else {
        // Add new price
        setPrices(prev => [...prev, newPriceEntry]);
         toast({ title: "Success", description: "New price configuration added." });
         // TODO: API call to add price
        console.log("Added Price:", newPriceEntry);
    }

    closeDialog();
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
        setPrices(prev => prev.filter(p => p.id !== id));
         toast({ title: "Deleted", description: "Price configuration removed." });
         // TODO: API call to delete price
        console.log("Deleted Price ID:", id);
     }
  };


  const closeDialog = () => {
     setIsDialogOpen(false);
     setEditingPrice(null);
     setFormState({});
  }

  // Render form fields based on selected category (simplified example)
  const renderCategoryOptions = () => {
     let options: string[] = [];
     switch(formState.category) {
        case 'Garages': options = garageOptions; break;
        case 'Gazebos': options = gazeboOptions; break;
        case 'Porches': options = porchOptions; break;
     }
     return options.map(opt => (
        <div key={opt} className="space-y-2">
           <Label>{opt.split(':')[0]}</Label>
           {/* This Input needs to be replaced with actual interactive form elements (Select, Radio, Slider etc.)
               based on the 'opt' value to capture the actual configuration. The current setup is just a placeholder. */}
           <Input placeholder={`Select ${opt.split(':')[1]}`} disabled />
           <p className="text-xs text-muted-foreground">Placeholder for selecting {opt.split(':')[0].toLowerCase()} options.</p>
        </div>
     ));
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
                       onValueChange={(value) => handleFormChange('category', value as ConfigurablePrice['category'])}
                       required
                    >
                       <SelectTrigger id="category">
                          <SelectValue placeholder="Select Category" />
                       </SelectTrigger>
                       <SelectContent>
                          {categoryOptions.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                       </SelectContent>
                    </Select>
                 </div>

                {/* Dynamic Options based on Category */}
                {/* Add a note that these are placeholders */}
                {formState.category && (
                    <div className="p-4 border rounded-md bg-muted/50 space-y-4">
                         <p className="text-sm font-medium text-center text-muted-foreground">Configuration Options (Placeholders)</p>
                         <p className="text-xs text-center text-muted-foreground">Note: Detailed option selection fields need implementation here based on the chosen category.</p>
                         {renderCategoryOptions()}
                    </div>
                )}

                {/* Price Input */}
                 <div className="space-y-2">
                    <Label htmlFor="price">Price (£) <span className="text-destructive">*</span></Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 8500.00"
                      value={formState.price ?? ''}
                      onChange={(e) => handleFormChange('price', e.target.value)}
                      required
                    />
                 </div>

                 {/* Display generated description/key (read-only for user) */}
                  <div className="space-y-2 mt-4 p-3 bg-muted/50 rounded-md border">
                     <p className="text-sm font-medium text-muted-foreground">Generated Description:</p>
                     <p className="text-sm">{formState.configDescription || 'Configure options above...'}</p>
                     <p className="text-xs text-muted-foreground mt-1">Key: {formState.configKey || '-'}</p>
                     <p className="text-xs text-muted-foreground mt-1">Ensure this accurately reflects the selected options before saving.</p>
                  </div>

             </form>
             <DialogFooter>
               <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
               </DialogClose>
               {/* Submit button triggers the form's onSubmit */}
                <Button type="submit" form="addEditPriceForm">
                    {editingPrice ? 'Save Changes' : 'Add Price'}
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
                        <Edit className="h-4 w-4"/>
                         <span className="sr-only">Edit</span>
                     </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeletePrice(price.id)}>
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

