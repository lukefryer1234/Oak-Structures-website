"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from 'next/image'; // For Google logo

// Placeholder function for handling local login
const handleLocalLogin = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // TODO: Implement local authentication logic
  alert("Local login submitted (placeholder)");
};

// Placeholder function for handling Google login
const handleGoogleLogin = () => {
  // TODO: Implement Google OAuth flow
  alert("Google login initiated (placeholder)");
};

export default function LoginPage() {
  return (
    // The AuthLayout will center this Card
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Access your Timberline Commerce account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Login Button */}
          <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleGoogleLogin}>
            <Image src="/images/google-logo.svg" alt="Google" width={18} height={18} data-ai-hint="google logo" />
            Login with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Local Login Form */}
          <form onSubmit={handleLocalLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                 <Label htmlFor="password">Password</Label>
                 <Link href="/forgot-password"
                       className="text-sm text-primary hover:underline">
                      Forgot password?
                 </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Register
          </Link>
        </CardFooter>
      </Card>
  );
}
