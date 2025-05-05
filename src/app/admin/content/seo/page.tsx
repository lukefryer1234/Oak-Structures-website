
"use client"; // For state, form handling

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

// --- Types and Placeholder Data/Functions ---

interface PageSEO {
  pageKey: string; // e.g., 'home', 'garages', 'special-deals', 'gallery'
  pageName: string; // User-friendly name
  titleTag: string;
  metaDescription: string;
}

// Placeholder fetch function
const fetchPageSEO = async (): Promise<PageSEO[]> => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
  // Replace with actual fetch logic
  const storedData = localStorage.getItem('pageSEO');
  if (storedData) {
     try { return JSON.parse(storedData); } catch (e) { console.error("Failed to parse SEO data", e); }
  }
  // Default values if nothing stored
  return [
    { pageKey: 'home', pageName: 'Homepage', titleTag: 'Timberline Commerce | Bespoke Oak Structures & Timber', metaDescription: 'High-quality configurable oak garages, gazebos, porches, beams, and flooring. Design and order online or request a custom quote. UK delivery.' },
    { pageKey: 'garages', pageName: 'Garages Category/Config', titleTag: 'Configure Your Oak Frame Garage | Timberline Commerce', metaDescription: 'Design your bespoke oak frame garage online. Choose size, bays, truss type, and oak finish. Get an instant price estimate. UK delivery.' },
    { pageKey: 'gazebos', pageName: 'Gazebos Category/Config', titleTag: 'Configure Your Oak Gazebo | Timberline Commerce', metaDescription: 'Create your perfect garden gazebo. Select size, leg type, truss, and oak. Real-time pricing for your bespoke timber structure.' },
    { pageKey: 'porches', pageName: 'Porches Category/Config', titleTag: 'Design Your Oak Frame Porch | Timberline Commerce', metaDescription: 'Configure a beautiful and welcoming oak frame porch online. Choose style, size, and oak type. Instant estimate available.' },
     { pageKey: 'oak-beams', pageName: 'Oak Beams Category/Config', titleTag: 'Custom Oak Beams - Cut to Size | Timberline Commerce', metaDescription: 'Order structural or decorative oak beams online. Specify dimensions and oak type (Green, Kilned Dried, Reclaimed). Get instant pricing.' },
     { pageKey: 'oak-flooring', pageName: 'Oak Flooring - Configure & Order | Timberline Commerce', metaDescription: 'High-quality solid oak flooring. Choose reclaimed or kilned dried oak and specify the area required. Get a price per square meter.' },
    { pageKey: 'special-deals', pageName: 'Special Deals', titleTag: 'Special Offers on Oak Structures & Timber | Timberline Commerce', metaDescription: 'Grab a bargain with our limited-time special deals on pre-configured oak garages, gazebo kits, beam bundles, and flooring lots.' },
    { pageKey: 'gallery', pageName: 'Gallery', titleTag: 'Project Gallery | Timberline Commerce Examples', metaDescription: 'View examples of our completed oak frame garages, gazebos, porches, and other bespoke timber projects. Get inspired!' },
    // Add other key pages as needed (e.g., About, Contact, FAQ)
  ];
};

// Placeholder update function
const updatePageSEO = async (seoData: PageSEO[]): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
   // Replace with actual update logic
   try {
        localStorage.setItem('pageSEO', JSON.stringify(seoData));
        return true;
   } catch(e) {
        console.error("Failed to save SEO data", e);
        return false;
   }
};

const MAX_TITLE_LENGTH = 60;
const MAX_DESC_LENGTH = 160;

export default function SeoManagementPage() {
  const [seoData, setSeoData] = useState<PageSEO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPageSEO().then(data => {
      setSeoData(data);
      setIsLoading(false);
    });
  }, []);

  const handleInputChange = (pageKey: string, field: 'titleTag' | 'metaDescription', value: string) => {
    setSeoData(prevData =>
      prevData.map(page =>
        page.pageKey === pageKey ? { ...page, [field]: value } : page
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updatePageSEO(seoData);
    setIsSaving(false);

    if (success) {
      toast({
        title: "Success",
        description: "SEO settings updated successfully.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save SEO settings. Please try again.",
      });
    }
  };

  const getLengthColor = (current: number, max: number) => {
     if (current > max) return 'text-destructive';
     if (current > max * 0.9) return 'text-orange-500'; // Warning color
     return 'text-muted-foreground';
  }


  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Manage Title Tags and Meta Descriptions for key pages.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-60">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Settings</CardTitle>
        <CardDescription>
          Manage the Title Tags and Meta Descriptions for key pages to improve search engine visibility.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {seoData.map((page) => (
            <AccordionItem value={page.pageKey} key={page.pageKey} className="border rounded-md px-4">
              <AccordionTrigger className="text-lg font-medium hover:no-underline py-3">
                {page.pageName} Page
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4 space-y-4">
                {/* Title Tag Input */}
                <div className="space-y-1.5">
                  <Label htmlFor={`title-${page.pageKey}`}>Title Tag</Label>
                  <Input
                    id={`title-${page.pageKey}`}
                    value={page.titleTag}
                    onChange={(e) => handleInputChange(page.pageKey, 'titleTag', e.target.value)}
                    maxLength={MAX_TITLE_LENGTH + 10} // Allow slight overrun before hard cut-off
                    disabled={isSaving}
                    className="text-base"
                  />
                  <p className={`text-xs ${getLengthColor(page.titleTag.length, MAX_TITLE_LENGTH)}`}>
                    Length: {page.titleTag.length} / {MAX_TITLE_LENGTH} recommended
                  </p>
                </div>

                {/* Meta Description Input */}
                <div className="space-y-1.5">
                  <Label htmlFor={`desc-${page.pageKey}`}>Meta Description</Label>
                  <Textarea
                    id={`desc-${page.pageKey}`}
                    value={page.metaDescription}
                    onChange={(e) => handleInputChange(page.pageKey, 'metaDescription', e.target.value)}
                    rows={3}
                    maxLength={MAX_DESC_LENGTH + 20} // Allow slight overrun
                    disabled={isSaving}
                  />
                   <p className={`text-xs ${getLengthColor(page.metaDescription.length, MAX_DESC_LENGTH)}`}>
                     Length: {page.metaDescription.length} / {MAX_DESC_LENGTH} recommended
                   </p>
                </div>
                 {/* Google Preview (Simplified) */}
                 <div className="mt-4 p-3 border rounded-md bg-muted/30 space-y-1">
                     <p className="text-xs text-muted-foreground font-medium">Google Preview (Approximate)</p>
                     <p className="text-blue-700 text-lg truncate">{page.titleTag || `Default ${page.pageName} Title`}</p>
                     <p className="text-green-700 text-sm">https://timberline.com/{page.pageKey === 'home' ? '' : page.pageKey.replace(/ /g, '-').toLowerCase()}</p>
                     <p className="text-sm text-gray-700 line-clamp-2">{page.metaDescription || `Default meta description for the ${page.pageName} page providing details about...`}</p>
                 </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="flex justify-end mt-8">
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Saving SEO...' : 'Save All SEO Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
