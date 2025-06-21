"use client"; // For state management

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Loader2 } from 'lucide-react';
import { useUnitPrices, UNIT_PRICES_QUERY_KEY_PREFIX } from '@/hooks/products/useUnitPrices';
import { useUpdateUnitPrice } from '@/hooks/products/useUpdateUnitPrice';
import { type UnitPrice, type UpdateUnitPriceData } from '@/services/domain/product-service';


export default function UnitPricesPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const { data: unitPricesData, isLoading, isError, error } = useUnitPrices();
  const { mutate: updatePrice, isLoading: isUpdatingPrice } = useUpdateUnitPrice();
  const unitPrices = unitPricesData || [];

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
    if (isNaN(newPrice) || newPrice <= 0) { // Price must be positive
        // Toast is handled by the hook on error
        return;
    }
    const updateData: UpdateUnitPriceData = { price: newPrice };
    updatePrice({ unitPriceId: id, data: updateData }, {
      onSuccess: () => handleCancelEdit(), // Exit edit mode on success
      // onError, toast is handled by the hook
    });
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
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center text-red-500">Error loading unit prices: {error?.message}</TableCell></TableRow>
            ) : unitPrices.length > 0 ? (
              unitPrices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell>{price.productType}</TableCell>
                  <TableCell>{price.oakType}</TableCell>
                  <TableCell>{price.unit}</TableCell>
                  <TableCell className="text-right">
                    {editingId === price.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01" // Price must be positive
                        value={editValue}
                        onChange={handleInputChange}
                        onKeyDown={(e) => handleInputKeyDown(e, price.id)}
                        className="h-8 text-right w-24"
                        autoFocus
                        onBlur={() => handleSaveEdit(price.id)}
                      />
                    ) : (
                      <span className="font-medium">{price.price.toFixed(2)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                      {editingId === price.id ? (
                          <>
                              <Button variant="ghost" size="sm" onClick={() => handleSaveEdit(price.id)} disabled={isUpdatingPrice}>
                                {isUpdatingPrice ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isUpdatingPrice}>Cancel</Button>
                          </>
                      ) : (
                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(price)} disabled={isUpdatingPrice}>
                             <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit Price</span>
                           </Button>
                      )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No unit prices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
