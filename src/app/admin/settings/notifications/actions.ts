'use server';

import { z } from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SETTINGS_COLLECTION = 'siteSettings';
const NOTIFICATION_SETTINGS_DOC_ID = 'notificationSettings';

export interface NotificationSettings {
  adminEmailAddresses: string; // Comma-separated list
}

const notificationSettingsSchema = z.object({
  adminEmailAddresses: z.string().refine(value => {
    if (!value) return true; // Allow empty if no emails
    return value.split(',').every(email => z.string().email().safeParse(email.trim()).success);
  }, "One or more email addresses are invalid. Please provide a comma-separated list of valid emails."),
});


export async function fetchNotificationSettingsAction(): Promise<NotificationSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, NOTIFICATION_SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const parsed = notificationSettingsSchema.safeParse(data);
      if (parsed.success) {
        return parsed.data;
      } else {
        console.warn("Fetched notification settings from Firestore are invalid:", parsed.error.flatten().fieldErrors);
      }
    }
    return { adminEmailAddresses: "admin@timberline.com" }; // Default
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return { adminEmailAddresses: "admin@timberline.com" }; // Default on error
  }
}

export interface UpdateNotificationSettingsState {
  message: string;
  success: boolean;
  errors?: z.ZodIssue[];
}

export async function updateNotificationSettingsAction(
  settings: NotificationSettings
): Promise<UpdateNotificationSettingsState> {
   const cleanedEmails = settings.adminEmailAddresses.split(',').map(e => e.trim()).filter(Boolean).join(',');
   const settingsToValidate = { ...settings, adminEmailAddresses: cleanedEmails };

  const validatedFields = notificationSettingsSchema.safeParse(settingsToValidate);

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      success: false,
      errors: validatedFields.error.errors,
    };
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, NOTIFICATION_SETTINGS_DOC_ID);
    await setDoc(docRef, validatedFields.data, { merge: true });
    return { message: 'Admin notification settings updated successfully.', success: true };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return { message: 'Failed to update notification settings.', success: false };
  }
}