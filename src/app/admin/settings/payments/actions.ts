// src/app/admin/settings/payments/actions.ts
'use server';

import { z } from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SETTINGS_COLLECTION = 'siteSettings';
const PAYMENT_SETTINGS_DOC_ID = 'paymentSettings';

export interface PaymentSettings {
  stripeEnabled: boolean;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  paypalEnabled: boolean;
  paypalClientId?: string;
  paypalClientSecret?: string;
  paypalSandboxMode: boolean;
}

const paymentSettingsSchema = z.object({
  stripeEnabled: z.boolean(),
  stripePublishableKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  paypalEnabled: z.boolean(),
  paypalClientId: z.string().optional(),
  paypalClientSecret: z.string().optional(),
  paypalSandboxMode: z.boolean(),
}).refine(data => !data.stripeEnabled || (data.stripePublishableKey && data.stripePublishableKey.trim() !== "" && data.stripeSecretKey && data.stripeSecretKey.trim() !== ""), {
  message: "Stripe Publishable Key and Secret Key are required if Stripe is enabled.",
  path: ["stripePublishableKey", "stripeSecretKey"],
}).refine(data => !data.paypalEnabled || (data.paypalClientId && data.paypalClientId.trim() !== "" && data.paypalClientSecret && data.paypalClientSecret.trim() !== ""), {
  message: "PayPal Client ID and Client Secret are required if PayPal is enabled.",
  path: ["paypalClientId", "paypalClientSecret"],
});

export async function fetchPaymentSettingsAction(): Promise<PaymentSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, PAYMENT_SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
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
        // Fallback to defaults if parsing fails but doc exists
        return {
            stripeEnabled: true, stripePublishableKey: "pk_test_placeholder", stripeSecretKey: "sk_test_placeholder",
            paypalEnabled: true, paypalClientId: "paypal_client_id_placeholder", paypalClientSecret: "paypal_secret_placeholder",
            paypalSandboxMode: true,
         };
      }
    }
     return { // Default if document doesn't exist
        stripeEnabled: true, stripePublishableKey: "pk_test_placeholder", stripeSecretKey: "sk_test_placeholder",
        paypalEnabled: true, paypalClientId: "paypal_client_id_placeholder", paypalClientSecret: "paypal_secret_placeholder",
        paypalSandboxMode: true,
     };
  } catch (error) {
    console.error("Error fetching payment settings:", error);
     return { // Default on any error
        stripeEnabled: true, stripePublishableKey: "pk_test_placeholder", stripeSecretKey: "sk_test_placeholder",
        paypalEnabled: true, paypalClientId: "paypal_client_id_placeholder", paypalClientSecret: "paypal_secret_placeholder",
        paypalSandboxMode: true,
     };
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

  console.warn("Storing payment secret keys directly in Firestore is insecure for production environments. Use environment variables and secure backend services for actual payment processing.");

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, PAYMENT_SETTINGS_DOC_ID);
    // Ensure only defined fields from schema are saved, omitting potentially empty optional fields if not provided
    const dataToSave: Partial<PaymentSettings> = {
        stripeEnabled: validatedFields.data.stripeEnabled,
        paypalEnabled: validatedFields.data.paypalEnabled,
        paypalSandboxMode: validatedFields.data.paypalSandboxMode,
    };
    if (validatedFields.data.stripeEnabled) {
        dataToSave.stripePublishableKey = validatedFields.data.stripePublishableKey;
        dataToSave.stripeSecretKey = validatedFields.data.stripeSecretKey;
    }
    if (validatedFields.data.paypalEnabled) {
        dataToSave.paypalClientId = validatedFields.data.paypalClientId;
        dataToSave.paypalClientSecret = validatedFields.data.paypalClientSecret;
    }

    await setDoc(docRef, dataToSave, { merge: true });
    return { message: 'Payment settings updated successfully.', success: true };
  } catch (error: unknown) {
    console.error("Error updating payment settings:", error);
    let message = 'Failed to update payment settings.';
    if (error instanceof Error) {
        message = error.message;
    }
    return { message, success: false };
  }
}
