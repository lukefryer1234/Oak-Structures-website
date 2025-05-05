
"use client"; // For state, form handling

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

// --- Types and Placeholder Data/Functions ---

interface NotificationSettings {
  adminEmailAddresses: string; // Comma-separated list of emails
}

// Placeholder fetch function
const fetchNotificationSettings = async (): Promise<NotificationSettings> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  // Replace with actual fetch logic
  const storedData = localStorage.getItem('notificationSettings');
   if (storedData) {
     try { return JSON.parse(storedData); } catch (e) { console.error("Failed to parse notification settings", e); }
   }
  // Default values
  return {
    adminEmailAddresses: "admin@timberline.com", // Default single admin email
  };
};

// Placeholder update function
const updateNotificationSettings = async (settings: NotificationSettings): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  // Replace with actual update logic
  try {
     localStorage.setItem('notificationSettings', JSON.stringify(settings));
     return true;
  } catch (e) {
     console.error("Failed to save notification settings", e);
     return false;
  }
};

// Basic email validation function
const isValidEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotificationSettings().then(data => {
      setSettings(data);
      setIsLoading(false);
    });
  }, []);

  const handleInputChange = (field: keyof NotificationSettings, value: string) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    // Validate email addresses
    const emails = settings.adminEmailAddresses.split(',').map(email => email.trim()).filter(email => email);
    if (emails.length === 0) {
        toast({ variant: "destructive", title: "Validation Error", description: "Please enter at least one valid admin email address." });
        return;
    }
    const invalidEmails = emails.filter(email => !isValidEmail(email));
    if (invalidEmails.length > 0) {
        toast({ variant: "destructive", title: "Validation Error", description: `Invalid email addresses found: ${invalidEmails.join(', ')}` });
        return;
    }

    // Update settings with cleaned emails
    const cleanedSettings = { ...settings, adminEmailAddresses: emails.join(',') };
    setSettings(cleanedSettings); // Update local state with cleaned version

    setIsSaving(true);
    const success = await updateNotificationSettings(cleanedSettings);
    setIsSaving(false);

    if (success) {
      toast({
        title: "Success",
        description: "Admin notification settings updated.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
      });
    }
  };


   if (isLoading) {
     return (
        <Card>
             <CardHeader><CardTitle>Admin Notifications</CardTitle></CardHeader>
             <CardContent className="flex justify-center items-center h-40">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </CardContent>
        </Card>
     );
   }

   if (!settings) {
      return <Card><CardContent><p className="text-destructive">Failed to load notification settings.</p></CardContent></Card>;
   }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Email Notifications</CardTitle>
        <CardDescription>
          Set the email address(es) that receive notifications for new orders and custom order inquiries.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="admin-emails">Admin Email Address(es) <span className="text-destructive">*</span></Label>
          <Input
            id="admin-emails"
            value={settings.adminEmailAddresses}
            onChange={(e) => handleInputChange('adminEmailAddresses', e.target.value)}
            placeholder="admin@example.com, support@example.com"
            disabled={isSaving}
            required
          />
           <p className="text-xs text-muted-foreground">Enter one or more email addresses, separated by commas.</p>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Notification Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
