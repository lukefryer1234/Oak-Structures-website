
"use client"; // For state, form handling

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from 'lucide-react'; // Icons for password visibility
import { Switch } from "@/components/ui/switch";

// --- Types and Placeholder Data/Functions ---

interface PaymentSettings {
  stripeEnabled: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string; // Store securely - never expose client-side
  paypalEnabled: boolean;
  paypalClientId: string;
  paypalClientSecret: string; // Store securely - never expose client-side
  // Add other potential settings like sandbox mode toggles if needed
  paypalSandboxMode: boolean;
}

// Placeholder fetch function - Keys should NOT be stored in localStorage in production
const fetchPaymentSettings = async (): Promise<PaymentSettings> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
   const storedData = localStorage.getItem('paymentSettings');
    if (storedData) {
      try { return JSON.parse(storedData); } catch (e) { console.error("Failed to parse payment settings", e); }
    }
  // Default/Empty values - Keys should come from secure storage/env vars ideally
  return {
    stripeEnabled: true,
    stripePublishableKey: "pk_test_...", // Placeholder
    stripeSecretKey: "sk_test_...", // Placeholder - NEVER expose this directly in frontend code
    paypalEnabled: true,
    paypalClientId: "PayPalClientID...", // Placeholder
    paypalClientSecret: "PayPalSecret...", // Placeholder - NEVER expose this directly
    paypalSandboxMode: true, // Default to sandbox for safety
  };
};

// Placeholder update function - Keys should be handled securely on the backend
const updatePaymentSettings = async (settings: PaymentSettings): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  console.warn("Saving payment keys to localStorage is insecure. Use secure backend storage and environment variables in production.");
   try {
        localStorage.setItem('paymentSettings', JSON.stringify(settings));
        return true;
   } catch(e) {
        console.error("Failed to save payment settings", e);
        return false;
   }
};

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentSettings().then(data => {
      setSettings(data);
      setIsLoading(false);
    });
  }, []);

  const handleInputChange = (field: keyof PaymentSettings, value: string | boolean) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    // Basic validation (check required fields if enabled)
    if (settings.stripeEnabled && (!settings.stripePublishableKey || !settings.stripeSecretKey)) {
        toast({ variant: "destructive", title: "Validation Error", description: "Stripe is enabled but keys are missing." });
        return;
    }
     if (settings.paypalEnabled && (!settings.paypalClientId || !settings.paypalClientSecret)) {
        toast({ variant: "destructive", title: "Validation Error", description: "PayPal is enabled but credentials are missing." });
        return;
    }

    setIsSaving(true);
     // IMPORTANT: In a real app, send only necessary data to backend.
     // Do NOT send secret keys back if they haven't changed unless backend requires it.
     // Ideally, only send flags (enabled/disabled) and let backend manage keys from secure env vars.
    const success = await updatePaymentSettings(settings);
    setIsSaving(false);

    if (success) {
      toast({
        title: "Success",
        description: "Payment settings updated.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment settings. Please try again.",
      });
    }
  };

   if (isLoading) {
     return (
        <Card>
             <CardHeader><CardTitle>Payment Gateway Settings</CardTitle></CardHeader>
             <CardContent className="flex justify-center items-center h-40">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </CardContent>
        </Card>
     );
   }

   if (!settings) {
      return <Card><CardContent><p className="text-destructive">Failed to load payment settings.</p></CardContent></Card>;
   }

  return (
    <div className="space-y-8">
      {/* Stripe Settings */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
             <div>
                <CardTitle>Stripe Settings</CardTitle>
                <CardDescription>Configure Stripe for card payments.</CardDescription>
             </div>
             <div className="flex items-center space-x-2">
                <Switch
                    id="stripe-enabled"
                    checked={settings.stripeEnabled}
                    onCheckedChange={(checked) => handleInputChange('stripeEnabled', checked)}
                    disabled={isSaving}
                />
                <Label htmlFor="stripe-enabled">Enable Stripe</Label>
             </div>
          </div>
        </CardHeader>
        <CardContent className={`space-y-4 ${!settings.stripeEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="space-y-2">
            <Label htmlFor="stripe-pk">Publishable Key <span className="text-destructive">*</span></Label>
            <Input
              id="stripe-pk"
              value={settings.stripePublishableKey}
              onChange={(e) => handleInputChange('stripePublishableKey', e.target.value)}
              placeholder="pk_test_..."
              disabled={isSaving || !settings.stripeEnabled}
              required={settings.stripeEnabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stripe-sk">Secret Key <span className="text-destructive">*</span> <span className="text-xs text-muted-foreground">(Keep Secure)</span></Label>
             <div className="relative">
                <Input
                  id="stripe-sk"
                  type={showStripeSecret ? 'text' : 'password'}
                  value={settings.stripeSecretKey}
                  onChange={(e) => handleInputChange('stripeSecretKey', e.target.value)}
                  placeholder="sk_test_..."
                  disabled={isSaving || !settings.stripeEnabled}
                   required={settings.stripeEnabled}
                   className="pr-10" // Add padding for the icon
                />
                 <Button
                   type="button"
                   variant="ghost"
                   size="icon"
                   className="absolute right-1 top-1 h-7 w-7"
                   onClick={() => setShowStripeSecret(!showStripeSecret)}
                    disabled={isSaving || !settings.stripeEnabled}
                 >
                   {showStripeSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                   <span className="sr-only">{showStripeSecret ? 'Hide' : 'Show'} secret key</span>
                 </Button>
             </div>
              <p className="text-xs text-destructive">Warning: Handle secret keys with extreme care. Do not expose client-side.</p>
          </div>
        </CardContent>
      </Card>

      {/* PayPal Settings */}
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
                    checked={settings.paypalEnabled}
                    onCheckedChange={(checked) => handleInputChange('paypalEnabled', checked)}
                    disabled={isSaving}
                />
                <Label htmlFor="paypal-enabled">Enable PayPal</Label>
             </div>
          </div>
        </CardHeader>
        <CardContent className={`space-y-4 ${!settings.paypalEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
           <div className="flex items-center space-x-2">
              <Switch
                 id="paypal-sandbox"
                 checked={settings.paypalSandboxMode}
                 onCheckedChange={(checked) => handleInputChange('paypalSandboxMode', checked)}
                 disabled={isSaving || !settings.paypalEnabled}
               />
              <Label htmlFor="paypal-sandbox">Enable Sandbox Mode</Label>
              <span className="text-xs text-muted-foreground">(Use PayPal's testing environment)</span>
           </div>

          <div className="space-y-2">
            <Label htmlFor="paypal-client-id">Client ID <span className="text-destructive">*</span></Label>
            <Input
              id="paypal-client-id"
              value={settings.paypalClientId}
              onChange={(e) => handleInputChange('paypalClientId', e.target.value)}
              placeholder="PayPal Client ID..."
              disabled={isSaving || !settings.paypalEnabled}
              required={settings.paypalEnabled}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="paypal-secret">Client Secret <span className="text-destructive">*</span> <span className="text-xs text-muted-foreground">(Keep Secure)</span></Label>
             <div className="relative">
                <Input
                  id="paypal-secret"
                  type={showPaypalSecret ? 'text' : 'password'}
                  value={settings.paypalClientSecret}
                  onChange={(e) => handleInputChange('paypalClientSecret', e.target.value)}
                  placeholder="PayPal Secret..."
                  disabled={isSaving || !settings.paypalEnabled}
                  required={settings.paypalEnabled}
                  className="pr-10"
                />
                 <Button
                   type="button"
                   variant="ghost"
                   size="icon"
                   className="absolute right-1 top-1 h-7 w-7"
                   onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                   disabled={isSaving || !settings.paypalEnabled}
                 >
                    {showPaypalSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPaypalSecret ? 'Hide' : 'Show'} client secret</span>
                 </Button>
             </div>
             <p className="text-xs text-destructive">Warning: Handle client secrets with extreme care.</p>
          </div>
        </CardContent>
      </Card>


      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t mt-8">
        <Button onClick={handleSave} disabled={isSaving || isLoading}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSaving ? 'Saving...' : 'Save Payment Settings'}
        </Button>
      </div>
    </div>
  );
}
