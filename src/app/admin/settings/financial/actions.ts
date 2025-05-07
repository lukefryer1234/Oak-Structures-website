'use server';

import { z } from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SETTINGS_COLLECTION = 'siteSettings';
const FINANCIAL_SETTINGS_DOC_ID = 'financialSettings';

export interface FinancialSettings {
  currencySymbol: string;
  vatRate: number;
}

const financialSettingsSchema = z.object({
  currencySymbol: z.string().min(1, "Currency symbol is required").max(5),
  vatRate: z.number().min(0, "VAT rate cannot be negative").max(100, "VAT rate seems too high"),
});

export async function fetchFinancialSettingsAction(): Promise<FinancialSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, FINANCIAL_SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const parsed = financialSettingsSchema.safeParse(data);
      if (parsed.success) {
        return parsed.data;
      } else {
        console.warn("Fetched financial settings from Firestore are invalid:", parsed.error.flatten().fieldErrors);
      }
    }
    return { currencySymbol: "£", vatRate: 20 }; // Default
  } catch (error) {
    console.error("Error fetching financial settings:", error);
    return { currencySymbol: "£", vatRate: 20 }; // Default on error
  }
}

export interface UpdateFinancialSettingsState {
  message: string;
  success: boolean;
  errors?: z.ZodIssue[];
}

export async function updateFinancialSettingsAction(
  settings: FinancialSettings
): Promise<UpdateFinancialSettingsState> {
  const validatedFields = financialSettingsSchema.safeParse(settings);

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      success: false,
      errors: validatedFields.error.errors,
    };
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, FINANCIAL_SETTINGS_DOC_ID);
    await setDoc(docRef, validatedFields.data, { merge: true });
    return { message: 'Financial settings updated successfully.', success: true };
  } catch (error) {
    console.error("Error updating financial settings:", error);
    return { message: 'Failed to update financial settings.', success: false };
  }
}