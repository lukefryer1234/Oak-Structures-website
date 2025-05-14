"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useSafeQuery, useSafeMutation } from "@/hooks/use-safe-query";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { DeliverySettings } from "@/services/domain/settings-service";

export default function DeliverySettingsPageWrapper() {
  return (
    <ErrorBoundary>
      <DeliverySettingsPage />
    </ErrorBoundary>
  );
}

function DeliverySettingsPage() {
  const { toast } = useToast();
  
  // Use React Query to fetch delivery settings
  const { 
    data: settings, 
    isLoading,
    error,
    refetch
  } = useSafeQuery<DeliverySettings>(
    ['delivery-settings'],
    async () => {
      const response = await fetch('/api/settings/delivery');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch delivery settings');
      }
      const data = await response.json();
      return data.data;
    },
    {
      context: 'fetching delivery settings',
      showErrorToast: true,
      queryOptions: {
        staleTime: 300000, // 5 minutes
        retry: 2
      }
    }
  );
  
  // Create local state to track form values
  const [formValues, setFormValues] = useState<DeliverySettings | null>(null);

  // Initialize form values when settings are loaded
  React.useEffect(() => {
    if (settings) {
      setFormValues(settings);
    }
  }, [settings]);
  
  // Handle input changes
  const handleInputChange = (field: keyof DeliverySettings, value: string) => {
    if (formValues) {
      const numValue = parseFloat(value);
      setFormValues({ 
        ...formValues, 
        [field]: isNaN(numValue) ? 0 : numValue 
      });
    }
  };

  // Use React Query mutation for updating settings
  const updateSettingsMutation = useSafeMutation(
    async (data: DeliverySettings) => {
      const response = await fetch('/api/settings/delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update delivery settings');
      }
      
      return await response.json();
    },
    {
      context: 'updating delivery settings',
      showErrorToast: true,
      showSuccessToast: true,
      successToastTitle: 'Settings Saved',
      successToastMessage: 'Delivery settings updated successfully',
      errorToastTitle: 'Save Failed',
      mutationOptions: {
        onSuccess: () => {
          // Invalidate and refetch settings after successful update
          refetch();
        }
      }
    }
  );
  
  // Handle save button click
  const handleSave = () => {
    if (!formValues) return;
    
    // Client-side validation
    if (
      formValues.freeDeliveryThreshold < 0 ||
      formValues.ratePerM3 < 0 ||
      formValues.minimumDeliveryCharge < 0
    ) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "All delivery cost fields must be zero or positive.",
      });
      return;
    }
    
    // Execute the mutation
    updateSettingsMutation.mutate(formValues);
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Delivery Settings</CardTitle>
          <CardDescription>
            Configure rules for calculating delivery costs.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Show error state with retry button
  if (error || !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error Loading Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {error ? error.message : "Failed to load delivery settings."}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // If form values not set yet, also show loading
  if (!formValues) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Settings</CardTitle>
        <CardDescription>
          Configure the rules for calculating delivery costs, primarily for Oak
          Beams and Oak Flooring. (Note: Delivery for Garages, Gazebos, Porches
          is typically included in their price).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 max-w-md">
          <Label htmlFor="free-threshold">
            Free Delivery Threshold (£){" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="free-threshold"
            type="number"
            step="0.01"
            min="0"
            value={formValues.freeDeliveryThreshold}
            onChange={(e) =>
              handleInputChange("freeDeliveryThreshold", e.target.value)
            }
            placeholder="e.g., 1000"
            disabled={updateSettingsMutation.isPending}
            required
          />
          <p className="text-xs text-muted-foreground">
            Basket value (excl. VAT) above which Beam/Flooring delivery becomes
            free.
          </p>
        </div>

        <div className="space-y-2 max-w-md">
          <Label htmlFor="rate-m3">
            Rate per m³ (£) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="rate-m3"
            type="number"
            step="0.01"
            min="0"
            value={formValues.ratePerM3}
            onChange={(e) => handleInputChange("ratePerM3", e.target.value)}
            placeholder="e.g., 50"
            disabled={updateSettingsMutation.isPending}
            required
          />
          <p className="text-xs text-muted-foreground">
            Cost applied per cubic meter for Beam/Flooring orders below the
            threshold.
          </p>
        </div>

        <div className="space-y-2 max-w-md">
          <Label htmlFor="min-charge">
            Minimum Delivery Charge (£){" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="min-charge"
            type="number"
            step="0.01"
            min="0"
            value={formValues.minimumDeliveryCharge}
            onChange={(e) =>
              handleInputChange("minimumDeliveryCharge", e.target.value)
            }
            placeholder="e.g., 25"
            disabled={updateSettingsMutation.isPending}
            required
          />
          <p className="text-xs text-muted-foreground">
            Minimum charge applied if the calculated volume cost is lower and
            free delivery threshold isn't met.
          </p>
        </div>

        <div className="flex justify-end pt-4 border-t border-border/50">
          <Button 
            onClick={handleSave} 
            disabled={updateSettingsMutation.isPending || isLoading}
          >
            {updateSettingsMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {updateSettingsMutation.isPending ? "Saving..." : "Save Delivery Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
