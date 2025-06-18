// src/app/api/checkout/place-order/route.ts
import { NextResponse } from 'next/server';
import { orderService, CreateOrderDataSchema, type CreateOrderData } from '@/services/domain/order-service'; // Adjust path if needed
import { auth } from '@/lib/auth/server'; // Server-side auth helper
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const session = await auth(); // Get current user session

    // Depending on auth setup, session.user.id might be the Firebase UID
    const userId = session?.user?.id;
    // If guest checkouts are allowed and user is not logged in, userId will be undefined.
    // The CreateOrderDataSchema already marks userId as optional.

    const json = await request.json();

    // Add userId from session if not explicitly passed or if it needs to be authoritative
    const orderDataWithPotentialUserId: CreateOrderData = {
        ...json,
        userId: userId || json.userId, // Prioritize session userId if available
    };

    // Validate the final data structure that will be passed to the service
    const parsedRequest = CreateOrderDataSchema.safeParse(orderDataWithPotentialUserId);

    if (!parsedRequest.success) {
      console.error("Place order API validation failed:", parsedRequest.error.flatten().fieldErrors);
      return NextResponse.json({
        message: 'Invalid order data provided.',
        errors: parsedRequest.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const createdOrder = await orderService.createOrder(parsedRequest.data);

    return NextResponse.json({
      message: 'Order placed successfully!',
      orderId: createdOrder.id,
      order: createdOrder
    }, { status: 201 }); // 201 Created status

  } catch (error: any) {
    console.error('Error in place-order API route:', error);
    if (error.isCustomError && error.name === "CustomError") { // Check name for CustomError
         return NextResponse.json({ message: error.message, details: error.details }, { status: error.statusCode || 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message || 'An unknown error occurred.' }, { status: 500 });
  }
}
