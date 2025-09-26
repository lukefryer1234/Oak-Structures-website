
"use client"; 

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { fetchFinancialSettingsAction, updateFinancialSettingsAction, type FinancialSettings } from './actions';

export default function FinancialSettingsPage() {
  const [settings, setSettings] = useState<FinancialSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchFinancialSettingsAction();
      setSettings(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleInputChange = (field: keyof FinancialSettings, value: string) => {
    setSettings(prev => {
        if (!prev) return null;
        if (field === 'vatRate') {
           const rate = parseFloat(value);
           return { ...prev, [field]: isNaN(rate) ? 0 : rate };
        }
        return { ...prev, [field]: value };
    });
  };

  const handleSave = async () => {
    if (!settings) return;

    if (!settings.currencySymbol || settings.vatRate < 0) {
       toast({ variant: "destructive", title: "Validation Error", description: "Please ensure Currency Symbol is set and VAT Rate is not negative." });
       return;
    }

    setIsSaving(true);
    const result = await updateFinancialSettingsAction(settings);
    setIsSaving(false);

    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message + (result.errors ? ` Details: ${result.errors.map(e => e.message).join(', ')}` : ''),
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
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="currency-symbol">Currency Symbol <span className="text-destructive">*</span></Label>
          <Input
            id="currency-symbol"
            value={settings.currencySymbol}
            onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
            maxLength={3}
            disabled={isSaving}
            required
          />
           <p className="text-xs text-muted-foreground">Typically &apos;£&apos; for GBP.</p>
        </div>

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

        <div className="flex justify-end pt-4 border-t border-border/50">
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Financial Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
