'use server';

import { z } from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from 'firebase/auth';

// Basic schema for an address
const addressSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  town: z.string().min(1),
  postcode: z.string().min(5).max(8),
  phone: z.string().optional(),
});

// Schema for a single item in the order
const orderItemSchema = z.object({
  id: z.string(), // Product ID or unique identifier for the item
  name: z.string(),
  description: z.string(), // Key configuration details
  price: z.number(), // Price per unit
  quantity: z.number().min(1),
  category: z.string(),
  // configuration: z.any().optional(), // Storing the specific configuration chosen by the user
});

// Main schema for the order data
const orderSchema = z.object({
  userId: z.string().optional(), // Optional if guest checkout
  billingAddress: addressSchema,
  shippingAddress: addressSchema.optional(),
  useBillingAsShipping: z.boolean(),
  paymentMethod: z.literal("paypal"), // Only PayPal allowed
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item."),
  subtotal: z.number(),
  shippingCost: z.number(),
  vat: z.number(),
  total: z.number(),
  orderNotes: z.string().optional(),
});

export type OrderData = z.infer<typeof orderSchema>;

export interface PlaceOrderState {
  message: string;
  success: boolean;
  orderId?: string;
  errors?: Record<string, string[] | undefined> | { form?: string[] };
}

export async function placeOrderAction(
  currentUser: User | null, // Pass current user for userId
  orderData: OrderData // Expect the full order data object
): Promise<PlaceOrderState> {
  
  const dataToValidate = {
    ...orderData,
    userId: currentUser?.uid, // Add userId if user is logged in
  };

  const validatedFields = orderSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    console.error("Order validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      message: 'Validation failed. Please check your input.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Simulate payment processing
  // In a real app, this would involve calling PayPal API and handling response
  const paymentSuccessful = true; // Placeholder

  if (!paymentSuccessful) {
    return { message: 'Payment processing failed. Please try again.', success: false, errors: { form: ['Payment failed.'] } };
  }

  try {
    const orderPayload = {
      ...validatedFields.data,
      createdAt: serverTimestamp(),
      status: 'Pending', // Initial order status
    };

    const docRef = await addDoc(collection(db, 'orders'), orderPayload);
    
    // TODO: Send order confirmation email to customer
    // TODO: Send order notification email to admin
    // TODO: Clear the user's basket (if applicable)

    return { 
      message: 'Order placed successfully!', 
      success: true, 
      orderId: docRef.id 
    };
  } catch (error) {
    console.error('Error placing order:', error);
    return { 
      message: 'An error occurred while placing your order. Please try again.', 
      success: false,
      errors: { form: ['Server error.'] }
    };
  }
}