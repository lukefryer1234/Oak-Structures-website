"use client";

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useBasket } from '@/context/basket-context';
import { useAuth } from '@/context/auth-context';
import { placeOrderAction, type OrderData } from '@/app/checkout/actions';

// Define the props interface for the PayPal button component
interface PayPalButtonProps {
  onSuccess: (transactionId: string) => void;
  onError: (error: any) => void;
  orderData: OrderData;
  disabled?: boolean;
}

// Declare the PayPal global object for TypeScript
declare global {
  interface Window {
    paypal?: any;
  }
}

// Define the component
export function PayPalButton({ onSuccess, onError, orderData, disabled = false }: PayPalButtonProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const { total } = useBasket();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const router = useRouter();

  // Format the total price for PayPal (ensure 2 decimal places)
  const formattedTotal = total.toFixed(2);

  // Initialize PayPal button when the script loads
  useEffect(() => {
    if (scriptLoaded && paypalContainerRef.current && !disabled && window.paypal) {
      // Clear any existing buttons first
      paypalContainerRef.current.innerHTML = '';

      // Initialize PayPal buttons
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay'
        },
        
        // Create order
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: 'GBP',
                value: formattedTotal,
                breakdown: {
                  item_total: {
                    currency_code: 'GBP',
                    value: orderData.subtotal.toFixed(2)
                  },
                  shipping: {
                    currency_code: 'GBP',
                    value: orderData.shippingCost.toFixed(2)
                  },
                  tax_total: {
                    currency_code: 'GBP',
                    value: orderData.vat.toFixed(2)
                  }
                }
              },
              items: orderData.items.map(item => ({
                name: item.name,
                description: item.description || '',
                quantity: item.quantity.toString(),
                unit_amount: {
                  currency_code: 'GBP',
                  value: (item.price / item.quantity).toFixed(2)
                },
                category: 'PHYSICAL_GOODS'
              }))
            }]
          });
        },
        
        // Handle approved payment
        onApprove: async (data: any, actions: any) => {
          try {
            setButtonLoading(true);
            // Capture the order to complete the payment
            const orderDetails = await actions.order.capture();
            
            // Get transaction ID and other details
            const transactionId = orderDetails.purchase_units[0]?.payments?.captures[0]?.id || 
                                 orderDetails.id;
            
            // Add the transaction ID to order data
            const enrichedOrderData = {
              ...orderData,
              paymentDetails: {
                transactionId,
                paymentMethod: 'paypal',
                paymentStatus: orderDetails.status,
                paymentTime: new Date().toISOString()
              }
            };
            
            // Submit the order with the transaction ID
            const result = await placeOrderAction(currentUser, enrichedOrderData);
            
            if (result.success && result.orderId) {
              // Call the success callback with transaction ID
              onSuccess(transactionId);
              toast({ 
                title: "Payment Successful!", 
                description: "Your order has been placed."
              });
              
              // Redirect to order confirmation page
              router.push(`/order-confirmation?orderId=${result.orderId}`);
            } else {
              // Handle order placement failure
              setError(result.message || "Failed to process order.");
              onError(new Error(result.message || "Failed to process order."));
              toast({ 
                variant: "destructive", 
                title: "Order Processing Failed", 
                description: result.message || "There was an issue processing your order. Your payment was received, but we couldn't complete your order. Please contact customer support."
              });
            }
          } catch (err) {
            console.error('PayPal payment error:', err);
            setError('Payment failed. Please try again.');
            onError(err);
            toast({ 
              variant: "destructive", 
              title: "Payment Failed", 
              description: "There was an error processing your payment. Please try again or use a different payment method."
            });
          } finally {
            setButtonLoading(false);
          }
        },
        
        // Handle payment cancellation
        onCancel: () => {
          setError('Payment was cancelled. Please try again.');
          toast({ 
            title: "Payment Cancelled", 
            description: "You've cancelled the payment process. Your order has not been placed."
          });
        },
        
        // Handle payment errors
        onError: (err: any) => {
          console.error('PayPal error:', err);
          setError('Payment failed. Please try again.');
          onError(err);
          toast({ 
            variant: "destructive", 
            title: "Payment Error", 
            description: "There was an error with the payment process. Please try again later."
          });
        }
      }).render(paypalContainerRef.current);
    }
  }, [scriptLoaded, disabled, formattedTotal, currentUser, onSuccess, onError, router, toast, orderData]);

  return (
    <div>
      {/* Load PayPal SDK */}
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=GBP`}
        onLoad={() => setScriptLoaded(true)}
        onError={() => {
          setError('Failed to load PayPal SDK. Please refresh and try again.');
          toast({ 
            variant: "destructive", 
            title: "PayPal SDK Error", 
            description: "Failed to load PayPal. Please refresh the page and try again."
          });
        }}
      />
      
      {/* PayPal button container */}
      <div ref={paypalContainerRef} className="paypal-button-container mt-4">
        {/* Show loading state while script is loading */}
        {!scriptLoaded && (
          <div className="flex justify-center p-4 border border-border/50 rounded-md bg-muted/40 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading PayPal...</span>
          </div>
        )}
      </div>
      
      {/* Show error message if any */}
      {error && (
        <div className="mt-2 text-sm text-red-500">{error}</div>
      )}
      
      {/* Alternative checkout button when processing */}
      {buttonLoading && (
        <Button disabled className="w-full mt-4">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Payment...
        </Button>
      )}
    </div>
  );
}

