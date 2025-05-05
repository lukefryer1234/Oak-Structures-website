"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from 'next/image'; // For Google logo

// Placeholder function for handling local registration
const handleLocalRegister = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const password = (event.target as HTMLFormElement).password.value;
  const confirmPassword = (event.target as HTMLFormElement)['confirm-password'].value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!"); // Replace with better error handling
    return;
  }

  // TODO: Implement local registration logic (send data to backend)
  alert("Local registration submitted (placeholder)");
};

// Placeholder function for handling Google registration (often same flow as login)
const handleGoogleRegister = () => {
  // TODO: Implement Google OAuth flow
  alert("Google registration initiated (placeholder)");
};

export default function RegisterPage() {
  return (
    // The AuthLayout will center this Card
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>Create your Timberline Commerce account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Register Button */}
          <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleGoogleRegister}>
             <Image src="/images/google-logo.svg" alt="Google" width={18} height={18} data-ai-hint="google logo" />
            Register with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or register with email
              </span>
            </div>
          </div>

          {/* Local Registration Form */}
          <form onSubmit={handleLocalRegister} className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" required />
            </div>
            <Button type="submit" className="w-full">Register</Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </CardFooter>
      </Card>
  );
}
