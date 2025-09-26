
"use client"; // For state management

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label"; // Removed unused import
import { Edit } from 'lucide-react';

// --- Types and Placeholder Data ---

type ProductType = 'Oak Beams' | 'Oak Flooring';
type OakType = 'Reclaimed Oak' | 'Kilned Dried Oak' | 'Green Oak';

interface UnitPrice {
  id: string; // e.g., 'beams-reclaimed', 'flooring-kilned'
  productType: ProductType;
  oakType: OakType;
  unit: 'per m³' | 'per m²';
  price: number;
}

// Placeholder data - Fetch from backend
const initialUnitPrices: UnitPrice[] = [
  { id: 'beams-reclaimed', productType: 'Oak Beams', oakType: 'Reclaimed Oak', unit: 'per m³', price: 1200 },
  { id: 'beams-kilned', productType: 'Oak Beams', oakType: 'Kilned Dried Oak', unit: 'per m³', price: 1000 },
  { id: 'beams-green', productType: 'Oak Beams', oakType: 'Green Oak', unit: 'per m³', price: 800 },
  { id: 'flooring-reclaimed', productType: 'Oak Flooring', oakType: 'Reclaimed Oak', unit: 'per m²', price: 90 },
  { id: 'flooring-kilned', productType: 'Oak Flooring', oakType: 'Kilned Dried Oak', unit: 'per m²', price: 75 },
];

export default function UnitPricesPage() {
  const [unitPrices, setUnitPrices] = useState<UnitPrice[]>(initialUnitPrices);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleEditClick = (price: UnitPrice) => {
    setEditingId(price.id);
    setEditValue(price.price.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = (id: string) => {
    const newPrice = parseFloat(editValue);
    if (isNaN(newPrice) || newPrice < 0) {
        alert("Please enter a valid positive price."); // Use toast in real app
        return;
    }

    setUnitPrices(prev =>
      prev.map(p => (p.id === id ? { ...p, price: newPrice } : p))
    );

    // TODO: API call to update the price in the backend
    console.log(`Updated price for ${id} to ${newPrice}`);

    handleCancelEdit(); // Exit edit mode
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(event.target.value);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, id: string) => {
     if (event.key === 'Enter') {
        handleSaveEdit(id);
     } else if (event.key === 'Escape') {
        handleCancelEdit();
     }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Prices</CardTitle>
        <CardDescription>
          Set the base price per cubic meter (m³) for Oak Beams and per square meter (m²) for Oak Flooring, based on the type of oak.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Type</TableHead>
              <TableHead>Oak Type</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Price (£)</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unitPrices.map((price) => (
              <TableRow key={price.id}>
                <TableCell>{price.productType}</TableCell>
                <TableCell>{price.oakType}</TableCell>
                <TableCell>{price.unit}</TableCell>
                <TableCell className="text-right">
                  {editingId === price.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editValue}
                      onChange={handleInputChange}
                       onKeyDown={(e) => handleInputKeyDown(e, price.id)}
                      className="h-8 text-right w-24"
                      autoFocus
                      onBlur={() => handleSaveEdit(price.id)} // Save on blur
                    />
                  ) : (
                    <span className="font-medium">{price.price.toFixed(2)}</span>
                  )}
                </TableCell>
                 <TableCell className="text-right">
                    {editingId === price.id ? (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => handleSaveEdit(price.id)}>Save</Button>
                            <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                        </>
                    ) : (
                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(price)}>
                           <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit Price</span>
                         </Button>
                    )}

                 </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
