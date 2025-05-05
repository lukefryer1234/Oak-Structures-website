
"use client"; // Required for form handling

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
import Image from 'next/image'; // Import Image

// Placeholder - In a real app, check authentication status here
const isLoggedIn = true; // Assume user is logged in for now

const customOrderSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  description: z.string().min(10, "Please provide a detailed description (min 10 characters)").min(1, "Description is required"),
  phone: z.string().optional(),
  postcode: z.string().optional(),
  companyName: z.string().optional(),
  productType: z.enum(["Garage", "Gazebo", "Porch", "Beams", "Flooring", "Other"]).optional(),
  fileUpload: z.any().optional(), // Handle file uploads appropriately on the backend
  contactMethod: z.enum(["Email", "Phone"]).optional(),
  budget: z.string().optional(),
  timescale: z.string().optional(),
});

// Placeholder contact details - fetch from admin settings in real app
const companyContact = {
  email: "info@timberline.com",
  phone: "01234 567 890",
};

export default function CustomOrderPage() {
  const form = useForm<z.infer<typeof customOrderSchema>>({
    resolver: zodResolver(customOrderSchema),
    // Pre-fill email if user is logged in and email is available
    defaultValues: {
      email: isLoggedIn ? "user@example.com" : "", // Replace with actual user email
      fullName: isLoggedIn ? "Logged In User" : "", // Replace with actual user name
    },
  });

  function onSubmit(values: z.infer<typeof customOrderSchema>) {
    // TODO: Implement form submission logic
    // - Handle file upload if present
    // - Send email to admin
    // - Optionally save submission to DB
    console.log(values);
    alert("Custom order inquiry submitted! (Placeholder)");
    form.reset(); // Reset form after submission
  }

  if (!isLoggedIn) {
    // In a real app, you might redirect to login or show a message
     return (
      <div className="relative isolate overflow-hidden"> {/* Added wrapper for background */}
          <Image
             src="https://picsum.photos/seed/custom-order-login-bg/1920/1080"
             alt="Subtle background"
             layout="fill"
             objectFit="cover"
             className="absolute inset-0 -z-10 opacity-5"
             data-ai-hint="subtle texture grey pattern"
             aria-hidden="true"
           />
          <div className="container mx-auto px-4 py-12 text-center flex items-center justify-center min-h-[calc(100vh-12rem)]">
             <Card className="max-w-lg mx-auto bg-card/80 backdrop-blur-sm"> {/* Adjusted card */}
                <CardHeader>
                   <CardTitle>Login Required</CardTitle>
                   <CardDescription>Please log in or register to submit a custom order inquiry.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => {/* Redirect to login */}}>Login</Button>
                </CardContent>
             </Card>
          </div>
      </div>
     );
   }

  return (
     <div className="relative isolate overflow-hidden"> {/* Added relative isolate */}
       {/* Background Image */}
       <Image
         src="https://picsum.photos/seed/custom-order-bg/1920/1080"
         alt="Subtle background texture blueprint"
         layout="fill"
         objectFit="cover"
         className="absolute inset-0 -z-10 opacity-5" // Very subtle opacity
         data-ai-hint="subtle pattern texture blueprint design wood"
         aria-hidden="true"
       />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50"> {/* Adjusted card */}
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
                  {/* Required Fields */}
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

                  {/* Optional Fields */}
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
                            {/* Basic file input. Enhance with drag-and-drop library if needed */}
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


                  <div className="flex justify-end pt-4 border-t border-border/50"> {/* Added border */}
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
