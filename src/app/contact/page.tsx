"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitContactForm, ContactFormState } from "./actions"
import { useFormState } from "react-dom"

const initialState: ContactFormState = {
  message: '',
  success: false,
};

export default function ContactPage() {
  const [state, formAction] = useFormState(submitContactForm, initialState);

  return (
    <div>
      <section className="bg-muted py-12 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center">Contact Us</h1>
          <p className="mt-4 text-lg text-center text-muted-foreground">
            We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold">Get in Touch</h2>
              <p className="mt-4 text-muted-foreground">
                Have a question about our products or services? Need a custom quote? Fill out the form and we'll be
                in touch.
              </p>
              <div className="mt-8 space-y-4">
                <div>
                  <h3 className="text-xl font-bold">Address</h3>
                  <p className="text-muted-foreground">123 Oak Lane, Forestville, UK</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Phone</h3>
                  <p className="text-muted-foreground">(123) 456-7890</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Email</h3>
                  <p className="text-muted-foreground">info@oakstructures.com</p>
                </div>
              </div>
            </div>
            <div>
              <Card>
                <CardContent className="p-6">
                  <form action={formAction} className="grid gap-4">
                    {state?.message && (
                      <div className={`p-3 rounded ${state.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {state.message}
                      </div>
                    )}
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" placeholder="Enter your name" required />
                      {state?.errors?.name && <p className="text-red-500 text-sm mt-1">{state.errors.name[0]}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="Enter your email" required />
                      {state?.errors?.email && <p className="text-red-500 text-sm mt-1">{state.errors.email[0]}</p>}
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" name="subject" placeholder="Enter subject" required />
                      {state?.errors?.subject && <p className="text-red-500 text-sm mt-1">{state.errors.subject[0]}</p>}
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" name="message" placeholder="Enter your message" className="min-h-[150px]" required />
                      {state?.errors?.message && <p className="text-red-500 text-sm mt-1">{state.errors.message[0]}</p>}
                    </div>
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
