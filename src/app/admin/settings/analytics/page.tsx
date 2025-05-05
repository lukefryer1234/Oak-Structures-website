
"use client"; // For state, form handling

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

// --- Types and Placeholder Data/Functions ---

interface AnalyticsSettings {
  googleAnalyticsId: string; // e.g., G-XXXXXXXXXX or UA-XXXXX-Y
}

// Placeholder fetch function
const fetchAnalyticsSettings = async (): Promise<AnalyticsSettings> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  // Replace with actual fetch logic
  const storedData = localStorage.getItem('analyticsSettings');
   if (storedData) {
      try { return JSON.parse(storedData); } catch (e) { console.error("Failed to parse analytics settings", e); }
   }
  // Default values
  return {
    googleAnalyticsId: "", // Initially empty
  };
};

// Placeholder update function
const updateAnalyticsSettings = async (settings: AnalyticsSettings): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
   // Replace with actual update logic
   try {
       localStorage.setItem('analyticsSettings', JSON.stringify(settings));
       return true;
   } catch (e) {
       console.error("Failed to save analytics settings", e);
       return false;
   }
};

export default function AnalyticsSettingsPage() {
  const [settings, setSettings] = useState<AnalyticsSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsSettings().then(data => {
      setSettings(data);
      setIsLoading(false);
    });
  }, []);

  const handleInputChange = (field: keyof AnalyticsSettings, value: string) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!settings) return;

     // Optional: Basic validation for GA ID format (very loose)
     if (settings.googleAnalyticsId && !settings.googleAnalyticsId.match(/^(G-|UA-)\w+/)) {
        toast({ variant: "destructive", title: "Validation Error", description: "Please enter a valid Google Analytics ID (e.g., G-XXXXXXXXXX or UA-XXXXX-Y)." });
        return;
     }

    setIsSaving(true);
    const success = await updateAnalyticsSettings(settings);
    setIsSaving(false);

    if (success) {
      toast({
        title: "Success",
        description: "Analytics settings updated.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update analytics settings. Please try again.",
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
        {/* Google Analytics ID */}
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


        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Analytics Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
