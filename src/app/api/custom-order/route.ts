// src/app/api/custom-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import FirebaseServices from '@/services/firebase';

// Custom order schema for validation
const customOrderSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  description: z
    .string()
    .min(10, "Please provide a detailed description (min 10 characters)"),
  phone: z.string().optional(),
  postcode: z.string().optional(),
  companyName: z.string().optional(),
  productType: z
    .enum(["Garage", "Gazebo", "Porch", "Beams", "Flooring", "Other", ""])
    .optional(),
  contactMethod: z.enum(["Email", "Phone", ""]).optional(),
  budget: z.string().optional(),
  timescale: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the request data
    const validatedFields = customOrderSchema.safeParse(body);
    
    if (!validatedFields.success) {
      return NextResponse.json(
        {
          message: "Validation failed. Please check your input.",
          success: false,
          errors: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    
    // Add the custom order inquiry to Firestore using our service layer
    await FirebaseServices.firestore.addDocument('customOrderInquiries', {
      ...validatedFields.data,
      submittedAt: new Date(),
      // File URL would be handled separately if implemented
    });
    
    // Return a success response
    return NextResponse.json({
      message: "Your custom order inquiry has been submitted successfully!",
      success: true,
    });
  } catch (error) {
    console.error("Error submitting custom order inquiry:", error);
    
    // Return an error response
    return NextResponse.json(
      {
        message: "An error occurred while submitting your inquiry. Please try again later.",
        success: false,
      },
      { status: 500 }
    );
  }
}

