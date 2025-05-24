"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { fetchPaymentSettingsAction } from "@/app/admin/settings/payments/actions";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: any) => {
        render: (container: HTMLElement) => void;
      };
    };
  }
}

interface PayPalButtonProps {
  amount: number;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  currency?: string;
  disabled?: boolean;
}

export function PayPalButton({
  amount,
  onSuccess,
  onError,
  currency = "GBP",
  disabled = false,
}: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [settings, setSettings] = useState<{ clientId: string; sandbox: boolean } | null>(null);
  const { toast } = useToast();

  // Fetch PayPal settings
  useEffect(() => {
    const getPayPalSettings = async () => {
      try {
        const paymentSettings = await fetchPaymentSettingsAction();
        if (paymentSettings.paypalEnabled && paymentSettings.paypalClientId) {
          setSettings({
            clientId: paymentSettings.paypalClientId,
            sandbox: paymentSettings.paypalSandboxMode,
          });
        } else {
          toast({
            variant: "destructive",
            title: "PayPal Not Configured",
            description: "PayPal payment gateway is not properly configured.",
          });
          onError(new Error("PayPal not configured"));
        }
      } catch (error) {
        console.error("Failed to fetch PayPal settings:", error);
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Failed to load payment gateway settings.",
        });
        onError(error);
      } finally {
        setIsLoading(false);
      }
    };

    getPayPalSettings();
  }, [toast, onError]);

  // Load PayPal SDK script
  useEffect(() => {
    if (!settings || disabled || scriptLoaded) return;

    const loadPayPalScript = () => {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${settings.clientId}&currency=${currency}`;
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => {
        toast({
          variant: "destructive",
          title: "PayPal SDK Error",
          description: "Failed to load PayPal SDK. Please try again later.",
        });
        onError(new Error("Failed to load PayPal SDK"));
      };
      document.body.appendChild(script);
    };

    loadPayPalScript();

    return () => {
      // Clean up script on unmount if needed
      const paypalScript = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
      if (paypalScript) {
        document.body.removeChild(paypalScript);
      }
    };
  }, [settings, currency, disabled, scriptLoaded, toast, onError]);

  // Render PayPal buttons when SDK is loaded
  useEffect(() => {
    if (!scriptLoaded || !window.paypal || !paypalRef.current || disabled) return;

    // Clear any existing buttons
    paypalRef.current.innerHTML = "";

    window.paypal
      .Buttons({
        // Set up the transaction
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toFixed(2),
                  currency_code: currency,
                },
                description: "Purchase from Solid Oak Structures",
              },
            ],
          });
        },
        // Finalize the transaction
        onApprove: async (data: any, actions: any) => {
          try {
            const details = await actions.order.capture();
            toast({
              title: "Payment Successful",
              description: `Transaction completed by ${details.payer.name.given_name}`,
            });
            onSuccess(details);
          } catch (error) {
            console.error("PayPal capture error:", error);
            toast({
              variant: "destructive",
              title: "Payment Failed",
              description: "We couldn't process your payment. Please try again.",
            });
            onError(error);
          }
        },
        onError: (err: any) => {
          console.error("PayPal Error:", err);
          toast({
            variant: "destructive",
            title: "Payment Error",
            description: "An error occurred during the payment process.",
          });
          onError(err);
        },
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "pay",
        },
      })
      .render(paypalRef.current);
  }, [scriptLoaded, amount, currency, disabled, toast, onSuccess, onError]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-16 bg-muted/20 rounded-md">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md text-sm">
        PayPal is not properly configured. Please contact support.
      </div>
    );
  }

  return (
    <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
      <div ref={paypalRef} className="mt-4" />
      {settings.sandbox && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          PayPal is in sandbox (test) mode. No actual payments will be processed.
        </p>
      )}
    </div>
  );
}

