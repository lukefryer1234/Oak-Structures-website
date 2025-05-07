'use server';

import { z } from 'zod';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    await addDoc(collection(db, 'contactSubmissions'), {
      ...validatedFields.data,
      submittedAt: new Date(),
    });
    return { message: 'Your message has been sent successfully!', success: true };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { message: 'An error occurred. Please try again later.', success: false };
  }
}