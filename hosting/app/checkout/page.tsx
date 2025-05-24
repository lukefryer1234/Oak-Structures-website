"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Keep if used outside FormField
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
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
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { placeOrderAction, type OrderData } from './actions'; // Import server action
import { useAuth } from "@/context/auth-context"; // For getting current user
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { PayPalButton } from "@/components/checkout/paypal-button";

// Placeholder validation schema (adjust based on UK address specifics)
const addressSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  addressLine1: z.string().min(1, { message: "Address line 1 is required." }),
  addressLine2: z.string().optional(),
  town: z.string().min(1, { message: "Town/City is required." }),
  postcode: z.string().min(5, { message: "Valid UK postcode is required." }).max(8), 
  phone: z.string().optional(),
});

const checkoutSchema = z.object({
  billingAddress: addressSchema,
  shippingAddress: addressSchema.optional(), 
  useBillingAsShipping: z.boolean().default(true),
  paymentMethod: z.literal("paypal", { required_error: "PayPal must be selected." }),
  orderNotes: z.string().optional(), // Added order notes
});

// Placeholder order summary data - fetch from basket state in a real app
const orderSummary = {
  subtotal: 17575.00,
  shippingCost: 25.00, // Renamed from shipping to shippingCost
  vat: 3515.00,
  total: 21115.00,
  items: [ // Should match OrderItem schema in actions.ts
    { id: 'garage1', name: 'Custom Garage (3-Bay)', quantity: 1, price: 12500, description: 'Curved Truss, Reclaimed Oak, 2 Bays', category: 'garages' },
    { id: 'flooring1', name: 'Oak Flooring (25m²)', quantity: 1, price: 1875, description: 'Kilned Oak, 25m²', category: 'oak-flooring' },
    { id: 'deal2', name: 'Garden Gazebo Kit', quantity: 1, price: 3200, description: 'Special Deal', category: 'special-deals' },
 ]
};

export default function CheckoutPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      useBillingAsShipping: true,
      billingAddress: { email: currentUser?.email || "", firstName: "", lastName: "", addressLine1: "", town: "", postcode: ""},
      paymentMethod: "paypal", 
      orderNotes: "",
    },
  });

   const useBillingAsShipping = form.watch("useBillingAsShipping");

  // Handle PayPal payment success
  const handlePayPalSuccess = async (transactionId: string) => {
    // The checkout-specific PayPal button component handles order submission
    // We just need to handle any additional UI updates here
    console.log("Payment successful with transaction ID:", transactionId);
    // Note: No need to manually navigate as the PayPal button component handles redirection
  };

  // Handle PayPal payment error
  const handlePayPalError = (error: any) => {
    console.error("PayPal error:", error);
    // The toast is now handled by the PayPal button component
    setIsSubmitting(false);
  };

  // Form submission handler
  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    setIsSubmitting(true);

    const finalShippingAddress = values.useBillingAsShipping 
      ? values.billingAddress 
      : values.shippingAddress;

    if (!values.useBillingAsShipping && !finalShippingAddress) {
      toast({ variant: "destructive", title: "Validation Error", description: "Shipping address is required if not same as billing." });
      setIsSubmitting(false);
      return;
    }
    
    // Form validation passed, but we don't submit directly
    // PayPal button handles the actual submission after payment
    setIsSubmitting(false);
    toast({ 
      title: "Form Validated", 
      description: "Please complete payment using the PayPal button." 
    });
  }

  const renderAddressFields = (fieldName: "billingAddress" | "shippingAddress") => (
    <div className="space-y-4">
       {fieldName === "billingAddress" && (
         <FormField
            control={form.control}
            name={`${fieldName}.email`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} className="bg-background/70"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
       )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <FormField
            control={form.control}
            name={`${fieldName}.firstName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} className="bg-background/70"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${fieldName}.lastName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} className="bg-background/70"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
      </div>
        <FormField
            control={form.control}
            name={`${fieldName}.addressLine1`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1</FormLabel>
                <FormControl>
                  <Input placeholder="123 Timber Street" {...field} className="bg-background/70"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name={`${fieldName}.addressLine2`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2 (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Apartment, suite, etc." {...field} className="bg-background/70"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <FormField
              control={form.control}
              name={`${fieldName}.town`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Town / City</FormLabel>
                  <FormControl>
                    <Input placeholder="London" {...field} className="bg-background/70"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${fieldName}.postcode`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postcode</FormLabel>
                  <FormControl>
                    <Input placeholder="SW1A 0AA" {...field} className="bg-background/70"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
       </div>
        <FormField
            control={form.control}
            name={`${fieldName}.phone`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (Optional)</FormLabel>
                 <FormControl>
                  <Input type="tel" placeholder="01234 567890" {...field} className="bg-background/70"/>
                </FormControl>
                <FormDescription>
                  In case we need to contact you about your order.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
    </div>
  );


  return (
     <div>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">Checkout</h1>

           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                     <CardDescription>All transactions are secure and encrypted.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-3"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0 p-4 border border-border/50 rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5 bg-background/60">
                                <FormControl>
                                  <RadioGroupItem value="paypal" />
                                </FormControl>
                                 <Image src="/images/paypal-logo.svg" alt="PayPal" width={80} height={25} data-ai-hint="paypal logo"/>
                                 <FormLabel className="font-normal flex-grow cursor-pointer">
                                  PayPal
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <div className="mt-6">
                        <PayPalButton 
                          orderData={{
                            ...form.getValues(),
                            shippingAddress: form.getValues().useBillingAsShipping 
                              ? form.getValues().billingAddress 
                              : form.getValues().shippingAddress,
                            items: orderSummary.items.map(item => ({ ...item, price: Number(item.price) })),
                            subtotal: orderSummary.subtotal,
                            shippingCost: orderSummary.shippingCost,
                            vat: orderSummary.vat,
                            total: orderSummary.total
                          }}
                          onSuccess={handlePayPalSuccess}
                          onError={handlePayPalError}
                          disabled={!form.formState.isValid || isSubmitting}
                        />
                     </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle>Billing Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderAddressFields("billingAddress")}
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <FormField
                        control={form.control}
                        name="useBillingAsShipping"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border/50 p-4 mb-6 shadow-sm bg-background/60">
                             <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                 Same as billing address
                              </FormLabel>
                            </div>
                           </FormItem>
                        )}
                      />
                     {!useBillingAsShipping && renderAddressFields("shippingAddress")}
                  </CardContent>
                </Card>

                 <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                    <CardHeader>
                        <CardTitle>Shipping Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-border/50 p-4 bg-background/60">
                            <div className="flex justify-between items-center">
                                <span>Standard UK Delivery</span>
                                <span className="font-medium">
                                    {orderSummary.shippingCost === 0 ? 'FREE' : `£${orderSummary.shippingCost.toFixed(2)}`}
                                </span>
                            </div>
                             <p className="text-sm text-muted-foreground mt-1">
                                Estimated delivery times vary based on product type and location.
                             </p>
                        </div>
                    </CardContent>
                 </Card>

              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-20 bg-card/80 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-3 max-h-60 overflow-y-auto pr-2 border-b border-border/50 pb-4 mb-4">
                        {orderSummary.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{item.name} x {item.quantity}</span>
                                <span className="text-foreground">£{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">£{orderSummary.subtotal.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">Shipping</span>
                       <span className="text-foreground">{orderSummary.shippingCost === 0 ? 'FREE' : `£${orderSummary.shippingCost.toFixed(2)}`}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">VAT</span>
                       <span className="text-foreground">£{orderSummary.vat.toFixed(2)}</span>
                     </div>
                    <Separator className="border-border/50" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>£{orderSummary.total.toFixed(2)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col space-y-4 border-t border-border/50 pt-6">
                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                       Validate Order Details
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                        By placing your order, you agree to our <Link href="/terms" className="underline hover:text-primary">Terms & Conditions</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </form>
          </Form>
        </div>
     </div>
  );
}