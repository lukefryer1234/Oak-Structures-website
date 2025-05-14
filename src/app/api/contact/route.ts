// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import FirebaseServices from '@/services/firebase';

// Contact form schema for validation
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the request data
    const validatedFields = contactSchema.safeParse(body);
    
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
    
    // Add the contact submission to Firestore using our service layer
    await FirebaseServices.firestore.addDocument('contactSubmissions', {
      ...validatedFields.data,
      submittedAt: new Date(),
    });
    
    // Return a success response
    return NextResponse.json({
      message: "Your message has been sent successfully!",
      success: true,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    
    // Return an error response
    return NextResponse.json(
      {
        message: "An error occurred. Please try again later.",
        success: false,
      },
      { status: 500 }
    );
  }
}

