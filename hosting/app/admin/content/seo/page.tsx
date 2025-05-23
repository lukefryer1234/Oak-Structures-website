"use client"; 

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { fetchPageSEOAction, updatePageSEOAction, type PageSEO } from './actions';

const MAX_TITLE_LENGTH = 60;
const MAX_DESC_LENGTH = 160;

export default function SeoManagementPage() {
  const [seoData, setSeoData] = useState<PageSEO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchPageSEOAction();
      setSeoData(data);
      setIsLoading(false);
    }
    loadData();
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
    const result = await updatePageSEOAction(seoData);
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
        description: result.message + (result.errors ? ` Details: ${result.errors.map(e => `${e.path.join('.')} - ${e.message}`).join(', ')}` : ''),
      });
    }
  };

  const getLengthColor = (current: number, max: number) => {
     if (current > max) return 'text-destructive';
     if (current > max * 0.9) return 'text-orange-500'; 
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
                <div className="space-y-1.5">
                  <Label htmlFor={`title-${page.pageKey}`}>Title Tag</Label>
                  <Input
                    id={`title-${page.pageKey}`}
                    value={page.titleTag}
                    onChange={(e) => handleInputChange(page.pageKey, 'titleTag', e.target.value)}
                    maxLength={MAX_TITLE_LENGTH + 10} 
                    disabled={isSaving}
                    className="text-base"
                  />
                  <p className={`text-xs ${getLengthColor(page.titleTag.length, MAX_TITLE_LENGTH)}`}>
                    Length: {page.titleTag.length} / {MAX_TITLE_LENGTH} recommended
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`desc-${page.pageKey}`}>Meta Description</Label>
                  <Textarea
                    id={`desc-${page.pageKey}`}
                    value={page.metaDescription}
                    onChange={(e) => handleInputChange(page.pageKey, 'metaDescription', e.target.value)}
                    rows={3}
                    maxLength={MAX_DESC_LENGTH + 20} 
                    disabled={isSaving}
                  />
                   <p className={`text-xs ${getLengthColor(page.metaDescription.length, MAX_DESC_LENGTH)}`}>
                     Length: {page.metaDescription.length} / {MAX_DESC_LENGTH} recommended
                   </p>
                </div>
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