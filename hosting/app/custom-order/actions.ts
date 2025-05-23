'use server';

import { z } from 'zod';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const customOrderSchemaServer = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  description: z.string().min(10, "Please provide a detailed description (min 10 characters)"),
  phone: z.string().optional(),
  postcode: z.string().optional(),
  companyName: z.string().optional(),
  productType: z.enum(["Garage", "Gazebo", "Porch", "Beams", "Flooring", "Other", ""]).optional(), // Added empty string for unselected
  // fileUpload: z.any().optional(), // File upload needs separate handling, cannot be directly passed through FormData like this to server actions for storage.
  contactMethod: z.enum(["Email", "Phone", ""]).optional(),  // Added empty string
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
  formData: FormData
): Promise<CustomOrderFormState> {
  const rawData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    description: formData.get('description'),
    phone: formData.get('phone') || undefined,
    postcode: formData.get('postcode') || undefined,
    companyName: formData.get('companyName') || undefined,
    productType: formData.get('productType') || undefined,
    contactMethod: formData.get('contactMethod') || undefined,
    budget: formData.get('budget') || undefined,
    timescale: formData.get('timescale') || undefined,
  };
  
  // For file uploads, you would typically handle them differently,
  // e.g., upload to cloud storage and store the URL.
  // const file = formData.get('fileUpload');
  // if (file instanceof File && file.size > 0) {
  //   // Handle file upload logic here
  // }

  const validatedFields = customOrderSchemaServer.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your input.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await addDoc(collection(db, 'customOrderInquiries'), {
      ...validatedFields.data,
      submittedAt: new Date(),
      // fileUrl: 'placeholder_for_file_url_if_uploaded' // Store file URL if implemented
    });
    return { message: 'Your custom order inquiry has been submitted successfully!', success: true };
  } catch (error) {
    console.error('Error submitting custom order inquiry:', error);
    return { message: 'An error occurred while submitting your inquiry. Please try again later.', success: false };
  }
}