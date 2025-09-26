// src/app/checkout/page.tsx
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditCard, Construction, ArrowLeft } from 'lucide-react'; // Added Construction icon

// Remove Zod, react-hook-form, Server Action related imports as form is removed
// import { useForm, type FieldPath } from "react-hook-form";
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
// import { Input } from "@/components/ui/input";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Separator } from "@/components/ui/separator";
// import { Checkbox } from "@/components/ui/checkbox";
// import Image from 'next/image';
// import { useRouter } from "next/navigation";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/context/auth-context";
// import { Loader2 } from "lucide-react";
// import { useState } from "react";
// import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
// import type { User } from 'firebase/auth';

// Schemas and server action are removed as the form is gone for simplification

export default function CheckoutPage() {
  // const { currentUser } = useAuth(); // Not needed for simplified page
  // const router = useRouter(); // Not needed
  // const { toast } = useToast(); // Not needed
  // const [isSubmitting, setIsSubmitting] = useState(false); // Not needed

  // Form instance removed

  return (
    <div>
        <div className="container mx-auto px-4 py-12 md:py-16 flex items-center justify-center min-h-[calc(100vh-12rem)]">
            <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm border border-border/50 shadow-xl text-center">
                <CardHeader className="items-center pb-4 pt-8">
                    <CreditCard className="h-16 w-16 text-primary mb-2" />
                    <Construction className="h-10 w-10 text-amber-500 mb-4 -mt-4" />
                    <CardTitle className="text-3xl text-card-foreground">Online Checkout & Payment</CardTitle>
                    <CardDescription className="text-muted-foreground pt-2 max-w-md mx-auto">
                        Our secure online payment system is currently under construction.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 px-6 sm:px-10 py-8">
                    <p className="text-muted-foreground text-sm sm:text-base">
                        We are working diligently to implement a seamless and secure online checkout experience for your convenience. This feature will be available soon.
                    </p>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        If you have configured a product or wish to purchase items from our Special Deals, please contact us directly to finalize your order and arrange payment.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                        <Button asChild size="lg" variant="outline">
                            <Link href="/contact">Contact Us to Order</Link>
                        </Button>
                         <Button asChild size="lg">
                            <Link href="/"> <ArrowLeft className="mr-2 h-4 w-4"/> Return to Shopping</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
