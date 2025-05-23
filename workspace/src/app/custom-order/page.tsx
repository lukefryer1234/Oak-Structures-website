// src/app/custom-order/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Form related imports removed
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { zodResolver } from "@hookform/resolvers/zod"; 
// import * as z from "zod";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
import { useAuth } from "@/context/auth-context";
// import { useRouter } from "next/navigation"; // Not needed for simplified page
import Link from "next/link";
import { useEffect, useState } from "react"; // useState might not be needed now
// import { useToast } from "@/hooks/use-toast"; // Not needed if form is removed
import { Loader2, Mail, Phone, FileText } from "lucide-react";
// import { useForm } from "react-hook-form"; // Not needed

// Zod schema and server action imports/definitions removed

const companyContact = {
  email: "info@timberline.com",
  phone: "01234 567 890",
};

export default function CustomOrderPage() {
  const { currentUser, loading: authLoading } = useAuth();
  // const router = useRouter(); // Not needed
  // const { toast } = useToast(); // Not needed
  // const [isSubmitting, setIsSubmitting] = useState(false); // Not needed

  // Form instance removed

  useEffect(() => {
    // This effect was mainly for pre-filling the form, not strictly necessary for simplified page
    if (!authLoading && currentUser) {
      // console.log("User is logged in:", currentUser.email);
    }
  }, [currentUser, authLoading]);

  // onSubmit function removed

  if (authLoading) {
    return (
      <div>
        <div className="container mx-auto px-4 py-12 text-center flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Login requirement for viewing this page is removed for simplification for now
  // The original prompt mentioned login is required for submitting the form.
  // Since the form is removed, we can allow viewing this informational page.

  return (
     <div>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
            <CardHeader className="text-center">
              <FileText className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle className="text-3xl md:text-4xl">Bespoke Timber Projects</CardTitle>
              <CardDescription className="text-lg text-muted-foreground pt-2">
                 Let&apos;s build your vision together.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed text-center">
                At Timberline Commerce, we specialize in creating custom oak frame structures and timber products tailored to your unique requirements. If you have a specific project in mind that isn&apos;t covered by our standard product pages, or if you need modifications to our existing designs, we&apos;re here to help.
              </p>
              
              <div className="space-y-4 pt-4 border-t border-border/30">
                <h3 className="text-xl font-semibold text-center text-foreground">How to Inquire:</h3>
                <p className="text-muted-foreground text-center">
                  To discuss your bespoke project, please provide us with as much detail as possible, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 text-center sm:text-left columns-1 sm:columns-2">
                  <li>Type of structure or product (e.g., garage, gazebo, unique beam design)</li>
                  <li>Desired dimensions (length, width, height)</li>
                  <li>Preferred oak type (if known)</li>
                  <li>Specific features or design elements</li>
                  <li>Intended use</li>
                  <li>Site postcode (for delivery considerations)</li>
                  <li>Any sketches, plans, or inspiration images you may have</li>
                </ul>
              </div>

              <div className="mt-8 text-center space-y-4">
                <p className="text-lg font-medium text-foreground">Please send your inquiry details to:</p>
                <div className="space-y-2">
                  <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                    <a href={`mailto:${companyContact.email}?subject=Custom Order Inquiry`}>
                      <Mail className="mr-2 h-5 w-5" /> Email Us: {companyContact.email}
                    </a>
                  </Button>
                  <p className="text-muted-foreground">Or call us on:</p>
                  <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                    <a href={`tel:${companyContact.phone.replace(/\s/g, '')}`}>
                      <Phone className="mr-2 h-5 w-5" /> Phone Us: {companyContact.phone}
                    </a>
                  </Button>
                </div>
              </div>

              {currentUser ? (
                <p className="text-xs text-muted-foreground text-center pt-4">Logged in as: {currentUser.email}</p>
              ) : (
                <p className="text-xs text-muted-foreground text-center pt-4">
                    <Link href="/login" className="underline hover:text-primary">Login or Register</Link> for a more streamlined experience.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
     </div>
  );
}
