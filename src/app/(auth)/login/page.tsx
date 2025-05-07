
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


export default function AuthPage() {
  const { currentUser, signUpWithEmail, signInWithEmail, signInWithGoogle, setError, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);


  useEffect(() => {
    if (currentUser) {
      router.push('/account/profile'); // Redirect to profile if already logged in
    }
  }, [currentUser, router]);

  useEffect(() => {
    if(error) {
        toast({ variant: "destructive", title: "Authentication Error", description: error });
        setError(null); // Clear error after displaying
        setIsSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);


  const handleLocalLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const email = (event.target as HTMLFormElement).email.value;
    const password = (event.target as HTMLFormElement).password.value;

    try {
      await signInWithEmail(auth, email, password);
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push('/account/profile');
    } catch (e: any) {
      console.error("Local login error:", e);
      setError(e.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleLocalRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const name = (event.target as HTMLFormElement).name.value; // Assuming you might use the name later e.g. for profile update
    const email = (event.target as HTMLFormElement).email.value;
    const password = (event.target as HTMLFormElement).password.value;
    const confirmPassword = (event.target as HTMLFormElement)['confirm-password'].value;

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setIsSubmitting(false);
      return;
    }

    try {
      const userCredential = await signUpWithEmail(auth, email, password);
      // Optionally update profile with name here if desired
      // await updateProfile(userCredential.user, { displayName: name });
      toast({ title: "Registration Successful", description: "Your account has been created." });
      router.push('/account/profile');
    } catch (e: any) {
      console.error("Local registration error:", e);
      setError(e.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async (mode: 'login' | 'register') => {
    setIsSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
      toast({ title: "Google Sign-In Successful", description: `Welcome!` });
      router.push('/account/profile');
    } catch (e: any) {
      // Error is handled by the context
      console.error(`Google ${mode} error:`, e);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handlePayPalAuth = (mode: 'login' | 'register') => {
    // TODO: Implement PayPal OAuth flow
    setError("PayPal authentication is not yet implemented.");
    alert(`PayPal ${mode} initiated (placeholder)`);
  };


  return (
    <Card className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" disabled={isSubmitting}>Login</TabsTrigger>
                <TabsTrigger value="register" disabled={isSubmitting}>Register</TabsTrigger>
            </TabsList>

             <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">
                    {activeTab === 'login' ? 'Login' : 'Register'}
                </CardTitle>
                <CardDescription>
                    {activeTab === 'login' ? 'Access your Timberline Commerce account' : 'Create your Timberline Commerce account'}
                </CardDescription>
             </CardHeader>

            <TabsContent value="login">
                <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => handleGoogleAuth('login')} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Image src="https://picsum.photos/seed/google-logo/18/18" alt="Google" width={18} height={18} data-ai-hint="google logo" />}
                        Continue with Google
                    </Button>
                    <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => handlePayPalAuth('login')} disabled={isSubmitting}>
                         {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Image src="https://picsum.photos/seed/paypal-logo/18/18" alt="PayPal" width={18} height={18} data-ai-hint="paypal logo" />}
                        Continue with PayPal
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
                    <form onSubmit={handleLocalLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="login-email">Email</Label>
                            <Input id="login-email" name="email" type="email" placeholder="you@example.com" required disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="login-password">Password</Label>
                                <Link href="/forgot-password"
                                      className={cn("text-sm text-primary hover:underline", isSubmitting && "pointer-events-none opacity-50")}>
                                    Forgot password?
                                </Link>
                            </div>
                            <Input id="login-password" name="password" type="password" required disabled={isSubmitting} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Login
                        </Button>
                    </form>
                </CardContent>
            </TabsContent>

            <TabsContent value="register">
                <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => handleGoogleAuth('register')} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Image src="https://picsum.photos/seed/google-logo/18/18" alt="Google" width={18} height={18} data-ai-hint="google logo" />}
                        Continue with Google
                    </Button>
                     <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => handlePayPalAuth('register')} disabled={isSubmitting}>
                         {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :  <Image src="https://picsum.photos/seed/paypal-logo/18/18" alt="PayPal" width={18} height={18} data-ai-hint="paypal logo" />}
                        Continue with PayPal
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
                    <form onSubmit={handleLocalRegister} className="space-y-4">
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
                             {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Register
                        </Button>
                    </form>
                </CardContent>
            </TabsContent>
        </Tabs>
    </Card>
  );
}
