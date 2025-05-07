
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
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
import { useAuth } from "@/context/auth-context"; // Import useAuth
import { useRouter } from "next/navigation"; // Import useRouter
import Link from "next/link"; // Import Link for redirect button
import { useEffect } from "react"; // Import useEffect

const customOrderSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  description: z.string().min(10, "Please provide a detailed description (min 10 characters)").min(1, "Description is required"),
  phone: z.string().optional(),
  postcode: z.string().optional(),
  companyName: z.string().optional(),
  productType: z.enum(["Garage", "Gazebo", "Porch", "Beams", "Flooring", "Other"]).optional(),
  fileUpload: z.any().optional(),
  contactMethod: z.enum(["Email", "Phone"]).optional(),
  budget: z.string().optional(),
  timescale: z.string().optional(),
});

const companyContact = {
  email: "info@timberline.com",
  phone: "01234 567 890",
};

export default function CustomOrderPage() {
  const { currentUser, loading } = useAuth(); // Get currentUser and loading state
  const router = useRouter();

  const form = useForm<z.infer<typeof customOrderSchema>>({
    resolver: zodResolver(customOrderSchema),
    defaultValues: {
      fullName: currentUser?.displayName || "",
      email: currentUser?.email || "",
    },
  });

  // Update form default values when currentUser changes
  useEffect(() => {
    if (currentUser) {
      form.reset({
        fullName: currentUser.displayName || "",
        email: currentUser.email || "",
        description: "", // Keep other fields empty or as previously set if needed
        phone: "",
        postcode: "",
        companyName: "",
        productType: undefined,
        fileUpload: undefined,
        contactMethod: undefined,
        budget: "",
        timescale: "",

      });
    }
  }, [currentUser, form]);


  function onSubmit(values: z.infer<typeof customOrderSchema>) {
    console.log(values);
    alert("Custom order inquiry submitted! (Placeholder)");
    form.reset();
  }

  if (loading) {
    return (
      <div>
        <div className="container mx-auto px-4 py-12 text-center flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <p>Loading...</p> {/* Or a spinner component */}
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="fileUpload"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>File Upload</FormLabel>
                          <FormControl>
                            <Input type="file" {...form.register("fileUpload")} className="bg-background/70"/>
                          </FormControl>
                          <FormDescription>
                            Upload sketches, plans, or inspiration images (optional, max 5MB).
                          </FormDescription>
                          <FormMessage />
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
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
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
                     <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Submitting..." : "Submit Inquiry"}
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
