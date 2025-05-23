
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

// Placeholder data - fetch user's saved addresses
const addresses = [
  { id: 'addr1', type: 'Billing', isDefault: true, line1: '123 Timber Street', town: 'London', postcode: 'SW1A 0AA' },
  { id: 'addr2', type: 'Shipping', isDefault: false, line1: '45 Oak Avenue', town: 'Manchester', postcode: 'M1 1AA' },
];

export default function AddressesPage() {

  const handleEditAddress = (id: string) => {
      // TODO: Implement edit address modal/page
      alert(`Edit address ${id} clicked (placeholder)`);
  };

  const handleDeleteAddress = (id: string) => {
       // TODO: Implement delete address confirmation and logic
       alert(`Delete address ${id} clicked (placeholder)`);
  };

    const handleAddAddress = () => {
       // TODO: Implement add address modal/page
       alert(`Add new address clicked (placeholder)`);
  };


  return (
    // Card styling is inherited from layout, only need header/content adjustments if necessary
    <>
      <CardHeader className="flex flex-row items-center justify-between">
         <div>
            <CardTitle>Manage Addresses</CardTitle>
            <CardDescription>Add, edit, or remove your saved addresses.</CardDescription>
         </div>
         <Button onClick={handleAddAddress} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
         </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {addresses.length === 0 ? (
          <p className="text-muted-foreground">You haven't saved any addresses yet.</p>
        ) : (
          addresses.map((address, index) => (
            <div key={address.id}>
              {index > 0 && <Separator className="my-4 border-border/50"/>} {/* Lighter separator */}
              <div className="flex flex-col sm:flex-row justify-between">
                  <div className="mb-4 sm:mb-0">
                     <p className="font-medium flex items-center gap-2">
                        {address.type} Address
                        {address.isDefault && <span className="text-xs text-muted-foreground">(Default)</span>}
                     </p>
                     <p className="text-sm text-muted-foreground">{address.line1}</p>
                     {/* Add line 2 etc. if present */}
                     <p className="text-sm text-muted-foreground">{address.town}, {address.postcode}</p>
                  </div>
                  <div className="flex space-x-2 self-start sm:self-center">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEditAddress(address.id)}>
                      <Edit className="h-4 w-4" />
                       <span className="sr-only">Edit Address</span>
                    </Button>
                     <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteAddress(address.id)}>
                       <Trash2 className="h-4 w-4" />
                       <span className="sr-only">Delete Address</span>
                    </Button>
                  </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </>
  );
}
