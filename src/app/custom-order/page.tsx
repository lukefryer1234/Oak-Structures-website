"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Not used directly, FormLabel is used
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod"; // For client-side, if kept
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { useFormState, useFormStatus } from 'react-dom';
import { submitCustomOrderForm, type CustomOrderFormState } from './actions';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form"; // Keep for client-side pre-fill


// Client-side schema for react-hook-form to handle pre-filling and basic structure
const customOrderClientSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  description: z.string().min(10, "Please provide a detailed description (min 10 characters)").min(1, "Description is required"),
  phone: z.string().optional(),
  postcode: z.string().optional(),
  companyName: z.string().optional(),
  productType: z.enum(["Garage", "Gazebo", "Porch", "Beams", "Flooring", "Other", ""]).optional(),
  fileUpload: z.any().optional(),
  contactMethod: z.enum(["Email", "Phone", ""]).optional(),
  budget: z.string().optional(),
  timescale: z.string().optional(),
});


const companyContact = {
  email: "info@timberline.com",
  phone: "01234 567 890",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? "Submitting..." : "Submit Inquiry"}
    </Button>
  );
}


export default function CustomOrderPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof customOrderClientSchema>>({
    resolver: zodResolver(customOrderClientSchema), // Still useful for client-side hints if needed
    defaultValues: {
      fullName: "",
      email: "",
      description: "",
      phone: "",
      postcode: "",
      companyName: "",
      productType: "",
      fileUpload: undefined,
      contactMethod: "",
      budget: "",
      timescale: "",
    },
  });
  
  const initialState: CustomOrderFormState = { message: '', success: false };
  const [state, formAction] = useFormState(submitCustomOrderForm, initialState);

  useEffect(() => {
    if (currentUser) {
      form.reset({
        fullName: currentUser.displayName || "",
        email: currentUser.email || "",
        // Keep other fields as they are or reset them
        description: form.getValues("description") || "",
        phone: form.getValues("phone") || "",
        postcode: form.getValues("postcode") || "",
        companyName: form.getValues("companyName") || "",
        productType: form.getValues("productType") || "",
        contactMethod: form.getValues("contactMethod") || "",
        budget: form.getValues("budget") || "",
        timescale: form.getValues("timescale") || "",
      });
    }
  }, [currentUser, form]);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Inquiry Submitted!",
          description: state.message,
        });
        form.reset({ // Reset react-hook-form as well
          fullName: currentUser?.displayName || "",
          email: currentUser?.email || "",
          description: "", phone: "", postcode: "", companyName: "",
          productType: "", contactMethod: "", budget: "", timescale: ""
        });
        // Optionally reset the file input if you have a ref to it
         const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
         if (fileInput) fileInput.value = '';

      } else {
        toast({
          variant: "destructive",
          title: "Submission Error",
          description: state.message || "Failed to submit inquiry.",
        });
      }
    }
  }, [state, toast, form, currentUser]);


  if (loading) {
    return (
      <div>
        <div className="container mx-auto px-4 py-12 text-center flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!currentUser) {
     return (
      <div>
          <div className="container mx-auto px-4 py-12 text-center flex items-center justify-center min-h-[calc(100vh-12rem)]">
             <Card className="max-w-lg mx-auto bg-card/80 backdrop-blur-sm">
                <CardHeader>
                   <CardTitle>Login Required</CardTitle>
                   <CardDescription>Please log in or register to submit a custom order inquiry.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/login?redirect=/custom-order">Login</Link>
                    </Button>
                </CardContent>
             </Card>
          </div>
      </div>
     );
   }

  return (
     <div>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="text-3xl">Custom Order Inquiry</CardTitle>
              <CardDescription>
                 Use this form to tell us about your bespoke requirements. Provide as much detail as possible.
                 Alternatively, you can contact us directly at <a href={`mailto:${companyContact.email}`} className="underline hover:text-primary">{companyContact.email}</a> or call us on <a href={`tel:${companyContact.phone}`} className="underline hover:text-primary">{companyContact.phone}</a>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* We use react-hook-form for client-side structure & prefill, but formAction for submission */}
              <Form {...form}> 
                <form action={formAction} className="space-y-6" id="custom-order-form">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} className="bg-background/70"/>
                        </FormControl>
                        {state.errors?.fullName && <FormMessage>{state.errors.fullName.join(', ')}</FormMessage>}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} className="bg-background/70"/>
                        </FormControl>
                         {state.errors?.email && <FormMessage>{state.errors.email.join(', ')}</FormMessage>}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description of Requirements <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Textarea rows={6} placeholder="Describe your project, desired dimensions, materials, features, etc." {...field} className="bg-background/70"/>
                        </FormControl>
                         <FormDescription>
                           Please be as detailed as possible.
                         </FormDescription>
                         {state.errors?.description && <FormMessage>{state.errors.description.join(', ')}</FormMessage>}
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Your contact number" {...field} className="bg-background/70"/>
                        </FormControl>
                        {state.errors?.phone && <FormMessage>{state.errors.phone.join(', ')}</FormMessage>}
                      </FormItem>
                    )}
                  />
                    <FormField
                    control={form.control}
                    name="postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postcode / Town</FormLabel>
                        <FormControl>
                          <Input placeholder="Delivery or site postcode/town" {...field} className="bg-background/70"/>
                        </FormControl>
                         <FormDescription>Helps us estimate delivery if applicable.</FormDescription>
                         {state.errors?.postcode && <FormMessage>{state.errors.postcode.join(', ')}</FormMessage>}
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your company name (if applicable)" {...field} className="bg-background/70"/>
                        </FormControl>
                        {state.errors?.companyName && <FormMessage>{state.errors.companyName.join(', ')}</FormMessage>}
                      </FormItem>
                    )}
                  />
                    <FormField
                      control={form.control}
                      name="productType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Related Product Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""} name={field.name}>
                            <FormControl>
                              <SelectTrigger className="bg-background/70">
                                <SelectValue placeholder="Select a product type (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Garage">Garage</SelectItem>
                              <SelectItem value="Gazebo">Gazebo</SelectItem>
                              <SelectItem value="Porch">Porch</SelectItem>
                              <SelectItem value="Beams">Oak Beams</SelectItem>
                              <SelectItem value="Flooring">Oak Flooring</SelectItem>
                              <SelectItem value="Other">Other / Not Sure</SelectItem>
                            </SelectContent>
                          </Select>
                          {state.errors?.productType && <FormMessage>{state.errors.productType.join(', ')}</FormMessage>}
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control} // react-hook-form control for file input, though actual handling is server-side
                      name="fileUpload"
                      render={({ field }) => ( // field here is just for react-hook-form to track, not directly for submission data
                        <FormItem>
                          <FormLabel>File Upload</FormLabel>
                          <FormControl>
                             {/* For use with formAction, the name attribute is key */}
                            <Input type="file" name="fileUpload" id="fileUpload" className="bg-background/70"/>
                          </FormControl>
                          <FormDescription>
                            Upload sketches, plans, or inspiration images (optional, max 5MB).
                          </FormDescription>
                          {/* Server-side errors for fileUpload are harder to display directly here without custom logic */}
                        </FormItem>
                      )}
                    />
                   <FormField
                      control={form.control}
                      name="contactMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Preferred Contact Method</FormLabel>
                          <FormControl>
                             {/* For use with formAction, the name attribute on RadioGroup is important */}
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value || ""}
                              name={field.name} // Ensure name is passed for FormData
                              className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="Email" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Email
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="Phone" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Phone
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          {state.errors?.contactMethod && <FormMessage>{state.errors.contactMethod.join(', ')}</FormMessage>}
                        </FormItem>
                      )}
                    />
                     <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget Indication</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., £5,000 - £10,000 (optional)" {...field} className="bg-background/70"/>
                            </FormControl>
                            {state.errors?.budget && <FormMessage>{state.errors.budget.join(', ')}</FormMessage>}
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="timescale"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Desired Timescale / Date</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Within 3 months, By September 2025 (optional)" {...field} className="bg-background/70"/>
                            </FormControl>
                            {state.errors?.timescale && <FormMessage>{state.errors.timescale.join(', ')}</FormMessage>}
                          </FormItem>
                        )}
                      />
                  <div className="flex justify-end pt-4 border-t border-border/50">
                     <SubmitButton />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
     </div>
  );
}