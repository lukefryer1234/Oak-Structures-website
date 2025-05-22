
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from 'react-dom';
import { z } from "zod";
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// --- Server Action and Types DEFINED INLINE ---
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

export interface ContactFormState {
  message: string;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
}

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  'use server';
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your input.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await addDoc(collection(db, 'contactSubmissions'), {
      ...validatedFields.data,
      submittedAt: new Date(),
    });
    return { message: 'Your message has been sent successfully!', success: true };
  } catch (error: unknown) {
    console.error('Error submitting contact form:', error);
    let errorMessage = 'An error occurred. Please try again later.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { message: errorMessage, success: false };
  }
}
// --- End of Inlined Server Action and Types ---

const companyInfo = {
  name: "Timberline Commerce",
  address: "12 Timber Yard, Forest Industrial Estate, Bristol, BS1 1AD",
  phone: "01234 567 890",
  email: "info@timberline.com",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}> {/* Removed btn-accent for now */}
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      {pending ? 'Sending...' : 'Send Message'}
    </Button>
  );
}

export default function ContactPage() {
  const { toast } = useToast();
  const initialState: ContactFormState = { message: '', success: false, errors: undefined }; // Ensure errors is part of initial state
  const [state, formAction] = useFormState(submitContactForm, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Message Sent!",
          description: state.message,
        });
        const form = document.getElementById('contact-form') as HTMLFormElement;
        form?.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: state.message + (state.errors ? ` Details: ${Object.values(state.errors).flat().join(', ')}` : ''),
        });
      }
    }
  }, [state, toast]);

  return (
    <div>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <h1 className="text-4xl font-bold text-center mb-12 text-foreground">Contact Us</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Get In Touch</h2>
              <p className="text-muted-foreground leading-relaxed">
                We&apos;re here to help! Whether you have questions about our products, need assistance with configuration, or want to discuss a custom project, feel free to reach out using the details below or the contact form.
              </p>
            </div>
            <Card className="bg-card/80 backdrop-blur-sm border border-border p-6 space-y-5 shadow-sm">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="font-medium text-card-foreground">Our Address</h3>
                  <p className="text-sm text-muted-foreground">{companyInfo.address}</p>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyInfo.address)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-1 inline-block">
                    View on Map
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="font-medium text-card-foreground">Phone</h3>
                  <a href={`tel:${companyInfo.phone.replace(/\s/g, '')}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{companyInfo.phone}</a>
                  <p className="text-xs text-muted-foreground">(Mon-Fri, 9am - 5pm)</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="font-medium text-card-foreground">Email</h3>
                  <a href={`mailto:${companyInfo.email}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{companyInfo.email}</a>
                </div>
              </div>
            </Card>
          </div>
          <div className="lg:col-span-3">
            <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-card-foreground">Send Us a Message</CardTitle>
                <CardDescription className="text-muted-foreground">Fill out the form below and we&apos;ll get back to you as soon as possible.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={formAction} id="contact-form" className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-card-foreground">Name</label>
                    <Input id="contact-name" name="name" placeholder="Your Name" required className="bg-background/70 border-input" />
                    {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name.join(', ')}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-card-foreground">Email</label>
                    <Input id="contact-email" name="email" type="email" placeholder="your.email@example.com" required className="bg-background/70 border-input" />
                    {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email.join(', ')}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-subject" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-card-foreground">Subject</label>
                    <Input id="contact-subject" name="subject" placeholder="e.g., Question about Garages" required className="bg-background/70 border-input" />
                    {state.errors?.subject && <p className="text-sm text-destructive">{state.errors.subject.join(', ')}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-card-foreground">Message</label>
                    <Textarea id="contact-message" name="message" rows={5} placeholder="Your message..." required className="bg-background/70 border-input" />
                    {state.errors?.message && <p className="text-sm text-destructive">{state.errors.message.join(', ')}</p>}
                  </div>
                  <SubmitButton />
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

    