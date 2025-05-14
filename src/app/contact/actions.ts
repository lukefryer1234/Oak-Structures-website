"use server";

import { z } from "zod";

// Keep the same schema for validation in the server action
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export interface ContactFormState {
  message: string;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
}

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Extract and validate the form data
  const validatedFields = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check your input.",
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Call the API route instead of Firebase directly
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedFields.data),
    });
    
    // Parse the API response
    const result = await response.json();
    
    if (!response.ok) {
      return {
        message: result.message || "An error occurred. Please try again later.",
        success: false,
        errors: result.errors,
      };
    }
    
    return {
      message: result.message || "Your message has been sent successfully!",
      success: true,
    };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return {
      message: "An error occurred. Please try again later.",
      success: false,
    };
  }
}
