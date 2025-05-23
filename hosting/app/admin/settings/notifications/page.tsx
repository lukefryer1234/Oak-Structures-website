"use client"; 

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { fetchNotificationSettingsAction, updateNotificationSettingsAction, type NotificationSettings } from './actions';

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchNotificationSettingsAction();
      setSettings(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleInputChange = (field: keyof NotificationSettings, value: string) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    const emails = settings.adminEmailAddresses.split(',').map(email => email.trim()).filter(email => email);
    if (emails.length === 0 && settings.adminEmailAddresses.trim() !== "") { // Allow empty submission if field is empty, but not if only commas
        toast({ variant: "destructive", title: "Validation Error", description: "Please enter at least one valid admin email address or leave the field empty." });
        return;
    }
    const invalidEmails = emails.filter(email => !/\S+@\S+\.\S+/.test(email));
    if (invalidEmails.length > 0) {
        toast({ variant: "destructive", title: "Validation Error", description: `Invalid email addresses found: ${invalidEmails.join(', ')}` });
        return;
    }


    setIsSaving(true);
    const result = await updateNotificationSettingsAction(settings);
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

        <div className="flex justify-end pt-4 border-t border-border/50">
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Notification Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}