'use server';

import { z } from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SETTINGS_COLLECTION = 'siteSettings';
const PAYMENT_SETTINGS_DOC_ID = 'paymentSettings';

export interface PaymentSettings {
  stripeEnabled: boolean;
  stripePublishableKey?: string; // Make optional to match schema
  stripeSecretKey?: string;     // Make optional to match schema
  paypalEnabled: boolean;
  paypalClientId?: string;     // Make optional to match schema
  paypalClientSecret?: string; // Make optional to match schema
  paypalSandboxMode: boolean;
}

const paymentSettingsSchema = z.object({
  stripeEnabled: z.boolean(),
  stripePublishableKey: z.string().optional(), // Optional if not enabled
  stripeSecretKey: z.string().optional(), // Optional if not enabled
  paypalEnabled: z.boolean(),
  paypalClientId: z.string().optional(), // Optional if not enabled
  paypalClientSecret: z.string().optional(), // Optional if not enabled
  paypalSandboxMode: z.boolean(),
}).refine(data => !data.stripeEnabled || (data.stripePublishableKey && data.stripeSecretKey), {
  message: "Stripe keys are required if Stripe is enabled.",
  path: ["stripePublishableKey", "stripeSecretKey"],
}).refine(data => !data.paypalEnabled || (data.paypalClientId && data.paypalClientSecret), {
  message: "PayPal credentials are required if PayPal is enabled.",
  path: ["paypalClientId", "paypalClientSecret"],
});


export async function fetchPaymentSettingsAction(): Promise<PaymentSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, PAYMENT_SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Provide defaults for missing fields before parsing
      const dataWithDefaults = {
        stripeEnabled: data.stripeEnabled ?? false,
        stripePublishableKey: data.stripePublishableKey ?? "",
        stripeSecretKey: data.stripeSecretKey ?? "",
        paypalEnabled: data.paypalEnabled ?? false,
        paypalClientId: data.paypalClientId ?? "",
        paypalClientSecret: data.paypalClientSecret ?? "",
        paypalSandboxMode: data.paypalSandboxMode ?? true,
      };
      const parsed = paymentSettingsSchema.safeParse(dataWithDefaults);
      if (parsed.success) {
        return parsed.data;
      } else {
        console.warn("Fetched payment settings from Firestore are invalid:", parsed.error.flatten().fieldErrors);
      }
    }
     return {
        stripeEnabled: true, stripePublishableKey: "pk_test_...", stripeSecretKey: "sk_test_...",
        paypalEnabled: true, paypalClientId: "PayPalClientID...", paypalClientSecret: "PayPalSecret...",
        paypalSandboxMode: true,
     }; // Default
  } catch (error) {
    console.error("Error fetching payment settings:", error);
     return {
        stripeEnabled: true, stripePublishableKey: "pk_test_...", stripeSecretKey: "sk_test_...",
        paypalEnabled: true, paypalClientId: "PayPalClientID...", paypalClientSecret: "PayPalSecret...",
        paypalSandboxMode: true,
     }; // Default on error
  }
}

export interface UpdatePaymentSettingsState {
  message: string;
  success: boolean;
  errors?: z.ZodIssue[];
}

export async function updatePaymentSettingsAction(
  settings: PaymentSettings
): Promise<UpdatePaymentSettingsState> {
  const validatedFields = paymentSettingsSchema.safeParse(settings);

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      success: false,
      errors: validatedFields.error.errors,
    };
  }
  
  // IMPORTANT: In a real production app, secret keys should NOT be stored directly in Firestore
  // or passed around like this. They should be managed via secure environment variables on the server
  // and Cloud Functions. This is a simplified example for demonstration.
  // For actual payment processing, you'd use these keys within secure Cloud Functions.
  console.warn("Storing payment secret keys in Firestore is insecure for production environments. Use environment variables and secure backend services.");


  try {
    const docRef = doc(db, SETTINGS_COLLECTION, PAYMENT_SETTINGS_DOC_ID);
    await setDoc(docRef, validatedFields.data, { merge: true });
    return { message: 'Payment settings updated successfully.', success: true };
  } catch (error) {
    console.error("Error updating payment settings:", error);
    return { message: 'Failed to update payment settings.', success: false };
  }
}