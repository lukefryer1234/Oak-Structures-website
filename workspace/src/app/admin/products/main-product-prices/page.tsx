
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// --- Types ---

type ProductCategory = 'Garages' | 'Gazebos' | 'Porches';

interface ProductCombinationPrice {
  id: string;
  category: ProductCategory;
  configKey: string; // A unique string representing the specific combination of options
  configDescription: string; // Human-readable description of the configuration
  price: number; // Price for this specific configuration
}

// Placeholder data - Fetch from backend in a real application
const initialCombinationPrices: ProductCombinationPrice[] = [
  { id: 'p1', category: 'Garages', configKey: 'g_bays-2_g_catSlide-no_g_oakType-reclaimed_g_size-medium_g_trussType-curved', configDescription: 'Garages: Bays 2, Cat Slide No, Oak Type Reclaimed, Size Medium, Truss Type Curved', price: 8500 },
  { id: 'p2', category: 'Garages', configKey: 'g_bays-3_g_catSlide-yes_g_oakType-kilned_g_size-large_g_trussType-straight', configDescription: 'Garages: Bays 3, Cat Slide Yes, Oak Type Kilned, Size Large, Truss Type Straight', price: 12000 },
  { id: 'p3', category: 'Gazebos', configKey: 'gz_legType-full_gz_sizeType-4x4_gz_trussType-curved', configDescription: 'Gazebos: Leg Type Full, Size Type 4x4, Truss Type Curved', price: 3500 },
  { id: 'p4', category: 'Porches', configKey: 'p_legType-floor_p_sizeType-standard_p_trussType-curved', configDescription: 'Porches: Leg Type Floor, Size Type Standard, Truss Type Curved', price: 2150 },
];

export default function MainProductPricesPage() {
  const [prices, setPrices] = useState<ProductCombinationPrice[]>(initialCombinationPrices);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [currentEditValue, setCurrentEditValue] = useState<string>('');
  const { toast } = useToast();

  // Effect to fetch prices from backend if needed in future
  useEffect(() => {
    // Placeholder for fetching data
    // async function fetchData() {
    //   // const fetchedPrices = await fetchPricesFromBackend();
    //   // setPrices(fetchedPrices);
    // }
    // fetchData();
  }, []);

  const handleEditClick = (priceItem: ProductCombinationPrice) => {
    setEditingPriceId(priceItem.id);
    setCurrentEditValue(priceItem.price.toString());
  };

  const handlePriceInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentEditValue(event.target.value);
  };

  const handleSavePrice = (id: string) => {
    const newPrice = parseFloat(currentEditValue);
    if (isNaN(newPrice) || newPrice < 0) {
      toast({
        variant: "destructive",
        title: "Invalid Price",
        description: "Please enter a valid positive price.",
      });
      return;
    }

    setPrices(prevPrices =>
      prevPrices.map(p =>
        p.id === id ? { ...p, price: newPrice } : p
      )
    );

    // TODO: API call to update the price in the backend
    console.log(`Updated price for ${id} to ${newPrice}`);
    toast({ title: "Price Updated", description: `Price for configuration ID ${id} updated locally.` });

    setEditingPriceId(null);
    setCurrentEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingPriceId(null);
    setCurrentEditValue('');
  };
  
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (event.key === 'Enter') {
      handleSavePrice(id);
    } else if (event.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Main Product Prices (Combination Pricing)</CardTitle>
        <CardDescription>
          Edit prices for specific predefined combinations of Garage, Gazebo, and Porch options.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Configuration Description</TableHead>
              <TableHead className="text-right">Price (£)</TableHead>
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices.length > 0 ? (
              prices.map((priceItem) => (
                <TableRow key={priceItem.id}>
                  <TableCell>{priceItem.category}</TableCell>
                  <TableCell>
                    <span title={priceItem.configKey} className="cursor-help">{priceItem.configDescription}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {editingPriceId === priceItem.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={currentEditValue}
                        onChange={handlePriceInputChange}
                        onKeyDown={(e) => handleInputKeyDown(e, priceItem.id)}
                        className="h-8 text-right w-28 bg-background"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium">{priceItem.price.toFixed(2)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingPriceId === priceItem.id ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleSavePrice(priceItem.id)} className="mr-1">Save</Button>
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(priceItem)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Price</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No main product prices set up yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
