"use client";

import React, { useState, useEffect } from "react";
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
import { Loader2, Eye, EyeOff, AlertCircle, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { PaymentSettings } from "@/services/domain/settings-service";
import { useSafeQuery, useSafeMutation } from "@/hooks/use-safe-query";
import { ErrorBoundary } from "@/components/error/error-boundary";

export default function PaymentSettingsPageWrapper() {
  // Wrap the actual component in an error boundary
  return (
    <ErrorBoundary>
      <PaymentSettingsPage />
    </ErrorBoundary>
  );
}

function PaymentSettingsPage() {
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);
  const { toast } = useToast();
  
  // Use React Query to fetch payment settings
  const { 
    data: settings, 
    isLoading, 
    error, 
    refetch 
  } = useSafeQuery<PaymentSettings>(
    ['payment-settings'],
    async () => {
      const response = await fetch('/api/settings/payments');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch payment settings');
      }
      const data = await response.json();
      return data.data;
    },
    {
      context: 'Fetching payment settings',
      showErrorToast: true,
      toastTitle: 'Error Loading Settings',
      queryOptions: {
        staleTime: 60 * 1000, // 1 minute
        retry: 2,
      }
    }
  );
  
  // Create a mutation for updating payment settings
  const updateSettingsMutation = useSafeMutation<PaymentSettings, Error, PaymentSettings>(
    async (updatedSettings) => {
      const response = await fetch('/api/settings/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update payment settings');
      }
      
      return result.data;
    },
    {
      context: 'Updating payment settings',
      showErrorToast: true,
      showSuccessToast: true,
      errorToastTitle: 'Update Failed',
      successToastTitle: 'Settings Updated',
      successToastMessage: 'Payment settings have been updated successfully.',
      mutationOptions: {
        // After success or failure, invalidate the query to refetch
        onSettled: () => {
          refetch();
        },
      }
    }
  );
  
  // Form state to track changes
  const [formData, setFormData] = useState<PaymentSettings | null>(null);
  
  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);
  
  // Handle form input changes
  const handleInputChange = (
    field: keyof PaymentSettings,
    value: string | boolean,
  ) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };
  
  // Handle form submission
  const handleSave = () => {
    if (!formData) return;
    
    // Client-side validation
    if (
      formData.stripeEnabled &&
      (!formData.stripePublishableKey || !formData.stripeSecretKey)
    ) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Stripe is enabled but keys are missing.",
      });
      return;
    }
    
    if (
      formData.paypalEnabled &&
      (!formData.paypalClientId || !formData.paypalClientSecret)
    ) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "PayPal is enabled but credentials are missing.",
      });
      return;
    }
    
    // Submit the form data
    updateSettingsMutation.mutate(formData);
  };

  // Error state
  if (error) {
    return (
      <Card className="border-destructive/20">
        <CardHeader className="bg-destructive/5">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Error Loading Settings</span>
          </CardTitle>
          <CardDescription>
            We encountered a problem loading the payment settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
        </CardContent>
        <CardContent className="flex justify-end pt-0">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Loading state
  if (isLoading || !settings || !formData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Stripe Settings</CardTitle>
              <CardDescription>
                Configure Stripe for card payments.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="stripe-enabled"
                checked={formData.stripeEnabled}
                onCheckedChange={(checked) =>
                  handleInputChange("stripeEnabled", checked)
                }
                disabled={updateSettingsMutation.isPending}
              />
              <Label htmlFor="stripe-enabled">Enable Stripe</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent
          className={`space-y-4 ${!formData.stripeEnabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div className="space-y-2">
            <Label htmlFor="stripe-pk">
              Publishable Key <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stripe-pk"
              value={formData.stripePublishableKey || ''}
              onChange={(e) =>
                handleInputChange("stripePublishableKey", e.target.value)
              }
              placeholder="pk_test_..."
              disabled={updateSettingsMutation.isPending || !formData.stripeEnabled}
              required={formData.stripeEnabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stripe-sk">
              Secret Key <span className="text-destructive">*</span>{" "}
              <span className="text-xs text-muted-foreground">
                (Keep Secure)
              </span>
            </Label>
            <div className="relative">
              <Input
                id="stripe-sk"
                type={showStripeSecret ? "text" : "password"}
                value={formData.stripeSecretKey || ''}
                onChange={(e) =>
                  handleInputChange("stripeSecretKey", e.target.value)
                }
                placeholder="sk_test_..."
                disabled={updateSettingsMutation.isPending || !formData.stripeEnabled}
                required={formData.stripeEnabled}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7"
                onClick={() => setShowStripeSecret(!showStripeSecret)}
                disabled={updateSettingsMutation.isPending || !formData.stripeEnabled}
              >
                {showStripeSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showStripeSecret ? "Hide" : "Show"} secret key
                </span>
              </Button>
            </div>
            <p className="text-xs text-destructive">
              Warning: Handle secret keys with extreme care. Do not expose
              client-side.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>PayPal Settings</CardTitle>
              <CardDescription>Configure PayPal checkout.</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="paypal-enabled"
                checked={formData.paypalEnabled}
                onCheckedChange={(checked) =>
                  handleInputChange("paypalEnabled", checked)
                }
                disabled={updateSettingsMutation.isPending}
              />
              <Label htmlFor="paypal-enabled">Enable PayPal</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent
          className={`space-y-4 ${!formData.paypalEnabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div className="flex items-center space-x-2">
            <Switch
              id="paypal-sandbox"
              checked={formData.paypalSandboxMode}
              onCheckedChange={(checked) =>
                handleInputChange("paypalSandboxMode", checked)
              }
              disabled={updateSettingsMutation.isPending || !formData.paypalEnabled}
            />
            <Label htmlFor="paypal-sandbox">Enable Sandbox Mode</Label>
            <span className="text-xs text-muted-foreground">
              (Use PayPal's testing environment)
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paypal-client-id">
              Client ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="paypal-client-id"
              value={formData.paypalClientId || ''}
              onChange={(e) =>
                handleInputChange("paypalClientId", e.target.value)
              }
              placeholder="PayPal Client ID..."
              disabled={updateSettingsMutation.isPending || !formData.paypalEnabled}
              required={formData.paypalEnabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paypal-secret">
              Client Secret <span className="text-destructive">*</span>{" "}
              <span className="text-xs text-muted-foreground">
                (Keep Secure)
              </span>
            </Label>
            <div className="relative">
              <Input
                id="paypal-secret"
                type={showPaypalSecret ? "text" : "password"}
                value={formData.paypalClientSecret || ''}
                onChange={(e) =>
                  handleInputChange("paypalClientSecret", e.target.value)
                }
                placeholder="PayPal Secret..."
                disabled={updateSettingsMutation.isPending || !formData.paypalEnabled}
                required={formData.paypalEnabled}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7"
                onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                disabled={updateSettingsMutation.isPending || !formData.paypalEnabled}
              >
                {showPaypalSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPaypalSecret ? "Hide" : "Show"} client secret
                </span>
              </Button>
            </div>
            <p className="text-xs text-destructive">
              Warning: Handle client secrets with extreme care.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4 border-t border-border/50 mt-8">
        <Button 
          onClick={handleSave} 
          disabled={updateSettingsMutation.isPending || isLoading}
        >
          {updateSettingsMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Payment Settings"
          )}
        </Button>
      </div>
    </div>
  );
}
