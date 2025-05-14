"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  fetchFinancialSettingsAction,
  updateFinancialSettingsAction,
  type FinancialSettings,
} from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Custom hook for financial settings using React Query
function useFinancialSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for fetching financial settings
  const {
    data: settings,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["financial-settings"],
    queryFn: async () => {
      try {
        return await fetchFinancialSettingsAction();
      } catch (err) {
        console.error("Error fetching financial settings:", err);
        throw new Error("Failed to load financial settings");
      }
    },
  });

  // Mutation for updating financial settings
  const { mutate: updateSettings, isPending: isSaving } = useMutation({
    mutationFn: async (updatedSettings: FinancialSettings) => {
      return await updateFinancialSettingsAction(updatedSettings);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Financial settings updated successfully",
        });
        // Invalidate the query to refetch the latest data
        queryClient.invalidateQueries({ queryKey: ["financial-settings"] });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            result.message +
            (result.errors
              ? ` Details: ${result.errors.map((e) => e.message).join(", ")}`
              : ""),
        });
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update financial settings",
      });
      console.error("Error updating financial settings:", error);
    },
  });

  return {
    settings,
    isLoading,
    isError,
    error,
    refetch,
    updateSettings,
    isSaving,
  };
}

export default function FinancialSettingsPage() {
  const { settings, isLoading, isError, error, updateSettings, isSaving } = useFinancialSettings();
  const [formData, setFormData] = useState<FinancialSettings | null>(null);
  const { toast } = useToast();

  // Initialize form data when settings are loaded
  React.useEffect(() => {
    if (settings && !formData) {
      setFormData(settings);
    }
  }, [settings, formData]);

  const handleInputChange = (field: keyof FinancialSettings, value: string) => {
    if (formData) {
      if (field === "vatRate") {
        const rate = parseFloat(value);
        setFormData({ ...formData, [field]: isNaN(rate) ? 0 : rate });
      } else {
        setFormData({ ...formData, [field]: value });
      }
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    if (!formData.currencySymbol || formData.vatRate < 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description:
          "Please ensure Currency Symbol is set and VAT Rate is not negative.",
      });
      return;
    }

    // Submit the form data using the mutation
    updateSettings(formData);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Settings</CardTitle>
          <CardDescription>
            Configure currency and tax settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError || !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Settings</CardTitle>
          <CardDescription>
            Configure currency and tax settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load financial settings"}
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Settings</CardTitle>
        <CardDescription>
          Configure the currency symbol and VAT rate used throughout the store.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="currency-symbol">
            Currency Symbol <span className="text-destructive">*</span>
          </Label>
          <Input
            id="currency-symbol"
            value={formData?.currencySymbol || ""}
            onChange={(e) =>
              handleInputChange("currencySymbol", e.target.value)
            }
            maxLength={3}
            disabled={isSaving}
            required
          />
          <p className="text-xs text-muted-foreground">
            Typically '£' for GBP.
          </p>
        </div>

        <div className="space-y-2 max-w-xs">
          <Label htmlFor="vat-rate">
            VAT Rate (%) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="vat-rate"
            type="number"
            step="0.01"
            min="0"
            value={formData?.vatRate || 0}
            onChange={(e) => handleInputChange("vatRate", e.target.value)}
            placeholder="e.g., 20"
            disabled={isSaving}
            required
          />
          <p className="text-xs text-muted-foreground">
            Enter the standard VAT rate as a percentage (e.g., 20 for 20%).
          </p>
        </div>

