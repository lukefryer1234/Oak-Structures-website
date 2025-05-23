"use client"; 

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { fetchCustomOrderIntroTextAction, updateCustomOrderIntroTextAction } from './actions';

export default function CustomOrderTextPage() {
  const [introText, setIntroText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const text = await fetchCustomOrderIntroTextAction();
      setIntroText(text);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateCustomOrderIntroTextAction(introText);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Order Page Text</CardTitle>
        <CardDescription>
          Edit the introductory text and instructions displayed at the top of the Custom Order Inquiry page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="intro-text">Introductory Text</Label>
              <Textarea
                id="intro-text"
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
                rows={10}
                placeholder="Enter the text to display on the custom order form..."
                disabled={isSaving}
              />
               <p className="text-xs text-muted-foreground">This text appears above the custom order form. You can use basic formatting like paragraphs.</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving || isLoading}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
