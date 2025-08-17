"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type AuthFormProps = {
  initialTab: 'login' | 'register';
};

function AuthContent({ initialTab: initialTabFromProps }: AuthFormProps) {
  const { user, register, login, error, setError, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryTab = searchParams.get('tab');
  const initialTab = queryTab === 'register' ? 'register' : (queryTab === 'login' ? 'login' : initialTabFromProps);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  useEffect(() => {
    // Redirect if user is logged in
    if (!authLoading && user) {
      const redirectUrl = searchParams.get('redirect') || '/account/profile';
      router.push(redirectUrl);
    }
  }, [user, authLoading, router, searchParams]);

  useEffect(() => {
    // Display any errors from the auth context
    if (error) {
      toast({ variant: "destructive", title: "Authentication Error", description: error });
      setError(null); // Clear the error after displaying
      setIsSubmitting(false);
    }
  }, [error, toast, setError]);

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const email = (event.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    const password = (event.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    await login({ email, password });
    setIsSubmitting(false);
  };

  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const displayName = (event.currentTarget.elements.namedItem('name') as HTMLInputElement).value;
    const email = (event.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    const password = (event.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    const confirmPassword = (event.currentTarget.elements.namedItem('confirm-password') as HTMLInputElement).value;

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setIsSubmitting(false);
      return;
    }

    await register({ displayName, email, password });
    setIsSubmitting(false);
  };

  const handleSocialAuth = (provider: string) => {
    toast({ variant: "default", title: "Coming Soon", description: `${provider} authentication is not yet implemented.`});
  };

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-transparent p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading authentication...</p>
      </div>
    );
  }

  // Don't render the form if the user is already logged in
  if (user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-transparent p-4">
        <Card className="w-full max-w-md">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login" disabled={isSubmitting}>Login</TabsTrigger>
                    <TabsTrigger value="register" disabled={isSubmitting}>Register</TabsTrigger>
                </TabsList>

                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl">{activeTab === 'login' ? 'Login' : 'Register'}</CardTitle>
                    <CardDescription>{activeTab === 'login' ? 'Access your account' : 'Create an account'}</CardDescription>
                </CardHeader>

                {/* Login Tab */}
                <TabsContent value="login">
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => handleSocialAuth('Google')} disabled={isSubmitting}>
                            <Image src="/images/google-logo.svg" alt="Google" width={18} height={18} />
                            Continue with Google
                        </Button>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><Separator /></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
                        </div>
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input id="login-email" name="email" type="email" placeholder="you@example.com" required disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="login-password">Password</Label>
                                    <Link href="/forgot-password" className={cn("text-sm text-primary hover:underline", isSubmitting && "pointer-events-none opacity-50")}>
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input id="login-password" name="password" type="password" required disabled={isSubmitting} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Login
                            </Button>
                        </form>
                    </CardContent>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register">
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => handleSocialAuth('Google')} disabled={isSubmitting}>
                           <Image src="/images/google-logo.svg" alt="Google" width={18} height={18} />
                            Continue with Google
                        </Button>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><Separator /></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or register with email</span></div>
                        </div>
                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="register-name">Full Name</Label>
                                <Input id="register-name" name="name" placeholder="John Doe" required disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="register-email">Email</Label>
                                <Input id="register-email" name="email" type="email" placeholder="you@example.com" required disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="register-password">Password</Label>
                                <Input id="register-password" name="password" type="password" required disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input id="confirm-password" name="confirm-password" type="password" required disabled={isSubmitting} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Register
                            </Button>
                        </form>
                    </CardContent>
                </TabsContent>
            </Tabs>
        </Card>
    </div>
  );
}

export default function AuthForm({ initialTab }: AuthFormProps) {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen items-center justify-center bg-transparent p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    }>
      <AuthContent initialTab={initialTab} />
    </Suspense>
  );
}
