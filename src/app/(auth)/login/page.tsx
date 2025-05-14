"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Separate component that uses useSearchParams
function AuthContent() {
  const {
    currentUser,
    signInWithGoogle,
    setError,
    error,
    loading: authLoading,
  } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get redirect parameter if present
  const redirectPath = searchParams.get("redirect") || "/account/profile";

  useEffect(() => {
    if (!authLoading && currentUser) {
      router.push(redirectPath);
    }
  }, [currentUser, authLoading, router, redirectPath]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error,
      });
      setError(null);
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
      // Redirection is handled by useEffect checking currentUser
      // Toast for success is handled in AuthContext
    } catch (e) {
      // Error is set and displayed by AuthContext/useEffect
      console.error(`Google sign-in error:`, e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-transparent p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading authentication...</p>
      </div>
    );
  }

  // If user is already logged in, this component might unmount due to redirect,
  // or show briefly. Adding explicit null render if currentUser exists but still on this page.
  if (currentUser) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-transparent p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Access your Timberline Commerce account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center">
            <Image
              src="/images/logo.png"
              alt="Timberline Commerce"
              width={120}
              height={120}
              className="mb-6"
              priority
            />

            <Button
              variant="outline"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Image
                  src="/images/google-logo.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />
              )}
              Sign in with Google
            </Button>

            <p className="mt-8 text-sm text-center text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main component wrapped with Suspense
export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen items-center justify-center bg-transparent p-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
