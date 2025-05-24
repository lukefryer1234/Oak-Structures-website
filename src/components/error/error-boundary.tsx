"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service here
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback 
          error={this.state.error} 
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Props for the default error fallback component
interface DefaultErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

// Default fallback UI for when an error occurs
function DefaultErrorFallback({ error, resetError }: DefaultErrorFallbackProps) {
  const router = useRouter();

  const goHome = () => {
    resetError();
    router.push('/');
  };

  return (
    <Card className="mx-auto my-8 max-w-md border-destructive/50 shadow-md">
      <CardHeader className="space-y-1 bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>An Error Occurred</span>
        </CardTitle>
        <CardDescription>
          Something went wrong while displaying this content.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="rounded-md bg-destructive/10 p-4 my-4">
          <p className="text-sm font-medium text-destructive">
            {error?.message || "An unknown error occurred"}
          </p>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          We apologize for the inconvenience. You can try refreshing the page or 
          going back to the home page.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetError}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Button onClick={goHome}>
          <Home className="mr-2 h-4 w-4" />
          Go Home
        </Button>
      </CardFooter>
    </Card>
  );
}

// Export the error boundary with default props
export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryClass fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  );
}

export default ErrorBoundary;

