'use server';

import { z } from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SETTINGS_COLLECTION = 'siteSettings';
const ANALYTICS_SETTINGS_DOC_ID = 'analyticsSettings';

export interface AnalyticsSettings {
  googleAnalyticsId: string;
}

const analyticsSettingsSchema = z.object({
  googleAnalyticsId: z.string().optional(), // Allow empty string if not set
});

export async function fetchAnalyticsSettingsAction(): Promise<AnalyticsSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, ANALYTICS_SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const parsed = analyticsSettingsSchema.safeParse(data);
      if (parsed.success) {
        return { googleAnalyticsId: parsed.data.googleAnalyticsId || "" };
      } else {
         console.warn("Fetched analytics settings from Firestore are invalid:", parsed.error.flatten().fieldErrors);
      }
    }
    return { googleAnalyticsId: "" }; // Default
  } catch (error) {
    console.error("Error fetching analytics settings:", error);
    return { googleAnalyticsId: "" }; // Default on error
  }
}

export interface UpdateAnalyticsSettingsState {
  message: string;
  success: boolean;
  errors?: z.ZodIssue[];
}

export async function updateAnalyticsSettingsAction(
  settings: AnalyticsSettings
): Promise<UpdateAnalyticsSettingsState> {
  const validatedFields = analyticsSettingsSchema.safeParse(settings);

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      success: false,
      errors: validatedFields.error.errors,
    };
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, ANALYTICS_SETTINGS_DOC_ID);
    await setDoc(docRef, validatedFields.data, { merge: true });
    return { message: 'Analytics settings updated successfully.', success: true };
  } catch (error) {
    console.error("Error updating analytics settings:", error);
    return { message: 'Failed to update analytics settings.', success: false };
  }
}