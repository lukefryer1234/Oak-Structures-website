"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // For isDefault if directly managed, or for other boolean inputs
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // For AddressType
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, PlusCircle, Edit, Trash2, Star, ShieldCheck, Truck } from 'lucide-react';

import { useUserAddresses } from '@/hooks/user-addresses/useUserAddresses';
import { useAddUserAddress } from '@/hooks/user-addresses/useAddUserAddress';
import { useUpdateUserAddress } from '@/hooks/user-addresses/useUpdateUserAddress';
import { useDeleteUserAddress } from '@/hooks/user-addresses/useDeleteUserAddress';
import { useSetDefaultAddress } from '@/hooks/user-addresses/useSetDefaultAddress';

import { type Address, CreateAddressDataSchema, UpdateAddressDataSchema, AddressTypeSchema, type AddressType } from '@/services/domain/user-service';
import { useToast } from '@/hooks/use-toast';

// Form schema based on CreateAddressDataSchema, but allow isDefault to be optional for edit.
// For creation, isDefault might be set directly. For updates, it's often handled by a separate "Set as Default" action.
const addressFormSchema = z.object({
  type: AddressTypeSchema,
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
  town: z.string().min(1, "Town/City is required"),
  county: z.string().optional(),
  postcode: z.string().min(1, "Postcode is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false).optional(), // isDefault is more complex, usually set via specific action
});
type AddressFormData = z.infer<typeof addressFormSchema>;

export default function AddressesPage() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  const { toast } = useToast();

  const { data: addressesData, isLoading: isLoadingAddresses, isError, error } = useUserAddresses(userId);
  const addresses = addressesData || [];

  const { mutate: addAddress, isLoading: isAddingAddress } = useAddUserAddress(userId);
  const { mutate: updateAddress, isLoading: isUpdatingAddress } = useUpdateUserAddress(userId);
  const { mutate: deleteAddress, isLoading: isDeletingAddress } = useDeleteUserAddress(userId);
  const { mutate: setDefaultAddress, isLoading: isSettingDefault } = useSetDefaultAddress(userId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      type: "Shipping",
      firstName: "",
      lastName: "",
      addressLine1: "",
      addressLine2: "",
      town: "",
      county: "",
      postcode: "",
      country: "United Kingdom", // Sensible default
      phone: "",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (editingAddress) {
      form.reset({
        ...editingAddress,
        isDefault: editingAddress.isDefault || false, // Ensure isDefault is boolean
      });
    } else {
      form.reset(form.formState.defaultValues);
    }
  }, [editingAddress, form, isDialogOpen]);


  const openAddDialog = () => {
    setEditingAddress(null);
    // form.reset is handled by useEffect
    setIsDialogOpen(true);
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    // form.reset is handled by useEffect
    setIsDialogOpen(true);
  };

  const onSubmit = (data: AddressFormData) => {
    if (!userId) return;

    const submissionData = { ...data };
    // The `isDefault` from the form is tricky.
    // If `isDefault` is true in the form, and it's a new address, addUserAddress handles it.
    // If `isDefault` is true for an update, updateUserAddress handles it.
    // However, it's usually better to have a separate "Set as Default" button.
    // For this form, we'll pass `isDefault` as is. The service methods should handle the logic.

    if (editingAddress) {
      // Ensure all fields are passed for update, even if not changed by form directly
      const updatePayload: z.infer<typeof UpdateAddressDataSchema> = {
        ...data,
        // type: data.type, // type should be included if it can be changed
      };
      updateAddress({ addressId: editingAddress.id, addressData: updatePayload }, {
        onSuccess: () => setIsDialogOpen(false),
      });
    } else {
      addAddress(submissionData as CreateAddressData, { // CreateAddressData includes isDefault
        onSuccess: () => setIsDialogOpen(false),
      });
    }
  };

  const handleDelete = (addressId: string) => {
    if (!userId) return;
    // Consider adding a confirmation dialog here
    deleteAddress(addressId);
  };

  const handleSetDefault = (addressId: string) => {
    if (!userId) return;
    setDefaultAddress(addressId);
  };

  if (isLoadingAddresses) {
    return <div className="flex justify-center items-center h-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (isError && error) {
    return <div className="text-destructive p-4">Error loading addresses: {error.message}</div>;
  }

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Addresses</CardTitle>
          <CardDescription>Add, edit, or remove your saved addresses.</CardDescription>
        </div>
        <Button onClick={openAddDialog} size="sm" disabled={isAddingAddress || isUpdatingAddress}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {addresses.length === 0 ? (
          <p className="text-muted-foreground">You haven't saved any addresses yet.</p>
        ) : (
          addresses.map((address, index) => (
            <div key={address.id}>
              {index > 0 && <Separator className="my-4 border-border/50"/>}
              <div className="flex flex-col sm:flex-row justify-between">
                <div className="mb-4 sm:mb-0">
                  <p className="font-medium flex items-center gap-2">
                    {address.type === "Billing" && <ShieldCheck className="h-5 w-5 text-blue-500" />}
                    {address.type === "Shipping" && <Truck className="h-5 w-5 text-green-500" />}
                    {address.type === "Both" && <><ShieldCheck className="h-5 w-5 text-blue-500" /><Truck className="h-5 w-5 text-green-500" /></>}
                    {address.type} Address
                    {address.isDefault && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"><Star className="h-3 w-3 mr-1" />Default</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">{address.firstName} {address.lastName}</p>
                  <p className="text-sm text-muted-foreground">{address.addressLine1}</p>
                  {address.addressLine2 && <p className="text-sm text-muted-foreground">{address.addressLine2}</p>}
                  <p className="text-sm text-muted-foreground">{address.town}, {address.postcode}</p>
                  <p className="text-sm text-muted-foreground">{address.county}</p>
                  <p className="text-sm text-muted-foreground">{address.country}</p>
                  {address.phone && <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>}
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 self-start sm:self-center">
                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      disabled={isSettingDefault || isAddingAddress || isUpdatingAddress || isDeletingAddress}
                      className="flex items-center"
                    >
                      {isSettingDefault ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Star className="mr-2 h-4 w-4" />} Set as Default
                    </Button>
                  )}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditDialog(address)} disabled={isAddingAddress || isUpdatingAddress || isDeletingAddress}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit Address</span>
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(address.id)} disabled={isDeletingAddress || isAddingAddress || isUpdatingAddress}>
                      {isDeletingAddress ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                      <span className="sr-only">Delete Address</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
            <DialogDescription>
              {editingAddress ? 'Update the details of your address.' : 'Enter the details for your new address.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select address type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(AddressTypeSchema.Values) as Array<keyof typeof AddressTypeSchema.Values>).map((type) => (
                          <SelectItem key={type} value={AddressTypeSchema.Values[type]}>
                            {AddressTypeSchema.Values[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem> <FormLabel>First Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>
                )}/>
                <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem> <FormLabel>Last Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>
                )}/>
              </div>
              <FormField control={form.control} name="addressLine1" render={({ field }) => (
                  <FormItem> <FormLabel>Address Line 1</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>
              )}/>
              <FormField control={form.control} name="addressLine2" render={({ field }) => (
                  <FormItem> <FormLabel>Address Line 2 (Optional)</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>
              )}/>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="town" render={({ field }) => (
                    <FormItem> <FormLabel>Town/City</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>
                )}/>
                <FormField control={form.control} name="county" render={({ field }) => (
                    <FormItem> <FormLabel>County (Optional)</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>
                )}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="postcode" render={({ field }) => (
                    <FormItem> <FormLabel>Postcode</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>
                )}/>
                <FormField control={form.control} name="country" render={({ field }) => (
                    <FormItem> <FormLabel>Country</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>
                )}/>
              </div>
              <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem> <FormLabel>Phone (Optional)</FormLabel> <FormControl><Input type="tel" {...field} /></FormControl> <FormMessage /> </FormItem>
              )}/>
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Set as default address
                      </FormLabel>
                      <FormDescription>
                        If checked, this address will be set as your default for the selected type.
                        Any other address of the same type previously marked as default will be updated.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isAddingAddress || isUpdatingAddress}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isAddingAddress || isUpdatingAddress || !form.formState.isDirty}>
                  {(isAddingAddress || isUpdatingAddress) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingAddress ? 'Save Changes' : 'Add Address'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
