
"use client";

import React, { useState, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";


interface SpecialDeal {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  dataAiHint: string;
  href: string;
  isActive: boolean;
  isStructureType: boolean;
  volumeM3?: number;
}

type SpecialDealFormValue = string | number | boolean | undefined;


const initialDeals: SpecialDeal[] = [
  { id: 'deal1', name: 'Pre-Configured Double Garage', description: 'Our popular 2-bay garage...', price: 8500, originalPrice: 9200, image: 'https://picsum.photos/seed/deal1/100/100', dataAiHint: 'double oak frame garage sale', href: '/special-deals/double-garage', isActive: true, isStructureType: true },
  { id: 'deal2', name: 'Garden Gazebo Kit', description: 'Easy-to-assemble 3m x 3m kit...', price: 3200, originalPrice: 3500, image: 'https://picsum.photos/seed/deal2/100/100', dataAiHint: 'garden gazebo kit wood offer', href: '/special-deals/gazebo-kit', isActive: true, isStructureType: true },
  { id: 'deal3', name: 'Rustic Oak Beam Bundle', description: 'Selection of 3 reclaimed beams...', price: 450, image: 'https://picsum.photos/seed/deal3/100/100', dataAiHint: 'rustic oak beams bundle', href: '/special-deals/beam-bundle', isActive: true, isStructureType: false, volumeM3: 0.3 },
  { id: 'deal4', name: 'End-of-Line Oak Flooring (15m²)', description: '15 sq meters remaining...', price: 750, image: 'https://picsum.photos/seed/deal4/100/100', dataAiHint: 'oak flooring discount lot', href: '/special-deals/flooring-lot', isActive: false, isStructureType: false, volumeM3: 0.3 },
];

export default function SpecialDealsPage() {
  const [deals, setDeals] = useState<SpecialDeal[]>(initialDeals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<SpecialDeal | null>(null);
  const [formState, setFormState] = useState<Partial<SpecialDeal>>({ isActive: true, isStructureType: true });

  const handleFormChange = (field: keyof SpecialDeal, value: SpecialDealFormValue) => {
     if (field === 'isActive' || field === 'isStructureType') {
         setFormState(prev => ({ ...prev, [field]: value as boolean }));
     } else if (field === 'price' || field === 'originalPrice' || field === 'volumeM3') {
         const numValue = value === '' || value === undefined ? undefined : parseFloat(String(value));
         setFormState(prev => ({ ...prev, [field]: numValue }));
     } else {
         setFormState(prev => ({ ...prev, [field]: value as string })); 
     }
  };

  const handleSaveDeal = (event: FormEvent) => { 
    event.preventDefault();
    if (!formState.name || !formState.description || !formState.price || formState.price <= 0 || !formState.href || !formState.image || !formState.dataAiHint) {
        alert("Please fill in all required fields (Name, Description, Price, Href, Image URL, AI Hint).");
        return;
    }
    if (!formState.isStructureType && (!formState.volumeM3 || formState.volumeM3 <= 0)) {
         alert("Please provide a valid positive Volume (m³) for Beam/Flooring type deals.");
         return;
    }

    const newDealData: SpecialDeal = {
        id: editingDeal?.id ?? `deal${Date.now()}`,
        name: formState.name!,
        description: formState.description!,
        price: formState.price!,
        originalPrice: formState.originalPrice,
        image: formState.image!,
        dataAiHint: formState.dataAiHint!,
        href: formState.href!,
        isActive: formState.isActive ?? true,
        isStructureType: formState.isStructureType ?? true,
        volumeM3: formState.isStructureType ? undefined : formState.volumeM3,
    };

    if (editingDeal) {
        setDeals(prev => prev.map(d => d.id === editingDeal.id ? newDealData : d));
        console.log("Updated Deal:", newDealData);
    } else {
        setDeals(prev => [...prev, newDealData]);
        console.log("Added Deal:", newDealData);
    }
    closeDialog();
  };

   const openAddDialog = () => {
    setEditingDeal(null);
    setFormState({ isActive: true, isStructureType: true, price: undefined, originalPrice: undefined, volumeM3: undefined });
    setIsDialogOpen(true);
  };

   const openEditDialog = (deal: SpecialDeal) => {
    setEditingDeal(deal);
    setFormState(deal);
    setIsDialogOpen(true);
  };

  const handleDeleteDeal = (id: string) => {
     if (window.confirm("Are you sure you want to delete this special deal?")) {
        setDeals(prev => prev.filter(d => d.id !== id));
        console.log("Deleted Deal ID:", id);
     }
  };

  const closeDialog = () => {
     setIsDialogOpen(false);
     setEditingDeal(null);
     setFormState({});
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Manage Special Deals</CardTitle>
          <CardDescription>
            Create, edit, or remove limited-time offers and pre-configured items.
          </CardDescription>
        </div>
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm" onClick={openAddDialog}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Special Deal
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                 <DialogHeader>
                    <DialogTitle>{editingDeal ? 'Edit' : 'Add'} Special Deal</DialogTitle>
                 </DialogHeader>
                  <form onSubmit={handleSaveDeal} id="dealForm" className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                      <div className="space-y-2">
                         <Label htmlFor="name">Deal Name <span className="text-destructive">*</span></Label>
                         <Input id="name" value={formState.name ?? ''} onChange={(e) => handleFormChange('name', e.target.value)} required />
                      </div>
                       <div className="space-y-2">
                         <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                         <Textarea id="description" value={formState.description ?? ''} onChange={(e) => handleFormChange('description', e.target.value)} required />
                      </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                             <Label htmlFor="price">Deal Price (£) <span className="text-destructive">*</span></Label>
                             <Input id="price" type="number" step="0.01" min="0.01" value={formState.price ?? ''} onChange={(e) => handleFormChange('price', e.target.value)} required />
                         </div>
                         <div className="space-y-2">
                             <Label htmlFor="originalPrice">Original Price (£) (Optional)</Label>
                             <Input id="originalPrice" type="number" step="0.01" min="0" placeholder="e.g., 9200.00" value={formState.originalPrice ?? ''} onChange={(e) => handleFormChange('originalPrice', e.target.value)} />
                         </div>
                       </div>
                        <div className="space-y-2">
                         <Label htmlFor="image">Image URL <span className="text-destructive">*</span></Label>
                         <Input id="image" placeholder="https://example.com/image.jpg or /images/deal.jpg" value={formState.image ?? ''} onChange={(e) => handleFormChange('image', e.target.value)} required />
                      </div>
                       <div className="space-y-2">
                         <Label htmlFor="dataAiHint">Image AI Hint <span className="text-destructive">*</span></Label>
                         <Input id="dataAiHint" placeholder="e.g., double oak garage" value={formState.dataAiHint ?? ''} onChange={(e) => handleFormChange('dataAiHint', e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                         <Label htmlFor="href">Link Href <span className="text-destructive">*</span></Label>
                         <Input id="href" placeholder="/special-deals/your-deal-slug" value={formState.href ?? ''} onChange={(e) => handleFormChange('href', e.target.value)} required />
                      </div>

                     <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between pt-4 border-t mt-4">
                        <div className="flex items-center space-x-2">
                             <Switch
                                id="isStructureType"
                                checked={formState.isStructureType ?? true}
                                onCheckedChange={(checked) => handleFormChange('isStructureType', checked)}
                              />
                             <Label htmlFor="isStructureType">Shipping Included? (Garage/Gazebo/Porch Type)</Label>
                         </div>
                         <div className="space-y-2 flex-grow sm:max-w-[150px]">
                             <Label htmlFor="volumeM3" className={formState.isStructureType ? 'text-muted-foreground' : ''}>Volume (m³) (if not included)</Label>
                             <Input
                                id="volumeM3"
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="e.g., 0.3"
                                value={formState.volumeM3 ?? ''}
                                onChange={(e) => handleFormChange('volumeM3', e.target.value)}
                                disabled={formState.isStructureType}
                                required={!formState.isStructureType}
                                className={formState.isStructureType ? 'bg-muted/50' : ''}
                             />
                          </div>
                      </div>

                       <div className="flex items-center space-x-2 pt-4 border-t mt-4">
                         <Switch
                            id="isActive"
                            checked={formState.isActive ?? true}
                            onCheckedChange={(checked) => handleFormChange('isActive', checked)}
                          />
                         <Label htmlFor="isActive">Activate Deal (Visible on site?)</Label>
                      </div>
                  </form>
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" form="dealForm">
                        {editingDeal ? 'Save Changes' : 'Add Deal'}
                    </Button>
                 </DialogFooter>
             </DialogContent>
         </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price (£)</TableHead>
               <TableHead className="text-center">Status</TableHead>
               <TableHead className="text-center">Shipping Calc</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.length > 0 ? (
              deals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell>
                     <Image src={deal.image} alt={deal.name} width={60} height={60} className="rounded-md object-cover aspect-square bg-muted" data-ai-hint={deal.dataAiHint}/>
                  </TableCell>
                  <TableCell className="font-medium">{deal.name}</TableCell>
                   <TableCell className="text-right">
                      {deal.price.toFixed(2)}
                      {deal.originalPrice && <span className="ml-2 text-xs text-muted-foreground line-through">{deal.originalPrice.toFixed(2)}</span>}
                   </TableCell>
                  <TableCell className="text-center">
                      <Badge variant={deal.isActive ? "secondary" : "outline"}>{deal.isActive ? 'Active' : 'Inactive'}</Badge>
                  </TableCell>
                   <TableCell className="text-center text-xs text-muted-foreground">
                       {deal.isStructureType ? 'Included' : `Volume: ${deal.volumeM3 ?? 'N/A'}m³`}
                   </TableCell>
                  <TableCell className="text-right">
                     <Button variant="ghost" size="icon" className="h-8 w-8 mr-1" onClick={() => openEditDialog(deal)}>
                        <Edit className="h-4 w-4"/>
                         <span className="sr-only">Edit</span>
                     </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteDeal(deal.id)}>
                         <Trash2 className="h-4 w-4"/>
                         <span className="sr-only">Delete</span>
                     </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No special deals created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
