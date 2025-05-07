"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label"; // Not used directly, FormLabel is used
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod"; 
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
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react"; // Added Send icon
import { useForm } from "react-hook-form"; 


const customOrderClientSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  description: z.string().min(10, "Please provide a detailed description (min 10 characters)").min(1, "Description is required"),
  phone: z.string().optional(),
  postcode: z.string().optional(),
  companyName: z.string().optional(),
  productType: z.enum(["Garage", "Gazebo", "Porch", "Beams", "Flooring", "Other", ""]).optional(),
  // fileUpload: z.any().optional(), // File upload needs special handling for API routes
  contactMethod: z.enum(["Email", "Phone", ""]).optional(),
  budget: z.string().optional(),
  timescale: z.string().optional(),
});


const companyContact = {
  email: "info@timberline.com",
  phone: "01234 567 890",
};

export default function CustomOrderPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof customOrderClientSchema>>({
    resolver: zodResolver(customOrderClientSchema), 
    defaultValues: {
      fullName: "",
      email: "",
      description: "",
      phone: "",
      postcode: "",
      companyName: "",
      productType: "",
      // fileUpload: undefined,
      contactMethod: "",
      budget: "",
      timescale: "",
    },
  });
  

  useEffect(() => {
    if (!authLoading && currentUser) {
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
    } else if (!authLoading && !currentUser) {
        // Handled by redirect below
    }
  }, [currentUser, authLoading, form]);

  async function onSubmit(values: z.infer<typeof customOrderClientSchema>) {
    setIsSubmitting(true);
    try {
      // Replace with API call logic
      const response = await fetch('/api/customorderform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Inquiry Submitted!",
          description: result.message,
        });
        form.reset({ 
          fullName: currentUser?.displayName || "",
          email: currentUser?.email || "",
          description: "", phone: "", postcode: "", companyName: "",
          productType: "", contactMethod: "", budget: "", timescale: ""
        });
      } else {
        toast({
          variant: "destructive",
          title: "Submission Error",
          description: result.message || "Failed to submit inquiry.",
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }


  if (authLoading) {
    return (
      <div>
        <div className="container mx-auto px-4 py-12 text-center flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!currentUser) {
     // Redirect to login if not authenticated, including current page as redirect target
     const redirectUrl = `/login?redirect=${encodeURIComponent('/custom-order')}`;
     // useEffect is not ideal for redirects triggered by auth state in client components
     // router.push should be called directly or conditionally rendering based on auth state.
     // For immediate redirect:
     if (typeof window !== 'undefined') { // Ensure it runs only on client
        router.push(redirectUrl);
        return ( // Render loading/null while redirecting
          <div>
            <div className="container mx-auto px-4 py-12 text-center flex items-center justify-center min-h-[calc(100vh-12rem)]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Redirecting to login...</p>
            </div>
          </div>
        );
     }
     // Fallback for server rendering or if redirect hasn't happened yet
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
                        <Link href={redirectUrl}>Login</Link>
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
              <Form {...form}> 
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} className="bg-background/70"/>
                        </FormControl>
                        <FormMessage />
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
                         <FormMessage />
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
                         <FormMessage />
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
                        <FormMessage />
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
                         <FormMessage />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                    <FormField
                      control={form.control}
                      name="productType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Related Product Type</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value} name={field.name}>
                              <SelectTrigger className="bg-background/70">
                                <SelectValue placeholder="Select a product type (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Garage">Garage</SelectItem>
                                <SelectItem value="Gazebo">Gazebo</SelectItem>
                                <SelectItem value="Porch">Porch</SelectItem>
                                <SelectItem value="Beams">Oak Beams</SelectItem>
                                <SelectItem value="Flooring">Oak Flooring</SelectItem>
                                <SelectItem value="Other">Other / Not Sure</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     {/* <FormField
                      control={form.control} 
                      name="fileUpload"
                      render={({ field }) => ( 
                        <FormItem>
                          <FormLabel>File Upload</FormLabel>
                          <FormControl>
                            <Input 
                                type="file" 
                                name="fileUpload" 
                                id="fileUpload" 
                                className="bg-background/70"
                                // onChange is handled by react-hook-form for validation,
                                // but for actual file data, you'd handle via FormData in onSubmit if not using server actions
                            />
                          </FormControl>
                          <FormDescription>
                            Upload sketches, plans, or inspiration images (optional, max 5MB).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                   <FormField
                      control={form.control}
                      name="contactMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Preferred Contact Method</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              name={field.name} 
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
                          <FormMessage />
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
                            <FormMessage />
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  <div className="flex justify-end pt-4 border-t border-border/50">
                     <Button type="submit" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
                        {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
     </div>
  );
}
