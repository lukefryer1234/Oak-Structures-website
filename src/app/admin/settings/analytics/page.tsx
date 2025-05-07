"use client"; 

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { fetchAnalyticsSettingsAction, updateAnalyticsSettingsAction, type AnalyticsSettings } from './actions';

export default function AnalyticsSettingsPage() {
  const [settings, setSettings] = useState<AnalyticsSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchAnalyticsSettingsAction();
      setSettings(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleInputChange = (field: keyof AnalyticsSettings, value: string) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!settings) return;

     if (settings.googleAnalyticsId && !settings.googleAnalyticsId.match(/^(G-|UA-)\w+/)) {
        toast({ variant: "destructive", title: "Validation Error", description: "Please enter a valid Google Analytics ID (e.g., G-XXXXXXXXXX or UA-XXXXX-Y)." });
        return;
     }

    setIsSaving(true);
    const result = await updateAnalyticsSettingsAction(settings);
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
             <CardHeader><CardTitle>Analytics Settings</CardTitle></CardHeader>
             <CardContent className="flex justify-center items-center h-40">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </CardContent>
        </Card>
     );
   }

   if (!settings) {
      return <Card><CardContent><p className="text-destructive">Failed to load analytics settings.</p></CardContent></Card>;
   }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Settings</CardTitle>
        <CardDescription>
          Configure third-party analytics services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 max-w-lg">
          <Label htmlFor="ga-id">Google Analytics Measurement ID</Label>
          <Input
            id="ga-id"
            value={settings.googleAnalyticsId}
            onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
            placeholder="G-XXXXXXXXXX or UA-XXXXX-Y"
            disabled={isSaving}
          />
           <p className="text-xs text-muted-foreground">Enter your Google Analytics 4 Measurement ID or Universal Analytics Tracking ID.</p>
        </div>


        <div className="flex justify-end pt-4 border-t border-border/50">
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Analytics Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}