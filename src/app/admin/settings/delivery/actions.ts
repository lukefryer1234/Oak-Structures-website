'use server';

import { z } from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SETTINGS_COLLECTION = 'siteSettings';
const DELIVERY_SETTINGS_DOC_ID = 'deliverySettings';

export interface DeliverySettings {
  freeDeliveryThreshold: number;
  ratePerM3: number;
  minimumDeliveryCharge: number;
}

const deliverySettingsSchema = z.object({
  freeDeliveryThreshold: z.number().min(0, "Free delivery threshold must be non-negative"),
  ratePerM3: z.number().min(0, "Rate per m³ must be non-negative"),
  minimumDeliveryCharge: z.number().min(0, "Minimum delivery charge must be non-negative"),
});

export async function fetchDeliverySettingsAction(): Promise<DeliverySettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, DELIVERY_SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const parsed = deliverySettingsSchema.safeParse(data);
      if (parsed.success) {
        return parsed.data;
      } else {
        console.warn("Fetched delivery settings from Firestore are invalid:", parsed.error.flatten().fieldErrors);
      }
    }
    return { freeDeliveryThreshold: 1000, ratePerM3: 50, minimumDeliveryCharge: 25 }; // Default
  } catch (error) {
    console.error("Error fetching delivery settings:", error);
    return { freeDeliveryThreshold: 1000, ratePerM3: 50, minimumDeliveryCharge: 25 }; // Default on error
  }
}

export interface UpdateDeliverySettingsState {
  message: string;
  success: boolean;
  errors?: z.ZodIssue[];
}

export async function updateDeliverySettingsAction(
  settings: DeliverySettings
): Promise<UpdateDeliverySettingsState> {
  const validatedFields = deliverySettingsSchema.safeParse(settings);

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      success: false,
      errors: validatedFields.error.errors,
    };
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, DELIVERY_SETTINGS_DOC_ID);
    await setDoc(docRef, validatedFields.data, { merge: true });
    return { message: 'Delivery settings updated successfully.', success: true };
  } catch (error) {
    console.error("Error updating delivery settings:", error);
    return { message: 'Failed to update delivery settings.', success: false };
  }
}