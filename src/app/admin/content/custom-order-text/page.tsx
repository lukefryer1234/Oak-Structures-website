
"use client"; // For state management, form handling

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

// Placeholder for fetching/updating the text
const fetchIntroText = async (): Promise<string> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // Replace with actual fetch logic
    return localStorage.getItem('customOrderIntroText') || "Use this form to tell us about your bespoke requirements for garages, gazebos, porches, beams, flooring, or any other custom timber project. Provide as much detail as possible, including desired dimensions, materials, features, and intended use. You can also upload sketches or inspiration images. Alternatively, contact us directly via email or phone.";
};

const updateIntroText = async (text: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
     // Replace with actual update logic
     try {
        localStorage.setItem('customOrderIntroText', text);
        return true;
     } catch (error) {
         console.error("Failed to save text:", error);
         return false;
     }

};

export default function CustomOrderTextPage() {
  const [introText, setIntroText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchIntroText().then(text => {
      setIntroText(text);
      setIsLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateIntroText(introText);
    setIsSaving(false);

    if (success) {
      toast({
        title: "Success",
        description: "Custom order page introductory text updated.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update introductory text. Please try again.",
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
              <Button onClick={handleSave} disabled={isSaving}>
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
