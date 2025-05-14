"use client";

import React, { useState } from "react";
import { initializeFirestoreSettings } from "../init-firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function InitializeDatabasePage() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInitializeDatabase = async () => {
    // Reset states
    setIsInitializing(true);
    setStatus("idle");
    setErrorMessage(null);

    try {
      await initializeFirestoreSettings();
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      console.error("Database initialization error:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <Card className="border-2 border-yellow-200 dark:border-yellow-900">
        <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
            <CardTitle>Database Initialization Utility</CardTitle>
          </div>
          <CardDescription className="text-yellow-800 dark:text-yellow-400">
            This utility initializes the Firestore database with default
            settings documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <Alert variant="destructive" className="border-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning: Admin Utility</AlertTitle>
            <AlertDescription>
              This page should only be used during initial setup or if you need
              to reset settings to defaults. Running this on a production site
              may overwrite existing configuration.
            </AlertDescription>
          </Alert>

          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md border">
            <p className="text-sm font-medium mb-2">
              This utility will create the following documents if they don't
              exist:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Company Information</li>
              <li>Financial Settings</li>
              <li>Delivery Settings</li>
              <li>Payment Settings</li>
              <li>Analytics Settings</li>
              <li>Notification Settings</li>
            </ul>
          </div>

          {status === "success" && (
            <Alert variant="default" className="border-green-200 border-2">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                The database has been successfully initialized with default
                settings.
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive" className="border-2">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {errorMessage ||
                  "An error occurred during database initialization. Check the console for details."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-end bg-slate-50 dark:bg-slate-900/50 border-t">
          <Button
            onClick={handleInitializeDatabase}
            disabled={isInitializing}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {isInitializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              "Initialize Database"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
