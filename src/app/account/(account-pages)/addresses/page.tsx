"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { getUserAddresses } from "./actions";
import type { Address } from "./actions";

export default function AddressesPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user addresses when component mounts
  useEffect(() => {
    const loadAddresses = async () => {
      if (!currentUser) return;

      setIsLoading(true);
      try {
        const userAddresses = await getUserAddresses(currentUser.uid);
        setAddresses(userAddresses);
        console.log("Loaded addresses:", userAddresses);
      } catch (error) {
        console.error("Error loading addresses:", error);
        toast({
          variant: "destructive",
          title: "Error loading addresses",
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAddresses();
  }, [currentUser, toast]);

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Addresses</CardTitle>
          <CardDescription>
            Your saved addresses are displayed below.
            <span className="block mt-1 text-xs text-green-600">
              Debug note: This is a partially restored version.
            </span>
          </CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => alert("Add Address will be implemented soon")}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">
              You haven't saved any addresses yet.
            </p>
            <Button
              onClick={() => alert("Add Address will be implemented soon")}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add your first address
            </Button>
          </div>
        ) : (
          addresses.map((address, index) => (
            <div key={address.id}>
              {index > 0 && <Separator className="my-4 border-border/50" />}
              <div className="flex flex-col sm:flex-row justify-between">
                <div className="mb-4 sm:mb-0">
                  <p className="font-medium flex items-center gap-2">
                    {address.type} Address
                    {address.isDefault && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        (Default)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.line1}
                  </p>
                  {address.line2 && (
                    <p className="text-sm text-muted-foreground">
                      {address.line2}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {address.town}
                    {address.county && `, ${address.county}`}
                    {`, ${address.postcode}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.country}
                  </p>
                </div>
                <div className="flex space-x-2 self-start sm:self-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => alert(`Edit address ${address.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit Address</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => alert(`Delete address ${address.id}`)}
                  >
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
