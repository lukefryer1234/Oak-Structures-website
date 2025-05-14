"use server";

import { z } from "zod";

const customOrderSchemaServer = z.object({
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
    .optional(), // Added empty string for unselected
  // fileUpload: z.any().optional(), // File upload needs separate handling
  contactMethod: z.enum(["Email", "Phone", ""]).optional(), // Added empty string
  budget: z.string().optional(),
  timescale: z.string().optional(),
});

export interface CustomOrderFormState {
  message: string;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
}

export async function submitCustomOrderForm(
  prevState: CustomOrderFormState,
  formData: FormData,
): Promise<CustomOrderFormState> {
  const rawData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    description: formData.get("description"),
    phone: formData.get("phone") || undefined,
    postcode: formData.get("postcode") || undefined,
    companyName: formData.get("companyName") || undefined,
    productType: formData.get("productType") || undefined,
    contactMethod: formData.get("contactMethod") || undefined,
    budget: formData.get("budget") || undefined,
    timescale: formData.get("timescale") || undefined,
  };

  // For file uploads, you would typically handle them differently in a separate API route
  // For now, we're focusing on the form data submission without files

  const validatedFields = customOrderSchemaServer.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check your input.",
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Call the API route instead of Firebase directly
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/custom-order`, {
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
      message: result.message || "Your custom order inquiry has been submitted successfully!",
      success: true,
    };
  } catch (error) {
    console.error("Error submitting custom order inquiry:", error);
    return {
      message: "An error occurred while submitting your inquiry. Please try again later.",
      success: false,
    };
  }
}
