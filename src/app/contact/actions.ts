// src/app/contact/actions.ts
'use server';

import { z } from 'zod';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SimpleGoogleSheetsService } from '@/lib/google-sheets';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

export interface ContactFormState {
  message: string;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
}

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your input.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Save to Firebase
    await addDoc(collection(db, 'contactSubmissions'), {
      ...validatedFields.data,
      submittedAt: new Date(),
    });

    // Also save to Google Sheets (if configured)
    try {
      const sheetsService = new SimpleGoogleSheetsService();
      await sheetsService.appendFormSubmission({
        name: validatedFields.data.name,
        email: validatedFields.data.email,
        message: validatedFields.data.message,
        timestamp: new Date(),
        source: 'Contact Form',
      });
    } catch (sheetsError) {
      console.warn('Failed to save to Google Sheets:', sheetsError);
      // Continue execution - don't fail the entire form submission
    }

    return { message: 'Your message has been sent successfully!', success: true };
  } catch (error: unknown) {
    console.error('Error submitting contact form:', error);
    let errorMessage = 'An error occurred. Please try again later.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { message: errorMessage, success: false };
  }
}
