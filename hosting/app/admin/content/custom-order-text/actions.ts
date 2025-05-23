'use server';

import { z } from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SETTINGS_COLLECTION = 'siteSettings';
const CUSTOM_ORDER_TEXT_DOC_ID = 'customOrderIntroText';

const customOrderTextSchema = z.object({
  introText: z.string().max(2000, "Introductory text is too long (max 2000 characters).").optional(),
});

export async function fetchCustomOrderIntroTextAction(): Promise<string> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CUSTOM_ORDER_TEXT_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.introText || ""; // Return text or empty string
    }
    // Default text if document doesn't exist
    return "Use this form to tell us about your bespoke requirements for garages, gazebos, porches, beams, flooring, or any other custom timber project. Provide as much detail as possible, including desired dimensions, materials, features, and intended use. You can also upload sketches or inspiration images. Alternatively, contact us directly via email or phone.";
  } catch (error) {
    console.error("Error fetching custom order intro text:", error);
    return "Error loading introductory text."; // Fallback on error
  }
}

export interface UpdateCustomOrderTextState {
  message: string;
  success: boolean;
  errors?: z.ZodIssue[];
}

export async function updateCustomOrderIntroTextAction(
  text: string
): Promise<UpdateCustomOrderTextState> {
  const validatedFields = customOrderTextSchema.safeParse({ introText: text });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      success: false,
      errors: validatedFields.error.errors,
    };
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CUSTOM_ORDER_TEXT_DOC_ID);
    await setDoc(docRef, { introText: validatedFields.data.introText || "" }, { merge: true });
    return { message: 'Custom order introductory text updated successfully.', success: true };
  } catch (error) {
    console.error("Error updating custom order intro text:", error);
    return { message: 'Failed to update introductory text.', success: false };
  }
}