"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Placeholder function for handling password reset request
const handlePasswordReset = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // TODO: Implement password reset logic (send email link)
  alert("Password reset email sent (placeholder)");
};

export default function ForgotPasswordPage() {
  return (
    // The AuthLayout will center this Card
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required />
            </div>
            <Button type="submit" className="w-full">Send Reset Link</Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
           Remembered your password?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </CardFooter>
      </Card>
  );
}
