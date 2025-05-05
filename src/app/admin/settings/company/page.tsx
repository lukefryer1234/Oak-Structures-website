
"use client"; // For state, form handling

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // For address
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

// --- Types and Placeholder Data/Functions ---

interface CompanyInfo {
  name: string;
  address: string; // Multi-line address
  contactEmail: string;
  phone: string;
  vatNumber?: string; // Optional VAT Number
}

// Placeholder fetch function
const fetchCompanyInfo = async (): Promise<CompanyInfo> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  // Replace with actual fetch logic
   const storedData = localStorage.getItem('companyInfo');
   if (storedData) {
     try { return JSON.parse(storedData); } catch (e) { console.error("Failed to parse company info", e); }
   }
  // Default values
  return {
    name: "Timberline Commerce",
    address: "12 Timber Yard\nForest Industrial Estate\nBristol\nBS1 1AD",
    contactEmail: "info@timberline.com",
    phone: "01234 567 890",
    vatNumber: "GB123456789",
  };
};

// Placeholder update function
const updateCompanyInfo = async (info: CompanyInfo): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
   // Replace with actual update logic
    try {
        localStorage.setItem('companyInfo', JSON.stringify(info));
        return true;
   } catch(e) {
        console.error("Failed to save company info", e);
        return false;
   }
};

export default function CompanySettingsPage() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanyInfo().then(data => {
      setCompanyInfo(data);
      setIsLoading(false);
    });
  }, []);

  const handleInputChange = (field: keyof CompanyInfo, value: string) => {
    if (companyInfo) {
      setCompanyInfo({ ...companyInfo, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!companyInfo) return;

    // Basic validation
    if (!companyInfo.name || !companyInfo.address || !companyInfo.contactEmail || !companyInfo.phone) {
         toast({ variant: "destructive", title: "Validation Error", description: "Please fill in all required fields (Name, Address, Email, Phone)." });
        return;
    }
     // Email validation (basic)
     if (!/\S+@\S+\.\S+/.test(companyInfo.contactEmail)) {
        toast({ variant: "destructive", title: "Validation Error", description: "Please enter a valid email address." });
        return;
     }


    setIsSaving(true);
    const success = await updateCompanyInfo(companyInfo);
    setIsSaving(false);

    if (success) {
      toast({
        title: "Success",
        description: "Company information updated.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update company information. Please try again.",
      });
    }
  };

   if (isLoading) {
     return (
        <Card>
             <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Set your company's details displayed on the site and in communications.</CardDescription>
             </CardHeader>
             <CardContent className="flex justify-center items-center h-60">
                 <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
             </CardContent>
        </Card>
     );
   }

  if (!companyInfo) {
      // Handle case where data failed to load (optional)
      return <Card><CardContent><p className="text-destructive">Failed to load company information.</p></CardContent></Card>;
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>
          Set your company's name, address, and contact details displayed on the site and in communications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name <span className="text-destructive">*</span></Label>
          <Input
            id="company-name"
            value={companyInfo.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={isSaving}
            required
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="company-address">Company Address <span className="text-destructive">*</span></Label>
          <Textarea
            id="company-address"
            value={companyInfo.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={4}
            placeholder="Enter address line by line..."
            disabled={isSaving}
            required
          />
        </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Contact Email */}
             <div className="space-y-2">
              <Label htmlFor="contact-email">Contact Email <span className="text-destructive">*</span></Label>
              <Input
                id="contact-email"
                type="email"
                value={companyInfo.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="info@yourcompany.com"
                disabled={isSaving}
                required
              />
            </div>

            {/* Phone Number */}
             <div className="space-y-2">
               <Label htmlFor="phone-number">Phone Number <span className="text-destructive">*</span></Label>
               <Input
                 id="phone-number"
                 type="tel"
                 value={companyInfo.phone}
                 onChange={(e) => handleInputChange('phone', e.target.value)}
                 placeholder="01234 567890"
                 disabled={isSaving}
                 required
               />
             </div>
         </div>


        {/* VAT Number (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="vat-number">VAT Number (Optional)</Label>
          <Input
            id="vat-number"
            value={companyInfo.vatNumber ?? ''}
            onChange={(e) => handleInputChange('vatNumber', e.target.value)}
            placeholder="e.g., GB123456789"
            disabled={isSaving}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Company Info'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
