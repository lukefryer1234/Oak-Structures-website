
"use client"; // For state, form handling

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

// --- Types and Placeholder Data/Functions ---

interface FinancialSettings {
  currencySymbol: string; // Typically '£' for UK
  vatRate: number; // VAT rate as a percentage (e.g., 20)
}

// Placeholder fetch function
const fetchFinancialSettings = async (): Promise<FinancialSettings> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  // Replace with actual fetch logic
  const storedData = localStorage.getItem('financialSettings');
   if (storedData) {
      try { return JSON.parse(storedData); } catch(e) { console.error("Failed to parse financial settings", e); }
   }
   // Default values
  return {
    currencySymbol: "£",
    vatRate: 20, // Default UK VAT rate
  };
};

// Placeholder update function
const updateFinancialSettings = async (settings: FinancialSettings): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  // Replace with actual update logic
   try {
        localStorage.setItem('financialSettings', JSON.stringify(settings));
        return true;
   } catch(e) {
       console.error("Failed to save financial settings", e);
       return false;
   }
};

export default function FinancialSettingsPage() {
  const [settings, setSettings] = useState<FinancialSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFinancialSettings().then(data => {
      setSettings(data);
      setIsLoading(false);
    });
  }, []);

  const handleInputChange = (field: keyof FinancialSettings, value: string) => {
    if (settings) {
      if (field === 'vatRate') {
         const rate = parseFloat(value);
         setSettings({ ...settings, [field]: isNaN(rate) ? 0 : rate });
      } else {
         setSettings({ ...settings, [field]: value });
      }
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    // Basic validation
    if (!settings.currencySymbol || settings.vatRate < 0) {
       toast({ variant: "destructive", title: "Validation Error", description: "Please ensure Currency Symbol is set and VAT Rate is not negative." });
       return;
    }

    setIsSaving(true);
    const success = await updateFinancialSettings(settings);
    setIsSaving(false);

    if (success) {
      toast({
        title: "Success",
        description: "Financial settings updated.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update financial settings. Please try again.",
      });
    }
  };

   if (isLoading) {
     return (
        <Card>
             <CardHeader>
                <CardTitle>Financial Settings</CardTitle>
                <CardDescription>Configure currency and tax settings.</CardDescription>
             </CardHeader>
             <CardContent className="flex justify-center items-center h-40">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </CardContent>
        </Card>
     );
   }

  if (!settings) {
    return <Card><CardContent><p className="text-destructive">Failed to load financial settings.</p></CardContent></Card>;
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
        {/* Currency Symbol */}
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="currency-symbol">Currency Symbol <span className="text-destructive">*</span></Label>
          {/* Simple input for now, could be a dropdown if multiple currencies needed */}
          <Input
            id="currency-symbol"
            value={settings.currencySymbol}
            onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
            maxLength={3}
            disabled={isSaving}
            required
          />
           <p className="text-xs text-muted-foreground">Typically '£' for GBP.</p>
        </div>

        {/* VAT Rate */}
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="vat-rate">VAT Rate (%) <span className="text-destructive">*</span></Label>
          <Input
            id="vat-rate"
            type="number"
            step="0.01"
            min="0"
            value={settings.vatRate}
            onChange={(e) => handleInputChange('vatRate', e.target.value)}
            placeholder="e.g., 20"
            disabled={isSaving}
            required
          />
           <p className="text-xs text-muted-foreground">Enter the standard VAT rate as a percentage (e.g., 20 for 20%).</p>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Financial Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
