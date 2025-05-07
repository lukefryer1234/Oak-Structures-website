"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';


export default function ForgotPasswordPage() {
  const { sendPasswordReset, setError, error } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);


  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setEmailSent(false);
    const email = (event.target as HTMLFormElement).email.value;

    try {
      await sendPasswordReset(auth, email);
      toast({ title: "Password Reset Email Sent", description: "Please check your inbox for instructions." });
      setEmailSent(true);
    } catch (e: any) {
      console.error("Password reset error:", e);
      // Error is set in AuthContext and displayed via useEffect in AuthPage
      // For this page, we can show a specific toast too.
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-transparent p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                <CardTitle className="text-2xl">Reset Email Sent</CardTitle>
                <CardDescription>A password reset link has been sent to your email address. Please check your inbox (and spam folder).</CardDescription>
                </CardHeader>
                <CardFooter className="text-center text-sm text-muted-foreground flex justify-center">
                <Link href="/login" className="text-primary hover:underline ml-1">
                    Back to Login
                </Link>
                </CardFooter>
            </Card>
        </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-transparent p-4">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>Enter your email to receive a password reset link.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" required disabled={isSubmitting} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send Reset Link
                </Button>
            </form>
            {error && <p className="text-sm text-destructive text-center mt-4">{error}</p>}
            </CardContent>
            <CardFooter className="text-center text-sm text-muted-foreground flex justify-center">
            Remembered your password?{' '}
            <Link href="/login" className="text-primary hover:underline ml-1">
                Login
            </Link>
            </CardFooter>
        </Card>
    </div>
  );
}
