
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image'; // For Google logo
import { useState } from 'react';

// Placeholder function for handling local login
const handleLocalLogin = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // TODO: Implement local authentication logic
  alert("Local login submitted (placeholder)");
};

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


// Placeholder function for handling Google login/registration
const handleGoogleAuth = (mode: 'login' | 'register') => {
  // TODO: Implement Google OAuth flow, potentially using the mode
  alert(`Google ${mode} initiated (placeholder)`);
};

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <Card className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

             {/* Shared Header outside TabsContent */}
             <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">
                    {activeTab === 'login' ? 'Login' : 'Register'}
                </CardTitle>
                <CardDescription>
                    {activeTab === 'login' ? 'Access your Timberline Commerce account' : 'Create your Timberline Commerce account'}
                </CardDescription>
             </CardHeader>

            <TabsContent value="login">
                <CardContent className="space-y-6">
                    {/* Google Login Button */}
                    <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => handleGoogleAuth('login')}>
                        <Image src="https://picsum.photos/seed/google-logo/18/18" alt="Google" width={18} height={18} data-ai-hint="google logo" />
                        Continue with Google
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
                            <Label htmlFor="login-email">Email</Label>
                            <Input id="login-email" type="email" placeholder="you@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="login-password">Password</Label>
                                <Link href="/forgot-password"
                                      className="text-sm text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input id="login-password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full">Login</Button>
                    </form>
                </CardContent>
                {/* No Footer needed inside tab if toggle is via TabsTrigger */}
            </TabsContent>

            <TabsContent value="register">
                <CardContent className="space-y-6">
                    {/* Google Register Button */}
                    <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => handleGoogleAuth('register')}>
                        <Image src="https://picsum.photos/seed/google-logo/18/18" alt="Google" width={18} height={18} data-ai-hint="google logo" />
                        Continue with Google
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
                            <Label htmlFor="register-name">Full Name</Label>
                            <Input id="register-name" name="name" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="register-email">Email</Label>
                            <Input id="register-email" name="email" type="email" placeholder="you@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="register-password">Password</Label>
                            <Input id="register-password" name="password" type="password" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input id="confirm-password" name="confirm-password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full">Register</Button>
                    </form>
                </CardContent>
                 {/* No Footer needed inside tab if toggle is via TabsTrigger */}
            </TabsContent>
        </Tabs>
    </Card>
  );
}
