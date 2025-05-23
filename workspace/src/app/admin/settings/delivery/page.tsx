
"use client"; 

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { fetchDeliverySettingsAction, updateDeliverySettingsAction, type DeliverySettings } from './actions';


export default function DeliverySettingsPage() {
  const [settings, setSettings] = useState<DeliverySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchDeliverySettingsAction();
      setSettings(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleInputChange = (field: keyof DeliverySettings, value: string) => {
    setSettings(prev => {
        if (!prev) return null;
        const numValue = parseFloat(value);
        return { ...prev, [field]: isNaN(numValue) ? 0 : numValue };
    });
  };

  const handleSave = async () => {
    if (!settings) return;

     if (settings.freeDeliveryThreshold < 0 || settings.ratePerM3 < 0 || settings.minimumDeliveryCharge < 0) {
        toast({ variant: "destructive", title: "Validation Error", description: "All delivery cost fields must be zero or positive." });
        return;
     }

    setIsSaving(true);
    const result = await updateDeliverySettingsAction(settings);
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
                <CardTitle>Delivery Settings</CardTitle>
                <CardDescription>Configure rules for calculating delivery costs.</CardDescription>
             </CardHeader>
             <CardContent className="flex justify-center items-center h-40">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </CardContent>
        </Card>
     );
   }

   if (!settings) {
      return <Card><CardContent><p className="text-destructive">Failed to load delivery settings.</p></CardContent></Card>;
   }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Settings</CardTitle>
        <CardDescription>
          Configure the rules for calculating delivery costs, primarily for Oak Beams and Oak Flooring. (Note: Delivery for Garages, Gazebos, Porches is typically included in their price).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 max-w-md">
          <Label htmlFor="free-threshold">Free Delivery Threshold (£) <span className="text-destructive">*</span></Label>
          <Input
            id="free-threshold"
            type="number"
            step="0.01"
            min="0"
            value={settings.freeDeliveryThreshold}
            onChange={(e) => handleInputChange('freeDeliveryThreshold', e.target.value)}
            placeholder="e.g., 1000"
            disabled={isSaving}
            required
          />
           <p className="text-xs text-muted-foreground">Basket value (excl. VAT) above which Beam/Flooring delivery becomes free.</p>
        </div>

        <div className="space-y-2 max-w-md">
          <Label htmlFor="rate-m3">Rate per m³ (£) <span className="text-destructive">*</span></Label>
          <Input
            id="rate-m3"
            type="number"
            step="0.01"
            min="0"
            value={settings.ratePerM3}
            onChange={(e) => handleInputChange('ratePerM3', e.target.value)}
            placeholder="e.g., 50"
            disabled={isSaving}
            required
          />
           <p className="text-xs text-muted-foreground">Cost applied per cubic meter for Beam/Flooring orders below the threshold.</p>
        </div>

        <div className="space-y-2 max-w-md">
          <Label htmlFor="min-charge">Minimum Delivery Charge (£) <span className="text-destructive">*</span></Label>
          <Input
            id="min-charge"
            type="number"
            step="0.01"
            min="0"
            value={settings.minimumDeliveryCharge}
            onChange={(e) => handleInputChange('minimumDeliveryCharge', e.target.value)}
            placeholder="e.g., 25"
            disabled={isSaving}
            required
          />
           <p className="text-xs text-muted-foreground">Minimum charge applied if the calculated volume cost is lower and free delivery threshold isn&apos;t met.</p>
        </div>


        <div className="flex justify-end pt-4 border-t border-border/50">
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Delivery Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
